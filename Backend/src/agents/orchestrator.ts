import { StateGraph, START } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { makeAgentNode } from "./makeAgentNode";
import agentTravel from "./travelAgent";
import recomendTravel from "./tavilyAgent"
import hotelsAgent from "./hotelsAgent";
import flightAgent from "./flightAgent";
import { MemorySaver } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

// define prompts for each agent
const recomendAdvisorPrompt = "Sos un asesor general de viajes. Analizá la consulta del usuario y decidí si se requiere ayuda de un especialista en hoteles, vuelos o clima. Respondé con tu recomendación.";

const travelAdvisorPrompt = "Sos un experto en dar recomendaciones del clima de lugares o ciudades. Proporcioná información y descripciones basadas en la consulta del usuario." +
  "Sos un experto en recomendar una lista de vestimentas. Proporcioná recomendaciones de que ropa llevar basadas en la consulta del usuario";

const hotelAdvisorPrompt = "Sos un experto en hoteles. Proporcioná recomendaciones de hoteles basadas en la consulta del usuario.";

const flightAdvisorPrompt = "Sos un experto en vuelos. Proporcioná información y ofertas de vuelos basadas en la consulta del usuario.";

// we create the nodes for each agent using makeAgentNode
const recomendAdvisorNode = makeAgentNode({
  name: "recomend_advisor",
  destinations: ["travel_advisor", "hotel_advisor", "flight_advisor", "__end__"],
  systemPrompt: recomendAdvisorPrompt,
  agent: recomendTravel,
});
const travelAdvisorNode = makeAgentNode({
  name: "travel_advisor",
  destinations: ["recomend_advisor", "hotel_advisor", "flight_advisor", "__end__"],
  systemPrompt: travelAdvisorPrompt,
  agent: agentTravel,
});
const hotelAdvisorNode = makeAgentNode({
  name: "hotel_advisor",
  destinations: ["recomend_advisor", "travel_advisor", "flight_advisor", "__end__"],
  systemPrompt: hotelAdvisorPrompt,
  agent: hotelsAgent,
});
const flightAdvisorNode = makeAgentNode({
  name: "flight_advisor",
  destinations: ["recomend_advisor", "travel_advisor", "hotel_advisor", "__end__"],
  systemPrompt: flightAdvisorPrompt,
  agent: flightAgent,
});

export const agentCheckpointer = new MemorySaver();

// assembles the network with the defined nodes
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("recomend_advisor", recomendAdvisorNode, { ends: ["travel_advisor", "hotel_advisor", "flight_advisor", "__end__"] })
  .addNode("travel_advisor", travelAdvisorNode, { ends: ["recomend_advisor", "hotel_advisor", "flight_advisor", "__end__"] })
  .addNode("hotel_advisor", hotelAdvisorNode, { ends: ["recomend_advisor", "travel_advisor", "flight_advisor", "__end__"] })
  .addNode("flight_advisor", flightAdvisorNode, { ends: ["recomend_advisor", "travel_advisor", "hotel_advisor", "__end__"] })
  .addEdge("__start__", "recomend_advisor");

const graph = workflow.compile({ checkpointer: agentCheckpointer });

// function for invoking the network (orchestrator) and returning a final response
async function runGraph(question: string): Promise<string> {
  const systemPrompt = new SystemMessage({
    content:
      "Eres un orquestador encargado de recibir la pregunta del usuario, iniciar el flujo de trabajo y coordinar la conversación. " +
      "Responde solo sobre temas que se vinculen con recomendaciones a lugares donde viajar, vuelos, hoteles y clima." +
      "No contestes preguntas que no tengan relación.",
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

  // regex that replaces line breaks with a space
  const cleanedOutput = finalOutput.replace(/\n/g, " ");

  return cleanedOutput;
}

export default runGraph