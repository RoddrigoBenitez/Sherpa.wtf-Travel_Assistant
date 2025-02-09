import { Command, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const makeAgentNode = (params: {
  name: string;
  destinations: readonly string[];
  systemPrompt: string;
  agent: any; // agent created with createReactAgent
}) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const messages = [
      new SystemMessage({ content: params.systemPrompt }),
      ...state.messages,
    ];
    const result = await params.agent.invoke({ messages });
    const lastContent = result.messages[result.messages.length - 1].content;

    let goto = "__end__";

    // Avoid infinite cycle: if the node suggests deriving itself, we force the end
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