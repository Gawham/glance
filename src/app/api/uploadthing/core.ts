import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { UploadStatus } from "@prisma/client";
import { db } from '@/db';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      
      if (!user || !user.id) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: `https://utfs.io/f/${file.key}`,
            uploadStatus: 'PROCESSING',
          }
        });

        try {
          const response = await fetch(`https://utfs.io/f/${file.key}`);
          if (!response.ok) {
            throw new Error('Failed to fetch the uploaded file');
          }

          const blob = await response.blob();
          const loader = new PDFLoader(blob);

          const pageLevelDocs = await loader.load();
          const pagesAmt = pageLevelDocs.length;

          const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
          });

          const pineconeIndex = pinecone.index('glancejs').namespace(createdFile.id);

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
          });

          await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,
            {
              pineconeIndex,
              namespace: createdFile.id,
            }
          );

          await db.file.update({
            data: {
              uploadStatus: 'SUCCESS',
            },
            where: {
              id: createdFile.id,
            },
          });

        } catch (fetchError) {
          await db.file.update({
            data: {
              uploadStatus: 'FAILED',
            },
            where: {
              id: createdFile.id,
            },
          });
          throw new UploadThingError('Error fetching the uploaded file');
        }
      } catch (dbError) {
        throw new UploadThingError('Error creating file record in the database');
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
