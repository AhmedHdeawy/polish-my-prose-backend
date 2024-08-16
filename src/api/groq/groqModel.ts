import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Groq = z.infer<typeof GroqSchema>;
export const GroqSchema = z.object({
  correct_content: z.string(),
  best_content: z.string()
});


export const GetGroqSchema = z.object({
  body: z.object({ content: z.string().min(1).max(1500) }),
});


export type ParsedGroqResponse = {
  correct_content: string;
  best_content: string;
}