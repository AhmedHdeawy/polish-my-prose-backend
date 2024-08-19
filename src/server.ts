import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { groqRouter } from "./api/groq/groqRouter";
import verifyToken from "./common/middleware/verifyToken";
import { ServiceResponse } from "./common/models/serviceResponse";
import { handleServiceResponse } from "./common/utils/httpHandlers";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/groq", verifyToken, groqRouter);


app.use('/', (req, res) => {
    return handleServiceResponse(ServiceResponse.success("Welcome to the Polish My Prose Backend", null), res);
});

// Error handlers
app.use(errorHandler());

export { app, logger };
