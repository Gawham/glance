import yahooFinance from 'yahoo-finance2';
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

interface FinancialData {
  quickRatio: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
}

const YahooFinanceInputSchema = z.object({
  ticker: z.string(),
});

async function getFundamentalData({ ticker }: { ticker: string }): Promise<string> {
  try {
    console.log('Retrieving fundamental data for ticker:', ticker);
    const quote = await yahooFinance.quote(ticker);
    const peRatio = quote.trailingPE || null;
    const marketCap = quote.marketCap || null;
    const forwardPE = quote.forwardPE || null;
    const dividendYield = quote.trailingAnnualDividendYield || null;

    const statistics = await yahooFinance.quoteSummary(ticker, {
      modules: ['financialData', 'defaultKeyStatistics', 'incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory']
    });
    const financialData = statistics?.financialData as FinancialData;

    const quickRatio = financialData.quickRatio || null;
    const currentRatio = financialData.currentRatio || null;
    const debtToEquity = financialData.debtToEquity || null;
    const roe = financialData.returnOnEquity || null;

    const today = new Date();
    const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

    const historicalData = await yahooFinance.historical(ticker, {
      period1: threeYearsAgo.toISOString().split('T')[0],
      period2: today.toISOString().split('T')[0],
      interval: '1mo'
    });

    if (historicalData.length < 36) {
      throw new Error('Insufficient historical data to calculate 3-year CAGR.');
    }

    const initialRevenue = historicalData[0]?.adjClose;
    const finalRevenue = historicalData[historicalData.length - 1]?.adjClose;

    if (initialRevenue === undefined || finalRevenue === undefined) {
      throw new Error('Unable to determine initial or final revenue for 3-year CAGR calculation.');
    }

    const threeYearCAGR = ((finalRevenue / initialRevenue) ** (1 / 3) - 1) * 100;
    const threeYearSalesGrowth = threeYearCAGR; // Assuming sales growth is proportional to stock price growth for this example
    const threeYearRevenueGrowth = threeYearCAGR; // Assuming revenue growth is proportional to stock price growth for this example

    const fundamentalsTimeSeries = await yahooFinance.fundamentalsTimeSeries(ticker, {
      period1: '2020-01-01',
      module: 'all' // Use 'all' to fetch comprehensive data
    });

    // Remove 'endDate' from the financial statements
    const filteredBalanceSheetHistory = statistics.balanceSheetHistory?.balanceSheetStatements.map(statement => {
      const { endDate, ...rest } = statement;
      return rest;
    });

    const filteredIncomeStatementHistory = statistics.incomeStatementHistory?.incomeStatementHistory.map(statement => {
      const { endDate, ...rest } = statement;
      return rest;
    });

    const filteredCashflowStatementHistory = statistics.cashflowStatementHistory?.cashflowStatements.map(statement => {
      const { endDate, ...rest } = statement;
      return rest;
    });

    const response = {
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
      financialData: {
        quickRatio,
        currentRatio,
        debtToEquity,
        returnOnEquity: roe
      },
      balanceSheetHistory: filteredBalanceSheetHistory,
      incomeStatementHistory: filteredIncomeStatementHistory,
      cashflowStatementHistory: filteredCashflowStatementHistory,
      fundamentalsTimeSeries
    };

    console.log('Fundamental data results:', JSON.stringify(response, null, 2));
    return JSON.stringify(response, null, 2);
  } catch (error) {
    console.error('Error retrieving fundamental data:', error);
    return 'Error retrieving fundamental data.';
  }
}

const fundamentalDataRetrievalTool = new DynamicStructuredTool({
  name: "fundamental-data",
  description: "Fetches comprehensive fundamental data for a given ticker from Yahoo Finance",
  schema: YahooFinanceInputSchema,
  func: getFundamentalData,
});

export { fundamentalDataRetrievalTool };
