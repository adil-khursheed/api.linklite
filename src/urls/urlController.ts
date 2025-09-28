import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Workspace from "../workspace/workspaceModel";
import { extractHtmlMetadata } from "../utils/extractHtmlMetadata";
import Url from "./urlModel";

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

export const createUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      workspace_id,
      destination_url,
      short_link_id,
      domain,
      tags,
      comment,
      link_metadata,
    } = req.body;

    if (!destination_url || !workspace_id || !short_link_id || !domain) {
      const error = createHttpError(
        400,
        "Destination url or workspace id or short link id or domain is missing"
      );
      return next(error);
    }

    const workspace = await Workspace.findById(workspace_id);

    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    if (workspace.links_created >= workspace.short_links_limit) {
      const error = createHttpError(400, "Short links limit exceeded");
      return next(error);
    }

    const url = await Url.create({
      workspace_id,
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
