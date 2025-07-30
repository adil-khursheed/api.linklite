import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import { _config } from "../config/config";

import User from "../user/userModel";
import Url from "./urlModel";

export const createUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originalLink } = req.body;
    if (!originalLink) {
      const error = createHttpError(400, "Original link is required");
      return next(error);
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }

    if (user.short_links_limit <= 0) {
      const error = createHttpError(400, "Short links limit exceeded");
      return next(error);
    }

    const shortLinkId = nanoid(8);

    const url = await Url.create({
      user_id: user._id,
      short_link_id: shortLinkId,
      original_link: originalLink,
    });

    user.short_links_limit -= 1;

    await user.save();

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
