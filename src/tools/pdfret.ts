// File path: src/tools/pdfret.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { z } from "zod";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.index('glancejs').namespace('default_namespace');

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

export default embeddingRetrievalTool;
