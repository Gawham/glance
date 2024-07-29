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
}).index('glancejs');

const EmbeddingRetrievalInputSchema = z.object({
  query: z.string(),
  fileId: z.string(),
});

async function embeddingRetrieval({ query, fileId }: { query: string; fileId: string }): Promise<string> {
  console.log('Performing embedding retrieval for:', { query, fileId });
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: fileId,
  });
  const results = await vectorStore.similaritySearch(query, 1);
  const response = results.map(r => r.pageContent).join('\n\n');
  console.log('Embedding retrieval results:', response);
  return response;
}

const embeddingRetrievalTool = new DynamicStructuredTool({
  name: "embedding-retrieval",
  description: "Performs an embedding search and returns the results",
  schema: EmbeddingRetrievalInputSchema,
  func: embeddingRetrieval,
});

export { embeddingRetrievalTool };
