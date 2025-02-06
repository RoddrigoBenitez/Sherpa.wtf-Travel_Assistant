import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv"
import { weatherTool } from "./weatherTool";
import { hotelTool } from "./hotelsTool";


dotenv.config()


const agentModel = new ChatOpenAI({ 
  model: "gpt-4o-mini", 
  temperature: 0.3,
  
});

const agentCheckpointer = new MemorySaver();


const tavily = [new TavilySearchResults({ maxResults: 3 })];
const agentTools = [weatherTool, hotelTool];
const toolNode = new ToolNode(agentTools);

const destinationAgent = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});

//const conversationHistory: (HumanMessage | AIMessage)[] = [];

// Probar con una pregunta de ejemplo
async function askAgent(question: string) {
      try {
        // Agregar el nuevo mensaje del usuario al historial
      //conversationHistory.push(new HumanMessage(question));

        const response = await destinationAgent.invoke(
           { messages: [new HumanMessage(question)] },
           { configurable: { thread_id: "1" } }
        );
        // Convertir respuesta en mensaje de IA y agregarlo al historial
        // const aiResponse = new AIMessage(aiResponseText);
        // conversationHistory.push(aiResponse);

        console.log("Respuesta del agente:", response.messages[1].content);
      } catch (error) {
        console.error("Error en la API:", error);
      }
  }
  
  // Pregunta de ejemplo
  askAgent('Puedes buscarme un hotel en Madrid del 10 al 15 de abril?')
  
  
  //export default askAgent

  
