import express, { NextFunction, Request, Response } from "express";
import expressWinston from "express-winston";
import winston from "winston";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { _config } from "./config/config";

import userRoutes from "./user/userRoutes.js";
import urlRoutes from "./urls/urlRoutes.js";
import createHttpError from "http-errors";
import Url from "./urls/urlModel";

const app = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontend_url = _config.frontend_url as string;
const allowedOrigins = [frontend_url];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Welcome to LinkLite API👋" });
});

app.get(
  "/:shortLinkId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shortLinkId } = req.params;
      if (!shortLinkId) {
        const error = createHttpError(400, "Short link ID is required");
        return next(error);
      }

      const url = await Url.findOneAndUpdate(
        { shortLinkId },
        { $push: { clicksHistory: { timeStamp: Date.now() } } },
        { new: true }
      );

      if (!url) {
        const error = createHttpError(404, "URL not found");
        return next(error);
      }

      res.redirect(url.originalLink);
    } catch (err) {
      const error = createHttpError(
        500,
        err instanceof Error
          ? err.message
          : "An unknown error occurred while redirecting to the original link"
      );
      return next(error);
    }
  }
);

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/urls", urlRoutes);

app.use(globalErrorHandler);
export { app };
