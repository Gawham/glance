const project = 'secret-willow-427111-e1';
const location = 'asia-south1';
const modelId = 'gemini-1.5-flash';
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;

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
  console.log('Starting getFirmTicker');
  console.log('Received firmName:', firmName);

  let companyName = 'Unknown';
  let ticker = 'Unknown';

  try {
    console.log('Generating content request for LLM');
    const prompt = `
      Based on the firm name "${firmName}", find and return the Yahoo Finance ticker symbol that ends with .NS from the following list:
      ${tickersList}
      
      Format the result as:
      Company Name: <name>
      Ticker: <ticker>
    `;

    const requestBody = {
      instances: [{ content: prompt }],
      parameters: {
        maxOutputTokens: 1024,
        temperature: 0,
      },
    };

    console.log('Sending request to generative model');
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/models/${modelId}:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    console.log('LLM result received', result);

    const responseText = result.predictions?.[0]?.content?.trim();
    console.log('LLM response text:', responseText);

    if (responseText) {
      const tickerMatch = responseText.match(/Ticker:\s*(\w+\.NS)/);
      const companyNameMatch = responseText.match(/Company Name:\s*(.+)/);

      ticker = tickerMatch?.[1] || 'Unknown';
      companyName = companyNameMatch?.[1].trim() || 'Unknown';

      console.log(`Ticker: ${ticker}`);
      console.log(`Company Name: ${companyName}`);
    } else {
      console.log('No response text found');
    }
  } catch (error) {
    console.error('Error during getFirmTicker:', error);
  }

  console.log('Final extracted values:');
  console.log(`Company Name: ${companyName}`);
  console.log(`Ticker: ${ticker}`);

  return { companyName, ticker };
}

export { getFirmTicker };
