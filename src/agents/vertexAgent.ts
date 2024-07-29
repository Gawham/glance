// File path: src/agents/vertexAgent.ts

import { HarmBlockThreshold, HarmCategory, VertexAI, GenerateContentRequest, GenerateContentResult } from '@google-cloud/vertexai';
import { z } from 'zod';

// VertexAI Configuration
const project = 'secret-willow-427111-e1';
const location = 'asia-south1';
const textModel = 'gemini-1.0-pro';

const vertexAI = new VertexAI({ project, location });

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 1024 },
});

// Schemas
const CompareInputSchema = z.object({
  originalInput: z.string(),
  userInput: z.string(),
});

// Functions
async function compareInputs({ originalInput, userInput }: { originalInput: string; userInput: string }): Promise<string> {
  const promptTemplate = `
    Based on the user input, provide a direct and concise answer to the original input question.
    \n----------------\n
    ORIGINAL INPUT:
    {originalInput}
    \n----------------\n
    USER INPUT: {input}
  `;

  const prompt = promptTemplate
    .replace('{originalInput}', originalInput)
    .replace('{input}', userInput);

  const request: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  const result: GenerateContentResult = await generativeModel.generateContent(request);

  if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
    throw new Error('No candidates returned by the generative model.');
  }

  const candidate = result.response.candidates[0];

  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('No content returned by the generative model.');
  }

  const text = candidate.content.parts[0].text;

  if (text === undefined) {
    throw new Error('Content part text is undefined.');
  }

  return text;
}

// Tools
const compareInputsTool = {
  name: "compare-inputs",
  description: "Compares user input with original input and generates a response",
  schema: CompareInputSchema,
  func: compareInputs,
};

// Setup Agent
const setupVertexAgent = async () => {
  const systemMessage = `
    You are an AI assistant. Compare the provided user input with the original input and generate a direct and concise response.
  `;

  const agent = {
    llm: generativeModel,
    tools: [compareInputsTool],
    systemMessage,
  };

  return agent;
};

export { setupVertexAgent, compareInputsTool };
