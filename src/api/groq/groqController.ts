import type { Request, RequestHandler, Response } from "express";

import { groqService } from "@/api/groq/groqService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class GroqController {
    public polishText: RequestHandler = async (req: Request, res: Response) => {
    const content = req.body.content;
    const serviceResponse = await groqService.polishText(content);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const groqController = new GroqController();
