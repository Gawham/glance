import yahooFinance from 'yahoo-finance2';
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

interface FinancialData {
  quickRatio: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  [key: string]: any; // To allow for other properties that might exist on financialData
}

const FinancialDataInputSchema = z.object({
  ticker: z.string(),
});

async function fetchFinancialRatios({ ticker }: z.infer<typeof FinancialDataInputSchema>): Promise<{
  peRatio: number | null;
  quickRatio: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  roe: number | null;
  threeYearCAGR: number | null;
  marketCap: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  financialData: FinancialData; // Add financialData to the returned object
}> {
  try {
    const quote = await yahooFinance.quote(ticker);
    const peRatio = quote.trailingPE || null;
    const marketCap = quote.marketCap || null;
    const forwardPE = quote.forwardPE || null;
    const dividendYield = quote.trailingAnnualDividendYield || null;

    const statistics = await yahooFinance.quoteSummary(ticker, { modules: ['financialData', 'defaultKeyStatistics', 'incomeStatementHistory'] });
    const financialData = statistics?.financialData as FinancialData;

    const quickRatio = financialData.quickRatio || null;
    const currentRatio = financialData.currentRatio || null;
    const debtToEquity = financialData.debtToEquity || null;
    const roe = financialData.returnOnEquity || null;

    const today = new Date();
    const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

    const historicalData = await yahooFinance.historical(ticker, { period1: threeYearsAgo.toISOString().split('T')[0], period2: today.toISOString().split('T')[0], interval: '1mo' });

    if (historicalData.length < 36) {
      throw new Error('Insufficient historical data to calculate 3-year CAGR.');
    }

    const initialRevenue = historicalData[0]?.adjClose;
    const finalRevenue = historicalData[historicalData.length - 1]?.adjClose;

    if (initialRevenue === undefined || finalRevenue === undefined) {
      throw new Error('Unable to determine initial or final revenue for 3-year CAGR calculation.');
    }

    const threeYearCAGR = ((finalRevenue / initialRevenue) ** (1 / 3) - 1) * 100;

    return {
      peRatio,
      quickRatio,
      currentRatio,
      debtToEquity,
      roe,
      threeYearCAGR,
      marketCap,
      forwardPE,
      dividendYield,
      financialData, // Include financialData in the returned object
    };
  } catch (error) {
    console.error('Error fetching financial ratios from Yahoo Finance:', error);
    return {
      peRatio: null,
      quickRatio: null,
      currentRatio: null,
      debtToEquity: null,
      roe: null,
      threeYearCAGR: null,
      marketCap: null,
      forwardPE: null,
      dividendYield: null,
      financialData: {} as FinancialData, // Return an empty object cast to FinancialData
    };
  }
}

const financialDataTool = new DynamicStructuredTool({
  name: "financial-data-tool",
  description: "Fetches financial ratios and fundamental data using Yahoo Finance",
  schema: FinancialDataInputSchema,
  func: fetchFinancialRatios,
});

export { financialDataTool };
