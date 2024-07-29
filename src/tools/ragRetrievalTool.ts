import { DynamicStructuredTool } from "@langchain/core/tools";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pineconeIndex = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
}).index('glancejs').namespace('Fundamentals');

const RAGRetrievalInputSchema = z.object({
  query: z.string(),
});

async function ragRetrieval({ query }: { query: string }): Promise<string> {
  console.log('Performing RAG retrieval for:', { query });
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: 'Fundamentals',
  });
  const results = await vectorStore.similaritySearch(query, 1);
  const response = results.map(r => r.pageContent).join('\n\n');
  console.log('RAG retrieval results:', response);
  return response;
}

const ragRetrievalTool = new DynamicStructuredTool({
  name: "rag-retrieval",
  description: "Performs an RAG retrieval search and returns the results",
  schema: RAGRetrievalInputSchema,
  func: ragRetrieval,
});

export { ragRetrievalTool };
