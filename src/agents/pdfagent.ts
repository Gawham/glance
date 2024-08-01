import { GoogleGenerativeAI } from "@google/generative-ai";
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

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

const generateContext = async (initializationOutputs: InitializationOutputs, fileId: string, userInput: string): Promise<string> => {
  const {
    ticker, ragQuery1, ragQuery2, webQuery1, webQuery2, economicQuery1,
    economicQuery2, latestNewsQuery, questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3
  } = initializationOutputs;

  // Perform fundamental data retrieval
  console.log('Retrieving fundamental data for ticker:', ticker);
  let fundamentalDataResults;
  try {
    fundamentalDataResults = await fundamentalDataRetrievalTool.func({ ticker });
  } catch (error) {
    console.error('Error fetching fundamental data:', error);
    fundamentalDataResults = 'No fundamental data available.';
  }

  // Perform Google search for web queries
  console.log('Performing Google search for web queries...');
  const googleSearchResults = await Promise.all([webQuery1, webQuery2].map(async query => {
    try {
      const result = await googleSearchTool.func({ query });
      return result;
    } catch (error) {
      console.error(`Error fetching Google search results for query "${query}":`, error);
      return 'No results available.';
    }
  }));

  // Perform embedding retrieval for economic queries
  console.log('Performing embedding retrieval for economic queries...');
  const embeddingResults = await Promise.all([economicQuery1, economicQuery2].map(async query => {
    try {
      const result = await embeddingRetrievalTool.func({ query, fileId });
      return result;
    } catch (error) {
      console.error(`Error fetching embedding results for query "${query}":`, error);
      return 'No results available.';
    }
  }));

  // Perform RAG retrieval for RAG queries
  console.log('Performing RAG retrieval for RAG queries...');
  const ragResults = await Promise.all([ragQuery1, ragQuery2].map(async query => {
    try {
      const result = await ragRetrievalTool.func({ query });
      return result;
    } catch (error) {
      console.error(`Error fetching RAG results for query "${query}":`, error);
      return 'No results available.';
    }
  }));

  // Perform Google search for latest news queries
  console.log('Performing Google search for latest news queries...');
  const latestNewsResults = await Promise.all([latestNewsQuery].map(async query => {
    try {
      const result = await googleSearchTool.func({ query });
      return result;
    } catch (error) {
      console.error(`Error fetching latest news for query "${query}":`, error);
      return 'No results available.';
    }
  }));

  // Perform Google search for question websearch queries
  console.log('Performing Google search for question websearch queries...');
  const questionWebsearchResults = await Promise.all([
    questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3
  ].map(async query => {
    try {
      const result = await googleSearchTool.func({ query });
      return result;
    } catch (error) {
      console.error(`Error fetching question websearch results for query "${query}":`, error);
      return 'No results available.';
    }
  }));

  // Compile the report
  const report = `
## Fundamental Analysis Data for ${ticker}

### Financials, Balance Sheet, Cash Flow Statement, and P&L Statement
${fundamentalDataResults}

### Information about the Firm and Industry it operates in
${googleSearchResults.join('\n')}

### Extracts providing information about the firm's operations from a document about the firm
${embeddingResults.join('\n')}

### Latest News about the firm
${latestNewsResults.join('\n')}

### Relevant segments from a fundamental analysis knowledge base (adapted to the Indian market, using Nifty rather than NASDAQ or DJI)
${ragResults.join('\n')}

### User Input
${userInput}
  `;

  const promptTemplate = `
    You are a financial analyst specializing in fundamental analysis of stocks. Using the following information, generate a comprehensive fundamental analysis report for the stock that answer's the user's question. The report should be well-structured, informative, and provide detailed insights. Ensure you address the user's original query directly with clear, actionable analysis using the report. Highlight the data points that lead to your conclusions and deductions. Avoid suggesting potential approaches or actions; instead, perform the necessary analysis and provide definitive answers. Focus on delivering a detailed and well-supported report leading up to a conclusion that answer's the user's question without disclaimers or warnings. Note that the information from the RAG response is about the American market and should be adapted to the Indian context, avoiding references to Benjamin Graham, NASDAQ, or DJI, and using Nifty instead. Strictly avoid warnings and Disclaimer's in your response.

    \n----------------\n
    CONTEXT:
    ${report}
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const request = { contents: [{ role: 'user', parts: [{ text: promptTemplate }] }] };

  console.log('Generating final report using generative model...');
  const result = await model.generateContent(request);
  const responseText = result.response.text();

  return responseText || 'No response generated.';
};

export { generateContext };
