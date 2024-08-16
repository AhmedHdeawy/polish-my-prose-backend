import { StatusCodes } from "http-status-codes";
import Groq from "groq-sdk";
import type { Groq as GroqModel, ParsedGroqResponse } from "@/api/groq/groqModel";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import { env } from "@/common/utils/envConfig";
const groq = new Groq({ apiKey: env.GROQ_API_KEY });


export class GroqService {

  async polishText(content: string, lang: string): Promise<ServiceResponse<GroqModel | null>> {
    try {

      lang = this.languageMapper(lang);

      const chatCompletion = await this.getGroqChatCompletion(content, lang);
      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (generatedText) {
        const parsedResponse = this.parseGroqResponse(generatedText);
        if (parsedResponse) {
          return ServiceResponse.success<GroqModel>("Text polished", {
            original_version: content,
            correct_version: parsedResponse.correct_version,
            best_version: parsedResponse.best_version
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

  private languageMapper(lang: string): string {
    switch (lang) {
      case "en":
        return "English";
      case "es":
        return "Spanish";
      case "de":
        return "German";
      case "ar":
        return "Arabic";
      default:
        return "English";
    }
  }

  private parseGroqResponse(response: string): ParsedGroqResponse | null {

    logger.info(`Response ${response}`);

    try {
      const parsedResponse = JSON.parse(response)
      return {
        correct_version: parsedResponse.correct_version,
        best_version: parsedResponse.best_version
      }
    } catch (error) {
      logger.error(`Error parsing Groq response ${response} : ${(error as Error).message}`);
      return null;
    }
  }

  async getGroqChatCompletion(content: string, lang: string = "en") {
    const instructions = "Improve the following " + lang + " text by correcting any grammar or typos, and then provide a more polished and effective alternative version. and Please provide your response in JSON format, using the two keys 'correct_version' and 'best_version'. Ensure your response contains only the JSON, without any additional text or information or ```. The Text is: ";

    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `you are a ${lang} language expert.`,
        },
        {
          role: "user",
          content: instructions + content,
        },
      ],
      // model: "llama-3.1-70b-versatile",
      model: "gemma2-9b-it",
    });
  }
}

export const groqService = new GroqService();
