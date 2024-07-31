import { DynamicStructuredTool } from "@langchain/core/tools";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { z } from "zod";
import { HarmBlockThreshold, HarmCategory, VertexAI, GenerateContentRequest, GenerateContentResult } from '@google-cloud/vertexai';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.index('glancejs').namespace('default_namespace');

const InitializationInputSchema = z.object({
  message: z.string().describe("The message to search for"),
  fileId: z.string().describe("The file ID for the namespace"),
});


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
  generationConfig: { maxOutputTokens: 1024, temperature: 0 },
});

const tickersList = `
Ticker - Firm Name
OFSS.NS - Oracle Financial Services Software
RELIANCE.NS - Reliance Industries Limited
COALINDIA.NS - Coal India Limited
HDFCBANK.NS - HDFC Bank Limited
INFY.NS - Infosys Limited
ICICIBANK.NS - ICICI Bank Limited
TCS.NS - Tata Consultancy Services Limited
HINDUNILVR.NS - Hindustan Unilever Limited
SBIN.NS - State Bank of India
BAJFINANCE.NS - Bajaj Finance Limited
BHARTIARTL.NS - Bharti Airtel Limited
KOTAKBANK.NS - Kotak Mahindra Bank Limited
ITC.NS - ITC Limited
LT.NS - Larsen & Toubro Limited
HCLTECH.NS - HCL Technologies Limited
ASIANPAINT.NS - Asian Paints Limited
HINDALCO.NS - Hindalco Industries Limited
AXISBANK.NS - Axis Bank Limited
ULTRACEMCO.NS - UltraTech Cement Limited
SUNPHARMA.NS - Sun Pharmaceutical Industries Limited
NESTLEIND.NS - Nestle India Limited
M&M.NS - Mahindra & Mahindra Limited
MARUTI.NS - Maruti Suzuki India Limited
POWERGRID.NS - Power Grid Corporation of India Limited
TITAN.NS - Titan Company Limited
NTPC.NS - NTPC Limited
DRREDDY.NS - Dr. Reddy's Laboratories Limited
SBILIFE.NS - SBI Life Insurance Company Limited
GRASIM.NS - Grasim Industries Limited
TATAMOTORS.NS - Tata Motors Limited
DIVISLAB.NS - Divi's Laboratories Limited
HEROMOTOCO.NS - Hero MotoCorp Limited
EICHERMOT.NS - Eicher Motors Limited
HDFCLIFE.NS - HDFC Life Insurance Company Limited
WIPRO.NS - Wipro Limited
BRITANNIA.NS - Britannia Industries Limited
ADANIGREEN.NS - Adani Green Energy Limited
TATASTEEL.NS - Tata Steel Limited
ADANIPORTS.NS - Adani Ports and Special Economic Zone Limited
ONGC.NS - Oil and Natural Gas Corporation Limited
BAJAJFINSV.NS - Bajaj Finserv Limited
JSWSTEEL.NS - JSW Steel Limited
TECHM.NS - Tech Mahindra Limited
HINDZINC.NS - Hindustan Zinc Limited
BPCL.NS - Bharat Petroleum Corporation Limited
SHREECEM.NS - Shree Cement Limited
ADANIENT.NS - Adani Enterprises Limited
IOC.NS - Indian Oil Corporation Limited
UPL.NS - UPL Limited
COFORGE.NS - Coforge Limited
MUTHOOTFIN.NS - Muthoot Finance Limited
GODREJCP.NS - Godrej Consumer Products Limited
DLF.NS - DLF Limited
SIEMENS.NS - Siemens Limited
BIOCON.NS - Biocon Limited
ICICIPRULI.NS - ICICI Prudential Life Insurance Company Limited
PIDILITIND.NS - Pidilite Industries Limited
LUPIN.NS - Lupin Limited
AAPL - Apple Inc.
MSFT - Microsoft Corporation
GOOGL - Alphabet Inc. (Class A)
GOOG - Alphabet Inc. (Class C)
AMZN - Amazon.com, Inc.
TSLA - Tesla, Inc.
NVDA - NVIDIA Corporation
META - Meta Platforms, Inc.
PYPL - PayPal Holdings, Inc.
ADBE - Adobe Inc.
NFLX - Netflix, Inc.
CSCO - Cisco Systems, Inc.
PEP - PepsiCo, Inc.
AVGO - Broadcom Inc.
INTC - Intel Corporation
`;

async function performPineconeSearch(message: string, fileId: string): Promise<string> {
  console.log('Performing embedding search using Pinecone');
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: fileId,
  });

  console.log('Vector store initialized');
  const results = await vectorStore.similaritySearch(message, 4);
  console.log('Similarity search results:', results);

  const pineconeResponse = results.map(r => r.pageContent).join('\n\n');
  console.log('Pinecone response:', pineconeResponse);

  return pineconeResponse;
}

async function initializeQueries({ message, fileId }: z.infer<typeof InitializationInputSchema>): Promise<{ companyName: string; ticker: string; ragQuery1: string; ragQuery2: string; webQuery1: string; webQuery2: string; economicQuery1: string; economicQuery2: string; latestNewsQuery: string; questionWebsearchQuery1: string; questionWebsearchQuery2: string; questionWebsearchQuery3: string }> {
  console.log('Starting initializeQueries');
  console.log('Received input:', { message, fileId });

  let companyName = 'Unknown';
  let ticker = 'Unknown';
  let ragQuery1 = '';
  let ragQuery2 = '';
  let webQuery1 = '';
  let webQuery2 = '';
  let economicQuery1 = '';
  let economicQuery2 = '';
  let latestNewsQuery = '';
  let questionWebsearchQuery1 = '';
  let questionWebsearchQuery2 = '';
  let questionWebsearchQuery3 = '';

  try {
    let pineconeResponse = await performPineconeSearch(message + " Limited", fileId);

    if (pineconeResponse.trim()) {
      console.log('Generating content request for LLM');
      const prompt = `
        From the following text, extract and return the Yahoo Finance ticker symbol that ends with .NS:
        ${pineconeResponse}

        Here is a list of potential companies and their ticker symbols:
        ${tickersList}
        
        Once you find the ticker, stop and return the result in the format:
        Company Name: <name>
        Ticker: <ticker>

        Additionally, generate eight-word queries based on the content to assist in further analysis:
        1. Company Query - Make this about this firm: CQ1 - <query> - CQ1
        2. Two Rag Queries - Formulate them using critical keywords to gather insightful information from the book The Intelligent Investor. This should be keywords that help answer the user's query. Do not mention the firm's name, or country here. Mention financial aspects: RQ1 - <query> - RQ1, RQ2 - <query> - RQ2
        3. Two Industry Web Queries - Provide web search questions that help gain an understanding of the industry the firm works in to answer the user's question: IW1 - <query> - IW1, IW2 - <query> - IW2
        4. Two Economic Web Queries - Provide web search questions that help gain an understanding of the country the firm works in to answer the user's question: EQ1 - <query> - EQ1, EQ2 - <query> - EQ2
        5. One Latest News Query - Provide web search questions that help gain an understanding of the latest news about the firm to answer the user's question: LQ1 - <query> - LQ1
        6. Three Question Websearch Queries to financially address the user's query. Do not make this about the ticker symbol. Formulate them using critical keywords to gather insightful information from the internet. These should be questions that help answer the user's query. Do not mention the firm's name, or country here. Mention financial aspects: QW1 - <query> - QW1, QW2 - <query> - QW2, QW3 - <query> - QW3
      `;

      const request: GenerateContentRequest = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      console.log('Sending request to generative model');
      const result: GenerateContentResult = await generativeModel.generateContent(request);
      console.log('LLM result received');

      const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log('LLM response text:', responseText);

      if (responseText) {
        const tickerMatch = responseText.match(/Ticker:\s*(\w+\.NS)/);
        const companyNameMatch = responseText.match(/Company Name:\s*(.+)/);

        ticker = tickerMatch?.[1] || 'Unknown';
        companyName = companyNameMatch?.[1].trim() || 'Unknown';

        console.log(`Ticker: ${ticker}`);
        console.log(`Company Name: ${companyName}`);

        const queryPattern = /(CQ1|RQ1|RQ2|IW1|IW2|EQ1|EQ2|LQ1|QW1|QW2|QW3)\s-\s(.*?)\s-\s\1/g;
        let match;
        while ((match = queryPattern.exec(responseText)) !== null) {
          const query = match[2];
          switch (match[1]) {
            case 'CQ1':
              break;
            case 'RQ1':
              ragQuery1 = query;
              break;
            case 'RQ2':
              ragQuery2 = query;
              break;
            case 'IW1':
              webQuery1 = query;
              break;
            case 'IW2':
              webQuery2 = query;
              break;
            case 'EQ1':
              economicQuery1 = query;
              break;
            case 'EQ2':
              economicQuery2 = query;
              break;
            case 'LQ1':
              latestNewsQuery = query;
              break;
            case 'QW1':
              questionWebsearchQuery1 = query;
              break;
            case 'QW2':
              questionWebsearchQuery2 = query;
              break;
            case 'QW3':
              questionWebsearchQuery3 = query;
              break;
          }
        }
        console.log('Generated queries:', { ragQuery1, ragQuery2, webQuery1, webQuery2, economicQuery1, economicQuery2, latestNewsQuery, questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3 });
      } else {
        console.log('No response text found');
      }
    } else {
      console.log('No relevant content found in Pinecone response');
    }
  } catch (error) {
    console.error('Error during initializeQueries:', error);
  }

  console.log('Final extracted values:');
  console.log(`Company Name: ${companyName}`);
  console.log(`Ticker: ${ticker}`);
  console.log('Queries:', { ragQuery1, ragQuery2, webQuery1, webQuery2, economicQuery1, economicQuery2, latestNewsQuery, questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3 });

  return { companyName, ticker, ragQuery1, ragQuery2, webQuery1, webQuery2, economicQuery1, economicQuery2, latestNewsQuery, questionWebsearchQuery1, questionWebsearchQuery2, questionWebsearchQuery3 };
}

const initializationTool = new DynamicStructuredTool({
  name: "initialization-tool",
  description: "Extracts company name, ticker symbol, and generates keyword summaries from Pinecone response using LLM",
  schema: InitializationInputSchema,
  func: initializeQueries,
});

export { initializationTool };
