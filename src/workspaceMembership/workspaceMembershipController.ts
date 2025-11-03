import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { sendInviteEmailQueue } from "../services/bullmq/producer";
import { _config } from "../config/config";
import Workspace from "../workspace/workspaceModel";
import WorkspaceMembership from "./workspaceMembershipModel";

export const inviteTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emails } = req.body;
    const { workspace_slug } = req.params;

    if (!Array.isArray(emails)) {
      const error = createHttpError(400, "Emails must be an array");
      return next(error);
    }

    if (!workspace_slug) {
      const error = createHttpError(400, "Workspace slug is required");
      return next(error);
    }

    const workspace = await Workspace.findOne({
      slug: workspace_slug,
    });
    if (!workspace) {
      const error = createHttpError(404, "Workspace not found");
      return next(error);
    }

    // Start database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check current member count within transaction to prevent race conditions
      const currentCount = await WorkspaceMembership.countDocuments({
        workspace_id: workspace._id,
        status: { $in: ["pending", "accepted"] },
      }).session(session);

      // Validate limit before creating any invites
      if (currentCount + emails.length > workspace.members_limit) {
        await session.abortTransaction();
        const error = createHttpError(400, "Workspace members limit reached");
        return next(error);
      }

      const inviteTokenSecret = _config.invite_token_secret as string;

      // Create all memberships within the transaction
      const createdMemberships = await Promise.all(
        emails.map(async (email) => {
          const inviteToken = jwt.sign(
            { workspace_id: workspace._id },
            inviteTokenSecret,
            { expiresIn: "14d" }
          );

          const [membership] = await WorkspaceMembership.create(
            [
              {
                workspace_id: workspace._id,
                email: email.email,
                role: email.role,
                token: inviteToken,
                invited_by: req.user?._id,
                expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            ],
            { session }
          );

          return { membership, email: email.email };
        })
      );

      // Commit transaction - all memberships created successfully
      await session.commitTransaction();

      // Send invite emails AFTER successful database commit
      await Promise.all(
        createdMemberships.map(({ membership, email }) =>
          sendInviteEmailQueue.add("invite_email", {
            options: {
              email: email,
              subject: "Invite to join Workspace",
              type: "invite-workspace",
              data: {
                workspaceName: workspace.name,
                inviteLink: `${_config.frontend_url_2}/invite/${membership.token}`,
              },
            },
          })
        )
      );
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      // Always end the session
      session.endSession();
    }

    res.status(200).json({
      success: true,
      message: "Invite emails sent successfully",
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating the invite"
    );
    return next(error);
  }
};
