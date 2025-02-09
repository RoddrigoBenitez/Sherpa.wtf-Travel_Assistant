import { Command, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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
    
    // Lógica de ruteo basada en palabras clave (puedes mejorarla)
    let goto = "__end__";
// Si la respuesta menciona "clima" o "temperatura", se asigna travel_advisor
if (lastContent.toLowerCase().includes("clima") || lastContent.toLowerCase().includes("temperatura")) {
  goto = "travel_advisor";
}
// Si menciona "hotel" y no se detecta indicación de clima, se asigna hotel_advisor
else if (lastContent.toLowerCase().includes("hotel")) {
  goto = "hotel_advisor";
}
else if (lastContent.toLowerCase().includes("flight") || lastContent.toLowerCase().includes("vuelo")) {
  goto = "flight_advisor";
}

// Evitar ciclo infinito: si el nodo sugiere derivarse a sí mismo, forzamos el final.
if (goto === params.name) {
  goto = "__end__";
}
    
    const command = new Command({
      goto,
      update: { messages: new HumanMessage({ content: lastContent, name: params.name }) },
    });
    
    if (goto === "__end__") {
      (command as any).__end__ = true;
    }
    
    return command;
  }
};