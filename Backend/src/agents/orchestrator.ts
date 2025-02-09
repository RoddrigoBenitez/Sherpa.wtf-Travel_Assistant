import { StateGraph, START } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { makeAgentNode } from "./makeAgentNode";
import conversationAgent from "./travelAgent";  // travel advisor
import hotelsAgent from "./hotelsAgent";
import flightAgent from "./flightAgent";
import { MemorySaver } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

// Definí los prompts para cada agente
const travelAdvisorPrompt = "Sos un asesor general de viajes. Analizá la consulta del usuario y decidí si se requiere ayuda de un especialista en hoteles, vuelos o clima. Respondé con tu recomendación.";
const hotelAdvisorPrompt = "Sos un experto en hoteles. Proporcioná recomendaciones de hoteles basadas en la consulta del usuario.";
const flightAdvisorPrompt = "Sos un experto en vuelos. Proporcioná información y ofertas de vuelos basadas en la consulta del usuario.";

// Creamos los nodos para cada agente usando makeAgentNode
const travelAdvisorNode = makeAgentNode({
  name: "travel_advisor",
  destinations: ["hotel_advisor", "flight_advisor", "__end__"],
  systemPrompt: travelAdvisorPrompt,
  agent: conversationAgent,
});
const hotelAdvisorNode = makeAgentNode({
  name: "hotel_advisor",
  destinations: ["travel_advisor", "flight_advisor", "__end__"],
  systemPrompt: hotelAdvisorPrompt,
  agent: hotelsAgent,
});
const flightAdvisorNode = makeAgentNode({
  name: "flight_advisor",
  destinations: ["travel_advisor", "hotel_advisor", "__end__"],
  systemPrompt: flightAdvisorPrompt,
  agent: flightAgent,
});

// Armar el grafo con los nodos definidos
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("travel_advisor", travelAdvisorNode, { ends: ["hotel_advisor", "flight_advisor", "__end__"] })
  .addNode("hotel_advisor", hotelAdvisorNode, { ends: ["travel_advisor", "flight_advisor", "__end__"] })
  .addNode("flight_advisor", flightAdvisorNode, { ends: ["travel_advisor", "hotel_advisor", "__end__"] })
  .addEdge("__start__", "travel_advisor");

const graph = workflow.compile();

// Función para invocar el grafo (orquestador) y retornar una respuesta final
async function runGraph(question: string): Promise<string> {
  const systemPrompt = new SystemMessage({
    content:
      "Eres un orquestador encargado de recibir la pregunta del usuario, iniciar el flujo de trabajo y coordinar la conversación. " +
      "Responde solo sobre temas de viajes. No contestes preguntas que no tengan relación.",
  });
  const initialMessage = new HumanMessage(question);
  
  const finalState = await graph.invoke(
    { messages: [systemPrompt, initialMessage] },
    { configurable: { thread_id: "1", userId: 1 } }
  );
  
  const lastContent = finalState.messages[finalState.messages.length - 1].content;
  
  let finalOutput: string;
  if (Array.isArray(lastContent)) {
    finalOutput = lastContent.join(" ");
  } else if (typeof lastContent === "string") {
    finalOutput = lastContent;
  } else {
    finalOutput = JSON.stringify(lastContent);
  }
  
  return finalOutput;
}

export default runGraph