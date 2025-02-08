import { z } from "zod";
import { Command, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Función genérica para crear un nodo agente
export const makeAgentNode = (params: {
  name: string;
  destinations: readonly string[];
  systemPrompt: string;
  agent: any; // agente creado con createReactAgent
}) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const messages = [
      new SystemMessage({ content: params.systemPrompt }),
      ...state.messages,
    ];
    const result = await params.agent.invoke({ messages });
    const lastContent = result.messages[result.messages.length - 1].content;
    // Aquí simulamos una decisión de enrutamiento basada en palabras clave (podés mejorar esto)
    let goto = "__end__";
    if (lastContent.toLowerCase().includes("travel")) goto = "travel_advisor"
    else if (lastContent.toLowerCase().includes("hotel")) goto = "hotel_advisor";
    else if (lastContent.toLowerCase().includes("flight")) goto = "flight_advisor";
    const command = new Command({
      goto,
      update: { messages: new HumanMessage({ content: lastContent, name: params.name }) },
    });
    return command;
  };
};