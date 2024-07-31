import { VertexAI, HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';
import { embeddingRetrievalTool } from '../tools/embeddingRetrievalTool';
import { googleSearchTool } from '../tools/googleSearchTool';
import { fundamentalDataRetrievalTool } from '../tools/fundamentalDataRetrievalTool';
import { ragRetrievalTool } from '../tools/ragRetrievalTool';

// Define the structure of initializationOutputs
interface InitializationOutputs {
  ticker: string;
  ragQuery1: string;
  ragQuery2: string;
  webQuery1: string;
  webQuery2: string;
  economicQuery1: string;
  economicQuery2: string;
  latestNewsQuery: string;
  questionWebsearchQuery1: string;
  questionWebsearchQuery2: string;
  questionWebsearchQuery3: string;
}

const project = process.env.GOOGLE_PROJECT;
const location = 'asia-south1';
const textModel = 'gemini-1.5-pro';

const authOptions = {
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  }
}
const vertexAI = new VertexAI({
  project: project,
  location: location,
  googleAuthOptions: authOptions,
});

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
  generationConfig: { maxOutputTokens: 1024 },
});

const generateContext = async (initializationOutputs: InitializationOutputs, fileId: string, userInput: string): Promise<string> => {
  const {
    ticker, ragQuery1, ragQuery2, webQuery1, webQuery2, economicQuery1,
    economicQuery2, latestNewsQuery, questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3
  } = initializationOutputs;

  // Perform fundamental data retrieval
  console.log('Retrieving fundamental data for ticker:', ticker);
  const fundamentalDataResults = await fundamentalDataRetrievalTool.func({ ticker });

  // Perform Google search for web queries
  console.log('Performing Google search for web queries...');
  const googleSearchResults = await Promise.all([webQuery1, webQuery2].map(async query => {
    const result = await googleSearchTool.func({ query });
    return result;
  }));

  // Perform embedding retrieval for economic queries
  console.log('Performing embedding retrieval for economic queries...');
  const embeddingResults = await Promise.all([economicQuery1, economicQuery2].map(async query => {
    const result = await embeddingRetrievalTool.func({ query, fileId });
    return result;
  }));

  // Perform RAG retrieval for RAG queries
  console.log('Performing RAG retrieval for RAG queries...');
  const ragResults = await Promise.all([ragQuery1, ragQuery2].map(async query => {
    const result = await ragRetrievalTool.func({ query });
    return result;
  }));

  // Perform Google search for latest news queries
  console.log('Performing Google search for latest news queries...');
  const latestNewsResults = await Promise.all([latestNewsQuery].map(async query => {
    const result = await googleSearchTool.func({ query });
    return result;
  }));

  // Perform Google search for question websearch queries
  console.log('Performing Google search for question websearch queries...');
  const questionWebsearchResults = await Promise.all([
    questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3
  ].map(async query => {
    const result = await googleSearchTool.func({ query });
    return result;
  }));

  // Compile the report
  const report = `
## Fundamental Analysis Report for ${ticker}

### Financials
${fundamentalDataResults}

### Industry and Firm Details
${googleSearchResults.join('\n')}

### Economic Data
${embeddingResults.join('\n')}

### Latest News
${latestNewsResults.join('\n')}

### Analysis and Recommendations
${questionWebsearchResults.join('\n')}

### User Input
${userInput}
  `;

  const promptTemplate = `
    You are a financial analyst. Using the following information, generate a comprehensive fundamental analysis report for the stock. Ensure that the report is well-structured, informative, and provides detailed insights. To conclude the report, address the user's original query directly and provide a clear, actionable analysis. Ensure you answer the question fully and concisely. Avoid suggesting potential approaches or actions; focus solely on providing the answer. Do not give disclaimers or warnings in the response. Never say we don't have enough data to work with, make the most with what you have and give the user a highly detailed and compehensive reply with a simple conclusion.

    \n----------------\n
    CONTEXT:
    ${report}
  `;

  const request = {
    contents: [{ role: 'user', parts: [{ text: promptTemplate }] }],
  };

  console.log('Generating final report using generative model...');
  const result = await generativeModel.generateContent(request);
  const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  return responseText || 'No response generated.';
};

export { generateContext };
