import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Workspace from "../workspace/workspaceModel";
import { extractHtmlMetadata } from "../utils/extractHtmlMetadata";
import Url from "./urlModel";
import { TLinkMetadata, TUrl } from "../types/url";

export const scrapeMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = req.body;
    if (!url) {
      const error = createHttpError(400, "URL is required");
      return next(error);
    }

    const metadata = await extractHtmlMetadata(url);
    res.json({ success: true, metadata });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the URL"
    );
    return next(error);
  }
};

export const getUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspace_slug } = req.params;
    const workspace = await Workspace.findOne({ slug: workspace_slug });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }
    const urls: TUrl[] = await Url.aggregate([
      {
        $match: {
          workspace_id: workspace._id,
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },
    ]);

    res.json({ success: true, message: "Urls fetched successfully", urls });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while fetching the URLs"
    );
    return next(error);
  }
};

export const createUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      workspace_slug,
      destination_url,
      short_link_id,
      domain,
      tags,
      comment,
      url_metadata,
    } = req.body;

    if (!destination_url || !workspace_slug || !short_link_id || !domain) {
      const error = createHttpError(
        400,
        "Destination url or workspace id or short link id or domain is missing"
      );
      return next(error);
    }

    const workspace = await Workspace.findOne({ slug: workspace_slug });

    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    if (workspace.links_created >= workspace.short_links_limit) {
      const error = createHttpError(400, "Short links limit exceeded");
      return next(error);
    }

    const link_metadata = {} as TLinkMetadata;

    if (url_metadata && url_metadata.title) {
      link_metadata.title = url_metadata.title;
    }

    if (url_metadata && url_metadata.description) {
      link_metadata.description = url_metadata.description;
    }

    if (url_metadata && url_metadata.favicon) {
      link_metadata.favicon = url_metadata.favicon;
    }

    if (url_metadata && url_metadata.og_image) {
      link_metadata.og_image = url_metadata.image;
    }

    const url = await Url.create({
      workspace_id: workspace._id,
      domain,
      short_link_id,
      destination_url,
      tags,
      comment,
      link_metadata,
    });

    workspace.links_created += 1;

    await workspace.save();

    res.status(201).json({
      success: true,
      message: "URL created successfully.",
      url,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the URL"
    );
    return next(error);
  }
};
