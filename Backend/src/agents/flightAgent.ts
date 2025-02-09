import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { flightTool } from "../tools/flightTool"; 
import { makeAgentNode } from "./makeAgentNode"; // Importamos el wrapper

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});


const agentTools = [flightTool];
const toolNode = new ToolNode(agentTools);

const agentCheckpointer = new MemorySaver();

const agentFly = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});


export default agentFly

// Función para invocar al travelAgent
// async function ask(question: string) {
//   try {
//     const systemPrompt = new SystemMessage({
//         content: "eres un asistente de viajes para ayudar al usuario a consultar sobre vuelos con breve descripcion tambien puedes usar la tools para consultar"+
//         "no contestes a otros temas que no sean con respecto al viaje"    })
//     const response = await agentFly.invoke(
//       { messages: [systemPrompt , new HumanMessage(question)] },
//       { configurable: { thread_id: "1", userId: 1 } }
//     );
//     const lastMessage = response.messages[response.messages.length - 1].content;
//     console.log("Respuesta del agente:", lastMessage);
//     return lastMessage;
//   } catch (error) {
//     console.error("Error en la API:", error);
//   }
// }


// export default ask