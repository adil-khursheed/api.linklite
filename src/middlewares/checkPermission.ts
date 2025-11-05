import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { TUser } from "../types/user";
import { Permission } from "../types/workspaceMembership";
import WorkspaceMembership from "../workspaceMembership/workspaceMembershipModel";
import Workspace from "../workspace/workspaceModel";

export const requirePermission = (requiredPermission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as TUser;
      const workspace_slug = req.params.workspace_slug;

      if (!user) {
        const error = createHttpError(401, "Unauthorized request");
        return next(error);
      }

      if (!workspace_slug) {
        const error = createHttpError(
          400,
          "Workspace slug is required for permission check"
        );
        return next(error);
      }

      const workspace = await Workspace.findOne({ slug: workspace_slug });
      if (!workspace) {
        const error = createHttpError(404, "Workspace not found");
        return next(error);
      }

      const membership = await WorkspaceMembership.findOne({
        user_id: user._id,
        workspace_id: workspace._id,
      });

      if (!membership) {
        const error = createHttpError(
          403,
          "You are not a member of this workspace"
        );
        return next(error);
      }

      if (!membership.permissions.includes(requiredPermission)) {
        const error = createHttpError(
          403,
          "You do not have the required permission to perform this action"
        );
        return next(error);
      }

      next();
    } catch (err) {
      const error = createHttpError(
        500,
        err instanceof Error
          ? err.message
          : "An unknown error occurred while checking permissions"
      );
      return next(error);
    }
  };
};
