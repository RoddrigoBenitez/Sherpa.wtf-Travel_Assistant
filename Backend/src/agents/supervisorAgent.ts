import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";

// Definí los roles (los workers) disponibles
const members = ["travel_advisor", "hotel_advisor", "flight_advisor"] as const;
const options = ["__end__", ...members];

// Prompt del sistema para el supervisor
const systemPrompt =
  "Sos un supervisor que debe dirigir la consulta del usuario entre los siguientes agentes: " +
  members.join(", ") +
  ". " +
  "Analizá la consulta y respondé indicando cuál debe actuar a continuación, o '__end__' si la consulta ya quedó resuelta.";

const routingTool = {
  name: "route",
  description: "Decide el próximo agente a utilizar.",
  schema: z.object({
    next: z.enum([END, ...members]),
  }),
};

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "human",
    "Basado en la conversación anterior, ¿quién debe actuar a continuación?" +
    "Seleccioná uno de: {options}",
  ],
]);

// Formateo parcial del prompt
export async function getNextAgent(messages: any[]) {
  const formattedPrompt = await prompt.partial({
    options: options.join(", "),
  });
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.1,
  });
  // Invocamos el LLM con la herramienta de enrutamiento
  const result = await llm.bindTools([routingTool], { tool_choice: "route" }).invoke([
    ...messages,
  ]);
  // Suponemos que la respuesta del LLM incluye una propiedad 'tool_calls' con el valor 'next'
  const next = result.messages[0].tool_calls?.[0]?.args?.next || "__end__";
  return next;
}