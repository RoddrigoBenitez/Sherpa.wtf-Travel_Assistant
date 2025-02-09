import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";

const members = ["recomend_advisor", "travel_advisor", "hotel_advisor", "flight_advisor"] as const;
const options = ["__end__", ...members];

const systemPrompt =
  "Sos un supervisor que debe dirigir la consulta del usuario entre los siguientes agentes: " +
  members.join(", ") +
  ". Analizá la conversación y responde indicando cuál debe actuar a continuación, o '__end__' si la consulta ya quedó resuelta.";

const routingTool = {
  name: "route",
  description: "Decide el próximo agente a utilizar." +
    "o '__end__' si la consulta ya quedó resuelta.",
  schema: z.object({
    next: z.enum([END, ...members]),
  }),
};

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "human",
    "Basado en la conversación anterior, ¿quién debe actuar a continuación? Seleccioná uno de: {options}",
  ],
]);

export async function getNextAgent(messages: any[]): Promise<string> {
  const formattedPrompt = await prompt.partial({
    options: options.join(", "),
  });
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
  });
  const result = await llm.bindTools(
    [routingTool],
    { tool_choice: "route" }
  ).invoke([...messages]);

  let next: string = "__end__";
  if (result && "tool_calls" in result && result.tool_calls && result.tool_calls.length > 0) {
    next = result.tool_calls[0].args.next || "__end__";
  } else if (result && (result as any).messages) {
    next = (result as any).messages[0]?.tool_calls?.[0]?.args?.next || "__end__";
  } else if (result && (result as any).content) {
    next = (result as any).content || "__end__";
  }
  console.log("Siguiente agente sugerido:", next);
  if (typeof formattedPrompt.format === "function") {
    const output = formattedPrompt.format({ next });
    console.log("Prompt formateado con next:", output);
    return output;
  }
  return next;
}