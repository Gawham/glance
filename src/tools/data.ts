import { z } from "zod";
import yahooFinance from 'yahoo-finance2';
import { DynamicStructuredTool } from "@langchain/core/tools";

// Schema for fetching financial ratios
const FinancialRatiosInputSchema = z.object({
  ticker: z.string().describe("The stock ticker symbol"),
});

// Schema for fetching yearly sales
const YearlySalesInputSchema = z.object({
  ticker: z.string().describe("The stock ticker symbol"),
});

// Fetch financial ratios using Yahoo Finance API
async function fetchFinancialRatios({ ticker }: z.infer<typeof FinancialRatiosInputSchema>): Promise<any> {
  try {
    const [quote, statistics] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, { modules: ['financialData', 'defaultKeyStatistics', 'incomeStatementHistory'] })
    ]);

    const financialData = statistics?.financialData;

    return {
      currentPrice: quote.regularMarketPrice || null,  // Current price
      peRatio: quote.trailingPE || null,
      quickRatio: financialData?.quickRatio || null, // Optional chaining to avoid undefined error
      currentRatio: financialData?.currentRatio || null,
      debtToEquity: financialData?.debtToEquity || null,
      roe: financialData?.returnOnEquity || null,
      marketCap: quote.marketCap || null,
      forwardPE: quote.forwardPE || null,
      dividendYield: quote.trailingAnnualDividendYield || null,
    };
  } catch (error) {
    console.error('Error fetching financial ratios from Yahoo Finance:', error);
    return {};
  }
}

// Fetch yearly sales using Yahoo Finance API
async function fetchYearlySales({ ticker }: z.infer<typeof YearlySalesInputSchema>): Promise<any> {
  try {
    const financials = await yahooFinance.quoteSummary(ticker, { modules: ['incomeStatementHistory'] });
    const yearlySales = financials?.incomeStatementHistory?.incomeStatementHistory;

    if (!yearlySales || yearlySales.length === 0) {
      console.warn(`No yearly sales data found for ticker: ${ticker}`);
      return [];
    }

    // Return sales data in the same structure as before
    return yearlySales.map((year: any) => ({
      date: year.endDate,
      sales: year.totalRevenue,
    }));
  } catch (error) {
    console.error('Error fetching yearly sales data from Yahoo Finance:', error);
    return [];
  }
}

// Define DynamicStructuredTool for fetching financial ratios
const financialRatiosTool = new DynamicStructuredTool({
  name: "financial-ratios-tool",
  description: "Fetches financial ratios (PE Ratio, Quick Ratio, Current Ratio, Debt to Equity, ROE, etc.) for a company using Yahoo Finance.",
  schema: FinancialRatiosInputSchema,
  func: fetchFinancialRatios,
});

// Define DynamicStructuredTool for fetching yearly sales
const yearlySalesTool = new DynamicStructuredTool({
  name: "yearly-sales-tool",
  description: "Fetches yearly sales data for a company using Yahoo Finance.",
  schema: YearlySalesInputSchema,
  func: fetchYearlySales,
});

export { financialRatiosTool, yearlySalesTool };
