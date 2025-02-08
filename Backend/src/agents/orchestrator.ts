import { StateGraph, START } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { makeAgentNode } from "./makeAgentNode";
import conversationAgent from "./travelAgent";  // Este será el travel_advisor
import hotelsAgent from "./hotelsAgent";
import flightAgent from "./flightAgent"
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";


// Definí los prompts para cada agente
const travelAdvisorPrompt = "Sos un asesor general de viajes. Analizá la consulta del usuario y decidí si se requiere ayuda de un especialista en hoteles, vuelos o clima. Respondé con tu recomendación.";
const hotelAdvisorPrompt = "Sos un experto en hoteles. Proporcioná recomendaciones de hoteles basadas en la consulta del usuario.";
const flightAdvisorPrompt = "Sos un experto en vuelos. Proporcioná información y ofertas de vuelos basadas en la consulta del usuario.";
//const weatherAdvisorPrompt = "Sos un experto en clima. Proporcioná la información del clima necesaria para el viaje.";

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

// Función para invocar el grafo
async function runGraph(question: string) {
  const systemPrompt = new SystemMessage({
    content:"eres un orquestador el cual va a recibir la pregunta inicial y crea el estado inicial del grafo"+
    "luego recibiras la respuesta de la pregunta ya procesada"+
    "estas limitado a ser un asistente de viajes y hablar solo de eso, no conteste preguntas que no sean con relacion a eso"
  })
  const initialMessage = new HumanMessage(question);
  const streamResults = await graph.stream({ messages: [systemPrompt, initialMessage] }, 
    { configurable: { thread_id: "1", userId: 1 } },
);
  for await (const output of streamResults) {
    console.log(output);
    if (output?.__end__) break;
  }
}

export default runGraph;