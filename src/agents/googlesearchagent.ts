import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
const SerpApi = require('google-search-results-nodejs');

const search = new SerpApi.GoogleSearch("390754a7a284f925a73c093dc4ac85d253fd38bc412769fe4fcb04635f973598");

const GoogleSearchInputSchema = z.object({
  query: z.string().describe("The search query to send to Google Search"),
});

async function performGoogleSearch({ query }: z.infer<typeof GoogleSearchInputSchema>): Promise<string> {
  const params = {
    q: query,
    location: "Austin, TX",
    hl: "en",
    gl: "us",
  };

  const response = await new Promise((resolve, reject) => {
    search.json(params, (data: any) => {
      resolve(data);
    });
  });

  const results = (response as any).organic_results || [];
  const formattedResults = results.map((result: any) => `
    Title: ${result.title}
    URL: ${result.link}
    Snippet: ${result.snippet}
  `).join('\n\n');

  return formattedResults;
}

const googleSearchTool = new DynamicStructuredTool({
  name: "google-search",
  description: "Performs a web search using Google Search and returns the results",
  schema: GoogleSearchInputSchema,
  func: performGoogleSearch,
});

// Initialize Vertex AI
const { HarmBlockThreshold, HarmCategory, VertexAI } = require('@google-cloud/vertexai');

const project = 'secret-willow-427111-e1';
const location = 'asia-south1';
const textModel = 'gemini-1.0-pro';

const vertexAI = new VertexAI({ project: project, location: location });

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
  generationConfig: { maxOutputTokens: 1024 },
});

const setupGoogleSearchAgent = async () => {
  const promptTemplate = `
    Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.
    \n----------------\n
    PREVIOUS CONVERSATION:
    {conversation_history}
    \n----------------\n
    CONTEXT:
    {context}
    USER INPUT: {input}
  `;

  const systemMessage = `
    You are a helpful AI assistant, specializing in web searches using Google Search.
    Use the provided tools to progress towards answering the question.
    If you are unable to fully answer, that's OK, another assistant with different tools 
    will help where you left off. Execute what you can to make progress.
    If you or any of the other assistants have the final answer or deliverable,
    prefix your response with FINAL ANSWER so the team knows to stop.
    You have access to the following tools: {tool_names}.
  `;

  const agent = {
    llm: generativeModel,
    tools: [googleSearchTool],
    promptTemplate,
    systemMessage,
  };

  return agent;
};

export { setupGoogleSearchAgent, googleSearchTool };
