import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { financialRatiosTool, yearlySalesTool } from '../tools/data';
import { DynamicStructuredTool } from "@langchain/core/tools";
import { googleSearchTool } from '../tools/googleSearchTool';

interface FinancialData {
  quickRatio: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  [key: string]: any;
}

interface YearlySalesData {
  date: string;
  sales: number;
}

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

const InitializationInputSchema = z.object({
  message: z.string().describe("The message to search for"),
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

async function initializeQueries({ message }: z.infer<typeof InitializationInputSchema>): Promise<{
  companyName: string;
  ticker: string;
  competitorName: string;
  competitorTicker: string;
  companyQuery: string;
  peRatio: number | null;
  quickRatio: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  roe: number | null;
  threeYearCAGR: number | null;
  threeYearSalesGrowth: number | null;
  threeYearRevenueGrowth: number | null;
  marketCap: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  financialData: FinancialData;
  news: string;
  companyYearlySales: YearlySalesData[];
  competitorYearlySales: YearlySalesData[];
}> {
  console.log('Starting initializeQueries');
  console.log('Received input:', { message });

  let companyName = 'Unknown';
  let ticker = 'Unknown';
  let competitorName = 'Unknown';
  let competitorTicker = 'Unknown';
  let companyQuery = '';
  let peRatio: number | null = null;
  let quickRatio: number | null = null;
  let currentRatio: number | null = null;
  let debtToEquity: number | null = null;
  let roe: number | null = null;
  let threeYearCAGR: number | null = null;
  let threeYearSalesGrowth: number | null = null;
  let threeYearRevenueGrowth: number | null = null;
  let marketCap: number | null = null;
  let forwardPE: number | null = null;
  let dividendYield: number | null = null;
  let financialData: FinancialData = {} as FinancialData;
  let news = '';
  let companyYearlySales: YearlySalesData[] = [];
  let competitorYearlySales: YearlySalesData[] = [];

  try {
    const prompt = `
      From the following text, extract and return the Yahoo Finance ticker symbol and a competitor firm's name and ticker symbol in the same industry:
      ${message}

      Here is a list of potential companies and their ticker symbols:
      ${tickersList}
      
      Match the closest name from the list or find the ticker symbol by yourself if not available in the list. 
      Once you find the ticker and competitor, stop and return the result in the format:
      Company Name: <name>
      Ticker: <ticker>
      Competitor Name: <name>
      Competitor Ticker: <ticker>
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    console.log('Sending request to generative model');
    const result = await model.generateContent(request);
    console.log('LLM result received');

    const responseText = result.response.text();
    console.log('LLM response text:', responseText);

    if (responseText) {
      const tickerMatch = responseText.match(/Ticker:\s*(\w+\.NS|\w+)/);
      const companyNameMatch = responseText.match(/Company Name:\s*(.+)/);
      const competitorTickerMatch = responseText.match(/Competitor Ticker:\s*(\w+\.NS|\w+)/);
      const competitorNameMatch = responseText.match(/Competitor Name:\s*(.+)/);

      ticker = tickerMatch?.[1] || 'Unknown';
      companyName = companyNameMatch?.[1].trim() || 'Unknown';
      competitorTicker = competitorTickerMatch?.[1] || 'Unknown';
      competitorName = competitorNameMatch?.[1].trim() || 'Unknown';

      console.log(`Ticker: ${ticker}`);
      console.log(`Company Name: ${companyName}`);
      console.log(`Competitor Ticker: ${competitorTicker}`);
      console.log(`Competitor Name: ${competitorName}`);

      if (ticker !== 'Unknown') {
        const ratios = await financialRatiosTool.func({ ticker });
        peRatio = ratios.peRatio;
        quickRatio = ratios.quickRatio;
        currentRatio = ratios.currentRatio;
        debtToEquity = ratios.debtToEquity;
        roe = ratios.roe;
        marketCap = ratios.marketCap;
        forwardPE = ratios.forwardPE;
        dividendYield = ratios.dividendYield;
        financialData = ratios;

        companyYearlySales = await yearlySalesTool.func({ ticker });

        console.log(`PE Ratio: ${peRatio}`);
        console.log(`Quick Ratio: ${quickRatio}`);
        console.log(`Current Ratio: ${currentRatio}`);
        console.log(`Debt to Equity: ${debtToEquity}`);
        console.log(`ROE: ${roe}`);
        console.log(`Market Cap: ${marketCap}`);
        console.log(`Forward PE: ${forwardPE}`);
        console.log(`Dividend Yield: ${dividendYield}`);
        console.log('Fetched Financial Data:', financialData);
        console.log('Fetched Yearly Sales Data:', companyYearlySales);
      }

      if (competitorTicker !== 'Unknown') {
        competitorYearlySales = await yearlySalesTool.func({ ticker: competitorTicker });
        console.log('Fetched Competitor Yearly Sales Data:', competitorYearlySales);
      }

      if (companyName !== 'Unknown') {
        const newsQuery = `Latest News about ${companyName}`;
        const newsResults = await googleSearchTool.func({ query: newsQuery });
        news = newsResults;
        console.log('Latest news:', news);
      }

      // Generate financial overview (companyQuery)
      const overviewPrompt = `
        Generate a 30-word detailed financial overview for the following company based on the provided financial data and latest news:

        Company Name: ${companyName}
        Ticker: ${ticker}
        PE Ratio: ${peRatio}
        Quick Ratio: ${quickRatio}
        Current Ratio: ${currentRatio}
        Debt to Equity: ${debtToEquity}
        ROE: ${roe}
        Market Cap: ${marketCap}
        Forward PE: ${forwardPE}
        Dividend Yield: ${dividendYield}

        Latest News: ${news}
      `;

      const overviewRequest = {
        contents: [{ role: 'user', parts: [{ text: overviewPrompt }] }],
      };

      console.log('Sending request to generative model for financial overview');
      const overviewResult = await model.generateContent(overviewRequest);
      console.log('LLM result received for financial overview');

      const overviewText = overviewResult.response.text();
      console.log('LLM financial overview text:', overviewText);

      if (overviewText) {
        companyQuery = overviewText;
      }
    } else {
      console.log('No response text found');
    }
  } catch (error) {
    console.error('Error during initializeQueries:', error);
  }

  return { 
    companyName, 
    ticker, 
    competitorName, 
    competitorTicker, 
    companyQuery, 
    peRatio, 
    quickRatio, 
    currentRatio, 
    debtToEquity, 
    roe, 
    threeYearCAGR, 
    threeYearSalesGrowth, 
    threeYearRevenueGrowth, 
    marketCap, 
    forwardPE, 
    dividendYield, 
    financialData, 
    news, 
    companyYearlySales, 
    competitorYearlySales 
  };
}

const initializationTool = new DynamicStructuredTool({
  name: "initialization-tool",
  description: "Extracts company name, ticker symbol, and competitor information. Fetches financial ratios, ROE, and fundamental data using Yahoo Finance. Generates a detailed financial overview.",
  schema: InitializationInputSchema,
  func: initializeQueries,
});

export { initializationTool, initializeQueries };
