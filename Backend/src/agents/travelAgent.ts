import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "../tools/weatherTool";
import { agentCheckpointer } from "./orchestrator";

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
});

const agentTools = [weatherTool];
const toolNode = new ToolNode(agentTools);

const agentTravel = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});

export default agentTravel
