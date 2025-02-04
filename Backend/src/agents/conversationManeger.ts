import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv"

dotenv.config()

const agentTools = [new TavilySearchResults({ maxResults: 3 })];
const agentModel = new ChatOpenAI({ 
    model: "gpt-4o-mini", 
    temperature: 0.3,
    
});

const agentCheckpointer = new MemorySaver();
const destinationAgent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});



// Probar con una pregunta de ejemplo
async function askAgent(question: string) {
    setTimeout(async () => {
      try {
        const response = await destinationAgent.invoke(
           { messages: 
             [new HumanMessage(question)] }, 
          { configurable: { thread_id: "1" } }
        );
        console.log("Respuesta del agente:", response);
      } catch (error) {
        console.error("Error en la API:", error);
      }
    }, 1000); // 1 segundos de delay
  }
  
  // Pregunta de ejemplo
  askAgent("¿cual es lugar mas popular de Buenos Aires?");
