import { NextFunction, Request, Response } from "express";
import Workspace from "./workspaceModel";
import createHttpError from "http-errors";
import redis from "../services/redis";
import User from "../user/userModel";

export const checkWorkspaceSlugs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.body;
  if (!slug) {
    const error = createHttpError(400, "Slug is required");
    return next(error);
  }

  const slugExists = await redis?.sismember("workspace", `${slug}`);

  if (slugExists) {
    const error = createHttpError(409, "Slug already exists");
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: "Slug is available",
  });
};

export const createWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug } = req.body;

    if ([name, slug].some((item) => item.trim() === "")) {
      const error = createHttpError(400, "Name and slug are required");
      return next(error);
    }

    const existingSlug = await redis.sismember("workspace", `${slug}`);
    if (existingSlug) {
      const error = createHttpError(409, "Slug already exists");
      return next(error);
    }

    const userId = req.user?._id;

    if (!userId) {
      const error = createHttpError(400, "UserId not found");
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = createHttpError(400, "User not found");
      return next(error);
    }

    if (user.workspaces.length >= user.workspace_limit) {
      const error = createHttpError(400, "Workspace limit reached");
      return next(error);
    }

    const workspace = await Workspace.create({
      name,
      slug,
      members: [userId],
      created_by: userId,
    });

    await redis?.sadd("workspace", [`${slug}`]);

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { workspaces: workspace._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the workspace"
    );
    return next(error);
  }
};
