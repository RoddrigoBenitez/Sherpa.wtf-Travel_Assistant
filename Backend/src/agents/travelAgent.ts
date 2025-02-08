import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "../tools/weatherTool";



dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});


const agentTools = [weatherTool];
const toolNode = new ToolNode(agentTools);

const agentCheckpointer = new MemorySaver();

const destinationAgent = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});



// Probar con una pregunta de ejemplo
async function askAgent(question: string) {
  try {
    const systemPrompt = new SystemMessage({
      content: "eres un asistente de viajes para ayudar al usuario a consultar sobre lugares con breve descripcion" +
      "tambien puedes usar la tools para consultar el pronostico del lugar, solo si te pide dale mas dias aclarando que tu limite son 5 dias de acceso" +
      "no contestes a otros temas que no sean con respecto al viaje"
    })
    const response = await destinationAgent.invoke(
      { messages: [systemPrompt ,new HumanMessage(question)] },
      { configurable: { thread_id: "1", userId: 1 } }
    );
    const lastMessage = response.messages[response.messages.length - 1].content;
    console.log("Respuesta del agente:", lastMessage);
    return lastMessage;
  } catch (error) {
    console.error("Error en la API:", error);
  }
}


export default askAgent


//import { z } from "zod";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// // Definí los roles (los workers) disponibles
// const members = ["hotel_advisor", "flight_advisor", "weather_advisor"] as const;
// const options = ["__end__", ...members];

// // Prompt del sistema para el supervisor
// const systemPrompt =
//   "Sos un supervisor que debe dirigir la consulta del usuario entre los siguientes agentes: " +
//   members.join(", ") +
//   ". " +
//   "Analizá la consulta y respondé indicando cuál debe actuar a continuación, o '__end__' si la consulta ya quedó resuelta.";

// const routingTool = {
//   name: "route",
//   description: "Decide el próximo agente a utilizar.",
//   schema: z.object({
//     next: z.enum(options).describe("El próximo agente (o '__end__')"),
//   }),
// };

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", systemPrompt],
//   new MessagesPlaceholder("messages"),
//   [
//     "human",
//     "Basado en la conversación anterior, ¿quién debe actuar a continuación? Seleccioná uno de: {options}",
//   ],
// ]);

// // Formateo parcial del prompt
// export async function getNextAgent(messages: any[]) {
//   const formattedPrompt = await prompt.partial({
//     options: options.join(", "),
//   });
//   const llm = new ChatOpenAI({
//     model: "gpt-4o-mini",
//     temperature: 0.1,
//   });
//   // Invocamos el LLM con la herramienta de enrutamiento
//   const result = await llm.bindTools([routingTool], { tool_choice: "route" }).invoke([
//     ...messages,
//   ]);
//   // Suponemos que la respuesta del LLM incluye una propiedad 'tool_calls' con el valor 'next'
//   const next = result.messages[0].tool_calls?.[0]?.args?.next || "__end__";
//   return next;
// }