import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";

import Url from "./urlModel";
import Workspace from "../workspace/workspaceModel";

export const createUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originalLink, workspace_id } = req.body;
    if (!originalLink) {
      const error = createHttpError(400, "Original link is required");
      return next(error);
    }

    const workspace = await Workspace.findById(req.user?._id);
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    if (workspace.short_links_limit <= 0) {
      const error = createHttpError(400, "Short links limit exceeded");
      return next(error);
    }

    // const url = await Url.create({
    //   user_id: user._id,
    //   short_link_id: nanoid(8),
    //   original_link: originalLink,
    // });

    // user.short_links_limit -= 1;

    // await user.save();

    res.status(201).json({
      success: true,
      message: "URL created successfully.",
      // url,
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
