import express, { type Router } from "express";
import { groqController } from "./groqController";
import { validateRequest } from "@/common/utils/httpHandlers";
import { GetGroqSchema } from "./groqModel";


export const groqRouter: Router = express.Router();


groqRouter.post("/polish", validateRequest(GetGroqSchema), groqController.polishText);
