import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { hotelTool } from "../tools/hotelsTool";
import { hotelsByCityTool } from "../tools/hotelsCityTool";
import { agentCheckpointer } from "./orchestrator";


dotenv.config();

const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});


const agentTools = [hotelTool, hotelsByCityTool];
const toolNode = new ToolNode(agentTools);

const agentHotels = createReactAgent({
  llm: agentModel,
  tools: toolNode,
  checkpointSaver: agentCheckpointer,
});


export default agentHotels;

