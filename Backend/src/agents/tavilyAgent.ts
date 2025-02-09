import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "../tools/weatherTool";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});

const tavilyTool = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tavilyTool);
const agentCheckpointer = new MemorySaver();

const recomendTravel = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});

export default recomendTravel