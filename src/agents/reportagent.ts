import { DynamicStructuredTool } from "@langchain/core/tools";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import yahooFinance from 'yahoo-finance2';
import { z } from "zod";
const SerpApi = require('google-search-results-nodejs');

const {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI
} = require('@google-cloud/vertexai');

const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);

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
  const formattedResults = results.slice(0, 3).map((result: any) => `
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

const FundamentalDataInputSchema = z.object({
  ticker: z.string().describe("The ticker symbol of the company"),
});

async function fetchFundamentalData({ ticker }: z.infer<typeof FundamentalDataInputSchema>): Promise<any> {
  const quote = await yahooFinance.quoteSummary(ticker, { modules: ['price', 'summaryDetail'] });
  return {
    ticker,
    price: quote.price?.regularMarketPrice,
    marketCap: quote.price?.marketCap,
    peRatio: quote.summaryDetail?.trailingPE,
    dividendYield: quote.summaryDetail?.dividendYield,
    eps: quote.defaultKeyStatistics?.trailingEps,
  };
}

const fundamentalDataRetrievalTool = new DynamicStructuredTool({
  name: "fetch-fundamental-data",
  description: "Fetches fundamental data for a given stock ticker",
  schema: FundamentalDataInputSchema,
  func: fetchFundamentalData,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pineconeIndex = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
}).index('glancejs').namespace('default_namespace');

const EmbeddingRetrievalInputSchema = z.object({
  message: z.string().describe("The message to search for"),
  fileId: z.string().describe("The file ID for the namespace"),
});

async function embeddingRetrieval({ message, fileId }: z.infer<typeof EmbeddingRetrievalInputSchema>): Promise<string> {
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: fileId,
    }
  );
  const results = await vectorStore.similaritySearch(message, 4);
  return results.map(r => r.pageContent).join('\n\n');
}

const embeddingRetrievalTool = new DynamicStructuredTool({
  name: "embedding-retrieval",
  description: "Performs an embedding search and returns the results",
  schema: EmbeddingRetrievalInputSchema,
  func: embeddingRetrieval,
});

const project = 'secret-willow-427111-e1';
const location = 'asia-south1';
const textModel = 'gemini-1.0-pro';

const vertexAI = new VertexAI({ project: project, location: location });

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
  generationConfig: { maxOutputTokens: 1024 },
});

const setupPDFAgent = async () => {
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
    You are a helpful AI assistant, specializing in web searches, fundamental data retrieval, and embedding searches.
    Use the provided tools to progress towards answering the question.
    If you are unable to fully answer, that's OK, another assistant with different tools 
    will help where you left off. Execute what you can to make progress.
    If you or any of the other assistants have the final answer or deliverable,
    prefix your response with FINAL ANSWER so the team knows to stop.
    You have access to the following tools: {tool_names}.
  `;

  const agent = {
    llm: generativeModel,
    tools: [googleSearchTool, fundamentalDataRetrievalTool, embeddingRetrievalTool],
    promptTemplate,
    systemMessage,
  };

  return agent;
};

export { setupPDFAgent, googleSearchTool, fundamentalDataRetrievalTool, embeddingRetrievalTool };
