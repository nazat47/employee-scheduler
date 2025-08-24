import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import { routeNotFound } from "./middlewares/not-found";
import { globalErrorHandler } from "./middlewares/error-handler";
import routes from "./routes/index";
import path from "path";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.get("/health", (req, res) => {
  res.send("Server is up and running");
});

app.use("/api/v1", routes);

app.use(routeNotFound);
app.use(globalErrorHandler);

export default app;
