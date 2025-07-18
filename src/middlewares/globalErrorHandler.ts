import { Request, Response } from "express";
import { HttpError } from "http-errors";
import { _config } from "../config/config";

const globalErrorHandler = async (
  err: HttpError,
  req: Request,
  res: Response
) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message,
    errorStack: _config.nodeEnv === "development" ? err.stack : "",
  });
};

export default globalErrorHandler;
