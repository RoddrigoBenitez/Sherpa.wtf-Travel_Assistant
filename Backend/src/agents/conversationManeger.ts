import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "./weatherTool";
import dotenv from "dotenv";

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
    const response = await destinationAgent.invoke(
      { messages: [new HumanMessage(question)] },
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
