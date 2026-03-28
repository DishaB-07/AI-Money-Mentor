import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function extractFinancialData(base64Data: string, mimeType: string) {
  try {
    const prompt = `
      You are a highly accurate financial document analyzer. 
      Extract key financial information from this document (salary slip, bank statement, or tax form).
      
      Rules:
      1. Look for "Gross Pay", "Net Pay", "Basic", "Total Income" for income.
      2. Look for "Balance", "Total Savings", "Available Balance" for savings.
      3. Look for "Loan", "Outstanding", "EMI", "Credit Card Due" for debt.
      4. Look for "80C", "PPF", "EPF", "ELSS", "Life Insurance" for sec80c.
      5. Look for "80D", "Medical Insurance", "Health Insurance" for sec80d.
      6. Look for "HRA", "House Rent Allowance" for hraExemption.
      
      Return ONLY a JSON object with these fields. If a value is not found, use 0.
      Ensure all values are numbers (INR).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            income: { type: Type.NUMBER, description: "Annual or monthly income" },
            savings: { type: Type.NUMBER, description: "Current savings or bank balance" },
            debt: { type: Type.NUMBER, description: "Current outstanding loans or debt" },
            sec80c: { type: Type.NUMBER, description: "Tax deductions under section 80C" },
            sec80d: { type: Type.NUMBER, description: "Tax deductions under section 80D" },
            hraExemption: { type: Type.NUMBER, description: "HRA exemption amount" }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract data from the document. Please ensure it's a clear financial statement.");
  }
}

export async function analyzePortfolio(base64Data: string, mimeType: string, language: string = 'English') {
  try {
    const prompt = `
      You are a professional Mutual Fund Portfolio Analyst.
      Analyze this Mutual Fund CAS (Consolidated Account Statement) PDF or image.
      
      Tasks:
      1. Identify all Mutual Fund schemes and their current market values.
      2. Calculate the weighted average XIRR if possible, or estimate based on fund performance.
      3. Identify portfolio overlap (common stocks between different funds).
      4. Calculate weighted average Expense Ratio.
      5. Compare performance against Nifty 50 or relevant benchmarks.
      
      Return ONLY a JSON object matching the requested structure. 
      Ensure insights are in ${language} and are strategic (e.g., "Too much exposure to Small Caps", "High overlap in Large Cap funds").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            xirr: { type: Type.STRING },
            overlap: { type: Type.STRING },
            expenseRatio: { type: Type.STRING },
            benchmarkDiff: { type: Type.STRING },
            rebalanceNeeded: { type: Type.BOOLEAN },
            holdings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weight: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Portfolio Analysis Error:", error);
    throw error;
  }
}

export async function getFinancialInsight(contextType: string, data: any, language: string = 'English') {
  try {
    const prompt = `
      You are DhanSetu, an expert Indian CA and financial mentor. 
      Analyze the following calculated financial data and provide strategic insights. 
      DO NOT do math. Focus on execution, Indian context (mention things like PPF, EPF, ELSS, Term Insurance), and clear next steps.
      Keep it conversational, empathetic, and actionable. Max 3 short paragraphs.
      
      Language: ${language}
      Context: ${contextType}
      Calculated Data: ${JSON.stringify(data)}
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "I'm having trouble generating insights right now, but your calculations are ready above.";
  }
}

export function createChat(history: any[], language: string = 'English', highThinking: boolean = false) {
  const formattedHistory = history.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const model = highThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  const config: any = {
    systemInstruction: `You are DhanSetu, a friendly CA and financial mentor for India. 
    Keep your replies VERY SHORT, SIMPLE, and EASY to understand. 
    Use bullet points for lists. Avoid all financial jargon or explain it simply.
    By default, respond in ${language}. 
    If the user asks a complex question, break it down into 2-3 simple steps.
    Max 150 words per response.`,
  };

  if (highThinking) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  return ai.chats.create({
    model,
    config,
    history: formattedHistory,
  });
}
