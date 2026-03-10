import type { APIRoute } from "astro";
import { GOOGLE_API_KEY } from "astro:env/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json() as { question?: unknown; history?: unknown };
  const { question, history } = body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return new Response(JSON.stringify({ error: "question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (question.length > 250) {
    return new Response(JSON.stringify({ error: "question too long" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `Eres un asistente que conoce a Fabrizio Riera Bauer...`;

  const google = createGoogleGenerativeAI({
    apiKey: GOOGLE_API_KEY,
  });

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: [...(Array.isArray(history) ? history : []), { role: "user", content: question }],
  });

  return result.toTextStreamResponse();
};
