import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import redis from "../services/redis";

import Workspace from "./workspaceModel";
import User from "../user/userModel";
import WorkspaceMembership from "../workspaceMembership/workspaceMembershipModel";
import Url from "../urls/urlModel";
import Tag from "../tag/tagModel";

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

export const getAllWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaces = await Workspace.aggregate([
      {
        $match: {
          created_by: req.user?._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
          pipeline: [
            {
              $project: {
                _id: 1,
                email: 1,
                display_name: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "created_by",
          pipeline: [
            {
              $project: {
                _id: 1,
                email: 1,
                display_name: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$created_by",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while fetching workspaces"
    );
    return next(error);
  }
};

export const getWorkspaceBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspace_slug } = req.params;

  if (!workspace_slug) {
    const error = createHttpError(400, "Workspace slug is required");
    return next(error);
  }

  const workspace = await Workspace.aggregate([
    {
      $match: {
        slug: workspace_slug,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members",
        pipeline: [
          {
            $project: {
              _id: 1,
              email: 1,
              display_name: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "created_by",
        foreignField: "_id",
        as: "created_by",
        pipeline: [
          {
            $project: {
              _id: 1,
              email: 1,
              display_name: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$created_by",
    },
  ]);

  if (!workspace.length) {
    const error = createHttpError(404, "Workspace not found");
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: "Workspace fetched successfully",
    workspace: workspace[0],
  });
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
      created_by: user._id,
      billing_cycle_start: new Date(Date.now()).getDate(),
    });

    await redis?.sadd("workspace", [`${slug}`]);

    await WorkspaceMembership.create({
      workspace_id: workspace._id,
      user_id: user._id,
      role: "ws:owner",
      permissions: [
        "ws:update",
        "ws:delete",
        "ws:manage_billing",
        "ws:view_settings",
        "ws:members:invite",
        "ws:members:remove",
        "ws:members:update_role",
        "ws:members:view",
        "ws:links:create",
        "ws:links:update",
        "ws:links:delete",
        "ws:links:view",
        "ws:tags:create",
        "ws:tags:update",
        "ws:tags:delete",
        "ws:tags:view",
      ],
    });

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

export const updateWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug } = req.body;
    if (!name && !slug) {
      const error = createHttpError(400, "Name and slug are required");
      return next(error);
    }

    const { workspace_slug } = req.params;
    if (!workspace_slug) {
      const error = createHttpError(400, "Workspace slug is required");
      return next(error);
    }

    const workspace = await Workspace.findOne({ slug: workspace_slug });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    if (name) workspace.name = name;
    if (slug) workspace.slug = slug;

    workspace.updated_at = new Date(Date.now());
    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while updating the workspace"
    );
    return next(error);
  }
};

export const deleteWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspace_slug } = req.params;
    if (!workspace_slug) {
      const error = createHttpError(400, "Workspace slug is required");
      return next(error);
    }

    const workspace = await Workspace.findOneAndDelete({
      slug: workspace_slug,
      created_by: req.user?._id,
    });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    await redis?.srem("workspace", [`${workspace_slug}`]);

    // Get all members of the workspace
    const workspaceMemberships = await WorkspaceMembership.find({
      workspace_id: workspace._id,
    });

    // Get all user IDs who have this workspace as their default
    const memberUserIds = workspaceMemberships.map((member) => member.user_id);

    // Find users who have this workspace as their default
    const usersWithDefaultWorkspace = await User.find({
      _id: { $in: memberUserIds },
      default_workspace: workspace_slug,
    });

    // For each user with this as default workspace, find a new default
    for (const user of usersWithDefaultWorkspace) {
      // Find another workspace the user is a member of
      const otherMembership = await WorkspaceMembership.findOne({
        user_id: user._id,
        workspace_id: { $ne: workspace._id },
      }).populate("workspace_id");

      if (otherMembership) {
        // Set the new default workspace
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              default_workspace: (
                otherMembership.workspace_id as unknown as { slug: string }
              )?.slug,
            },
          }
        );
      } else {
        // No other workspaces, set to null
        await User.updateOne(
          { _id: user._id },
          { $set: { default_workspace: null } }
        );
      }
    }

    // Delete all workspace memberships
    await WorkspaceMembership.deleteMany({
      workspace_id: workspace._id,
    });

    // Delete all links and tags associated with this workspace
    await Promise.all([
      Url.deleteMany({
        workspace_id: workspace._id,
      }),
      Tag.deleteMany({
        workspace_id: workspace._id,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while deleting the workspace"
    );
    return next(error);
  }
};
