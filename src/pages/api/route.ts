import { NextRequest, NextResponse } from 'next/server';
import { FirmTickerValidator } from '@/lib/validators/FirmTickerValidator';
import { HarmBlockThreshold, HarmCategory, VertexAI, GenerateContentRequest, GenerateContentResult } from '@google-cloud/vertexai';

const project = 'secret-willow-427111-e1';
const location = 'asia-south1';
const textModel = 'gemini-1.5-flash';

const vertexAI = new VertexAI({ project, location });

const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
  generationConfig: { maxOutputTokens: 1024, temperature: 0 },
});

const tickersList = `
RELIANCE.NS - Reliance Industries Limited
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
AXISBANK.NS - Axis Bank Limited
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

async function getFirmTicker(firmName: string): Promise<{ companyName: string; ticker: string }> {
  let companyName = 'Unknown';
  let ticker = 'Unknown';

  try {
    const prompt = `
      From the following text, extract and return the Yahoo Finance ticker symbol that ends with .NS:
      ${firmName}

      Here is a list of potential companies and their ticker symbols:
      ${tickersList}
      
      Once you find the ticker, stop and return the result in the format:
      Company Name: <name>
      Ticker: <ticker>
    `;

    const request: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const result: GenerateContentResult = await generativeModel.generateContent(request);

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (responseText) {
      const tickerMatch = responseText.match(/Ticker:\s*(\w+\.NS)/);
      const companyNameMatch = responseText.match(/Company Name:\s*(.+)/);

      ticker = tickerMatch?.[1] || 'Unknown';
      companyName = companyNameMatch?.[1].trim() || 'Unknown';
    }
  } catch (error) {
    console.error('Error during getFirmTicker:', error);
  }

  return { companyName, ticker };
}

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { firmName } = FirmTickerValidator.parse(body);

  try {
    const result = await getFirmTicker(firmName);
    console.log('Firm Ticker Result:', result); // Log the result
    return new NextResponse(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during API request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
