import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { flightTool } from "../tools/flightTool";
import { agentCheckpointer } from "./orchestrator";

dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});


const agentTools = [flightTool];
const toolNode = new ToolNode(agentTools);


const agentFly = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});


export default agentFly