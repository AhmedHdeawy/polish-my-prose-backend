import { StatusCodes } from "http-status-codes";
import Groq from "groq-sdk";
import type { Groq as GroqModel, ParsedGroqResponse } from "@/api/groq/groqModel";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import { env } from "@/common/utils/envConfig";
const groq = new Groq({ apiKey: env.GROQ_API_KEY });


export class GroqService {

  async polishText(content: string): Promise<ServiceResponse<GroqModel | null>> {
    try {

      const chatCompletion = await this.getGroqChatCompletion(content);
      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (generatedText) {
        const parsedResponse = this.parseGroqResponse(generatedText);
        if (parsedResponse) {
          return ServiceResponse.success<GroqModel>("Text polished", {
            correct_content: parsedResponse.correct_content,
            best_content: parsedResponse.best_content
          });
        }
      }

      return ServiceResponse.failure("An error occurred while polishing your content, please try again!.", null, StatusCodes.BAD_REQUEST);

    } catch (ex) {
      const errorMessage = `Error polishing your content ${content}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while polishing your content.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  private parseGroqResponse(response: string): ParsedGroqResponse | null {

    logger.info(`Response ${response}`);

    try {
      const parsedResponse = JSON.parse(response)
      return {
        correct_content: parsedResponse.correct_content,
        best_content: parsedResponse.best_content
      }
    } catch (error) {
      logger.error(`Error parsing Groq response ${response} : ${(error as Error).message}`);
      return null;
    }
  }

  async getGroqChatCompletion(content: string) {
    const instructions = "Improve the following English text by correcting any grammar or typos, and then provide a more polished and effective alternative version. and Please provide your response in JSON format, using the two keys 'correct_content' and 'best_content'. Ensure your response contains only the JSON, without any additional text or information. The Text is: ";

    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are a English language expert.",
        },
        {
          role: "user",
          content: instructions + content,
        },
      ],
      model: "llama3-8b-8192",
    });
  }
}

export const groqService = new GroqService();
