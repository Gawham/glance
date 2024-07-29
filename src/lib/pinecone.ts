import { Pinecone } from '@pinecone-database/pinecone';

// A type representing your metadata
type Metadata = {};

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.index<Metadata>('glancejs').namespace('createdFile.id');

export { pinecone, pineconeIndex };
