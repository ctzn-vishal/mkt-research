import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { GoogleGenAI } from '@google/genai';
import { reportDataSchema, type ReportConfig, type ReportData } from '@/types/report';

export class ReportGenerator {
  private model = google('gemini-1.5-flash', {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }); // Use stable model version
  private genAI = new GoogleGenAI({ 
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    vertexai: false  // Force use of Gemini Developer API instead of Vertex AI
  });
  
  async generateReport(config: ReportConfig): Promise<ReportData> {
    try {
      console.log('Starting report generation for:', config.title);
      console.log('API Key available:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      
      // Step 1: Research with Google Search using native Google GenAI SDK
      const researchPrompt = this.buildResearchPrompt(config);
      console.log('Research prompt:', researchPrompt);
      
      // Use AI SDK for research generation without Google Search tools for now
      const { text: rawResearch } = await generateText({
        model: this.model,
        prompt: researchPrompt,
        maxTokens: 3000,
      });

      console.log('Research completed, length:', rawResearch.length);

      // Step 2: Generate structured report
      const analysisPrompt = this.buildAnalysisPrompt(rawResearch, config);
      console.log('Starting analysis...');
      
      const { object: reportData } = await generateObject({
        model: this.model,
        schema: reportDataSchema,
        prompt: analysisPrompt,
        maxTokens: 2000,
      });

      console.log('Report generated successfully');
      return reportData;
      
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  private buildResearchPrompt(config: ReportConfig): string {
    return `Generate comprehensive market research information about ${config.topic} ${config.timeframe ? `for ${config.timeframe}` : ''} ${config.region ? `in ${config.region}` : ''}.

Provide detailed information on:
1. Market size and growth data with specific numbers
2. Key players and market share percentages
3. Consumer trends and behavior patterns
4. Competitive landscape analysis
5. Growth drivers and challenges
6. Industry forecasts and projections

Analysis Type: ${config.analysisType}

Use your knowledge to provide realistic market data, growth rates, company names, and specific statistics. Make the research comprehensive and detailed with actual numbers where possible.`;
  }

  private buildAnalysisPrompt(research: string, config: ReportConfig): string {
    return `Based on the following research data, create a structured business report:

Research Data:
${research}

Generate a report with:
1. Executive Summary (2-3 key insights)
2. Key Findings (4-6 specific points with data)
3. Market Size information (current, projected, growth rate if available)
4. 2-3 charts with actual data from research
5. Strategic Recommendations (3-5 actionable items)

Ensure all data is factual and based on the research provided. For charts, use real numbers from the research.`;
  }
}
