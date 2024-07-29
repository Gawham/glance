import yahooFinance from 'yahoo-finance2';

export async function retrieveFundamentalData(ticker: string) {
    try {
        const quote = await yahooFinance.quoteSummary(ticker, { modules: ['price', 'summaryDetail', 'financialData'] });
        if (!quote || !quote.price || !quote.summaryDetail) {
            throw new Error('Incomplete data from Yahoo Finance');
        }
        const data = {
            ticker: quote.price.symbol,
            price: quote.price.regularMarketPrice,
            marketCap: quote.price.marketCap,
            peRatio: quote.summaryDetail.trailingPE,
            dividendYield: quote.summaryDetail.dividendYield,
            eps: quote.summaryDetail.epsTrailingTwelveMonths,
        };
        return data;
    } catch (error) {
        console.error('Error retrieving fundamental data:', error);
        throw new Error('Failed to retrieve fundamental data.');
    }
}

export const setupFundamentalAgent = async () => {
    return {
        func: retrieveFundamentalData,
    };
};

export const fundamentalDataRetrievalTool = {
    name: 'retrieveFundamentalData',
    func: retrieveFundamentalData,
};
