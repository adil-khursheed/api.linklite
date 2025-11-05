import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Workspace from "../workspace/workspaceModel";
import Tag from "./tagModel";

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspace_slug } = req.params;
  if (!workspace_slug) {
    const error = createHttpError(
      400,
      "Missing required fields: workspace_slug"
    );
    return next(error);
  }

  const workspace = await Workspace.findOne({ slug: workspace_slug });
  if (!workspace) {
    const error = createHttpError(404, "Workspace not found");
    return next(error);
  }

  const tags = await Tag.find({ workspace_id: workspace._id });

  res.status(200).json({
    success: true,
    message: "Tag created successfully",
    tags,
  });
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const { workspace_slug } = req.params;
    if (!workspace_slug) {
      const error = createHttpError(
        400,
        "Missing required parameter: workspace_slug"
      );
      return next(error);
    }

    if (!name) {
      const error = createHttpError(
        400,
        "Missing required fields: name and workspace_slug"
      );
      return next(error);
    }

    const workspace = await Workspace.findOne({ slug: workspace_slug });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    if (workspace.tags_created >= workspace.tags_limit) {
      const error = createHttpError(400, "Tag limit reached");
      return next(error);
    }

    const tag = await Tag.create({
      name,
      workspace_id: workspace._id,
    });

    workspace.tags_created += 1;
    await workspace.save();

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the tag"
    );
    return next(error);
  }
};
