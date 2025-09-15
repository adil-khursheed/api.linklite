import { NextFunction, Request, Response } from "express";
import Workspace from "./workspaceModel";
import createHttpError from "http-errors";
import redis from "../services/redis";
import User from "../user/userModel";
import { nanoid } from "nanoid";

export const countWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      const error = createHttpError(400, "User not found");
      return next(error);
    }

    const count = await Workspace.countDocuments({
      created_by: userId,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while counting the workspaces"
    );
    return next(error);
  }
};

export const checkWorkspaceSlugs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    const existing_workspace = await Workspace.findOne({
      slug,
    });
    if (existing_workspace) {
      const error = createHttpError(409, "Slug already exists");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Slug is available",
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while checking the workspace slug"
    );
    return next(error);
  }
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

    const existing_slug = await redis.sismember("workspace", `${slug}`);
    if (existing_slug) {
      const error = createHttpError(409, "Slug already exists");
      return next(error);
    }

    const existing_workspace = await Workspace.findOne({
      slug,
    });

    if (existing_workspace) {
      const error = createHttpError(409, "Slug already exists");
      return next(error);
    }

    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      const error = createHttpError(400, "User not found");
      return next(error);
    }

    const existing_workspaces = await Workspace.find({
      created_by: userId,
    });

    if (existing_workspaces.length >= user.workspace_limit) {
      const error = createHttpError(400, "Workspace limit reached");
      return next(error);
    }

    const workspace = await Workspace.create({
      name,
      slug,
      members: [userId],
      created_by: userId,
      invite_code: nanoid(10),
      billing_cycle_start: new Date(Date.now()).getDate(),
    });

    await redis?.sadd("workspace", [`${slug}`]);

    if (existing_workspaces.length === 0) {
      user.default_workspace = workspace.slug;
      user.onboarded = true;
      await user.save();
    }

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
