import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "./weatherTool";
import { hotelTool } from "./hotelsTool";

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});


const agentTools = [weatherTool, hotelTool];
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
      content: "eres un asistente de viajes para ayudar al usuario a consultar sobre lugares con breve descripcion tambien puedes usar la tools para consultar el pronostico del lugar, no contestes a otros temas que no sean con respecto al viaje"
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
