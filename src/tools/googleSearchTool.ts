import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
const { google } = require('googleapis');

const GoogleSearchInputSchema = z.object({
  query: z.string(),
});

async function performGoogleSearch({ query }: { query: string }): Promise<string> {
  console.log('Performing Google search for:', query);
  const customsearch = google.customsearch('v1');

  const res = await customsearch.cse.list({
    cx: process.env.engine_ID, // Programmable Search Engine ID
    q: query,
    auth: process.env.GoogleSearch_APi, // API key
    num: 5,
  });

  const results = res.data.items || [];
  const responseText = results.map((result: any, index: number) => `
    ${index + 1}. ${result.snippet}
  `).join('\n\n');
  console.log('Google search results:', responseText);
  return responseText.slice(0, 1000); // Limit to 1000 characters
}

const googleSearchTool = new DynamicStructuredTool({
  name: "google-search",
  description: "Performs a web search using Google Search and returns the results",
  schema: GoogleSearchInputSchema,
  func: performGoogleSearch,
});

export { googleSearchTool };
