import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Workspace from "../workspace/workspaceModel";
import WorkspaceMembership from "./workspaceMembershipModel";

export const getWorkspaceMembers = async (
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

    const workspace = await Workspace.findOne({ slug: workspace_slug });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    const members = await WorkspaceMembership.aggregate([
      {
        $match: {
          workspace_id: workspace._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                display_name: 1,
                email: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$user",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace members fetched successfully",
      members,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the membership"
    );
    return next(error);
  }
};
