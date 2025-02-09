import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "../tools/weatherTool";
import { makeAgentNode } from "./makeAgentNode"; // Importamos el wrapper

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});

const agentTools = [weatherTool];
const toolNode = new ToolNode(agentTools);
const agentCheckpointer = new MemorySaver();

const agentTravel = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});

export default agentTravel
//Función para invocar al travelAgent
// async function ask(question: string) {
//   try {
//     const systemPrompt = new SystemMessage({
//       content:
//         "Eres un asistente de viajes para ayudar al usuario a consultar sobre lugares con breve descripción. " +
//         "También puedes usar la tools para consultar el pronóstico del lugar, pero recuerda que tu límite son 5 días de acceso. " +
//         "No contestes a otros temas que no sean de viajes.",
//     });
//     const response = await agentTravel.invoke(
//       { messages: [systemPrompt, new HumanMessage(question)] },
//       { configurable: { thread_id: "1", userId: 1 } }
//     );
//     const lastMessage = response.messages[response.messages.length - 1].content;
//     console.log("Respuesta del agente:", lastMessage);
//     return lastMessage;
//   } catch (error) {
//     console.error("Error en la API:", error);
//   }
// }

// export default ask;