import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

// Definición de los roles disponibles
const members = ["travel_advisor", "hotel_advisor", "flight_advisor"] as const;
const options = ["__end__", ...members];

// Prompt del sistema para el supervisor
const systemPrompt =
  "Sos un supervisor que debe dirigir la consulta del usuario entre los siguientes agentes: " +
  members.join(", ") +
  ". Analizá la conversación y respondé indicando cuál debe actuar a continuación, o '__end__' si la consulta ya quedó resuelta.";

// Definición de la herramienta de enrutamiento
const routingTool = {
  name: "route",
  description: "Decide el próximo agente a utilizar.",
  schema: z.object({
    next: z.enum([END, ...members]),
  }),
};

// Definir el prompt estructurado usando un placeholder para el historial
const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "human",
    "Basado en la conversación anterior, ¿quién debe actuar a continuación? " +
      "Seleccioná uno de: {options}",
  ],
]);

export async function getNextAgent(messages: any[]) {
  // Formateamos parcialmente el prompt inyectando las opciones y los roles
  const formattedPrompt = await prompt.partial({
    options: options.join(", "),
    members: members.join(", "),
  });
  
  // Instanciamos el LLM con parámetros de baja temperatura para decisiones deterministas
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
  });
  
  // invocamos el LLM, usando la herramienta de enrutamiento
  const result = await llm.bindTools(
    [routingTool],
    { tool_choice: "route" }
  ).invoke([...messages]);

  console.log("Resultado del LLM:", result);
  
  let next: string = "__end__";
  
  if (result && "tool_calls" in result) {
    // caso en que el objeto tenga directamente la propiedad tool_calls
    next = result.tool_calls?.[0]?.args?.next || "__end__";
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