import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { z, ZodError } from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const error = createHttpError(
          400,
          err.issues.map((e) => e.message).join(", ")
        );
        return next(error);
      }
      const error = createHttpError(
        500,
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return next(error);
    }
  };
};
