import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Groq = z.infer<typeof GroqSchema>;
export const GroqSchema = z.object({
  lang: z.string(),
  original_version: z.string(),
  correct_version: z.string(),
  best_version: z.string()
});


export const GetGroqSchema = z.object({
  body: z.object({ content: z.string().min(1).max(1500), lang: z.enum(["english", "arabic", "spanish", "french", "german"]).default("english") }),
});


export type ParsedGroqResponse = {
  correct_version: string;
  best_version: string;
}