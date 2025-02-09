import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { agentCheckpointer } from "./orchestrator";

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});

const tavilyTool = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tavilyTool);

const recomendTravel = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});

export default recomendTravel