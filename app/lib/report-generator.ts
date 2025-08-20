import { generateText, generateObject, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { reportDataSchema, chartConfigSchema, type ReportConfig, type ReportData } from '@/types/report';

export class ReportGenerator {
  private model = google('gemini-2.5-flash');
  
  async generateReport(config: ReportConfig): Promise<ReportData> {
    // Step 1: Research Phase
    const researchPrompt = this.buildResearchPrompt(config);
    const { text: rawResearch, sources } = await generateText({
      model: this.model,
      tools: {
        google_search: google.tools.googleSearch({}),
      },
      prompt: researchPrompt,
      maxTokens: 4000,
    });

    // Step 2: Structured Analysis
    const { object: reportData } = await generateObject({
      model: this.model,
      schema: reportDataSchema,
      prompt: this.buildAnalysisPrompt(rawResearch, config),
      maxTokens: 3000,
    });

    // Step 3: Enhanced Charts Generation
    const enhancedCharts = await this.enhanceCharts(reportData.charts, rawResearch);
    
    return {
      ...reportData,
      charts: enhancedCharts,
    };
  }

  async *streamReportGeneration(config: ReportConfig) {
    yield { step: 'research', progress: 10, message: 'Starting market research...' };
    
    // Research with streaming
    const researchResult = await streamText({
      model: this.model,
      tools: {
        google_search: google.tools.googleSearch({}),
      },
      prompt: this.buildResearchPrompt(config),
    });

    let researchText = '';
    let sources: any[] = [];
    
    for await (const chunk of researchResult.fullStream) {
      if (chunk.type === 'text-delta') {
        researchText += chunk.delta;
        yield { 
          step: 'research', 
          progress: Math.min(30, (researchText.length / 2000) * 20 + 10),
          message: 'Gathering research data...',
          data: researchText.slice(-200)
        };
      }
      if (chunk.type === 'tool-result' && chunk.toolName === 'google_search') {
        sources.push(chunk.result);
        yield {
          step: 'research',
          progress: 35,
          message: `Found ${sources.length} sources`,
          sourcesFound: sources.length
        };
      }
    }

    yield { step: 'analysis', progress: 40, message: 'Analyzing research data...' };
    
    // Generate structured analysis
    const { object: reportData } = await generateObject({
      model: this.model,
      schema: reportDataSchema,
      prompt: this.buildAnalysisPrompt(researchText, config),
    });

    yield { step: 'charts', progress: 60, message: 'Generating visualizations...' };
    
    // Generate enhanced charts
    const charts = await this.enhanceCharts(reportData.charts, researchText);
    
    yield { 
      step: 'charts', 
      progress: 80, 
      message: 'Charts generated',
      chartsGenerated: charts.length 
    };

    yield { step: 'generation', progress: 90, message: 'Finalizing report...' };
    
    const finalReport = {
      ...reportData,
      charts,
    };

    yield { 
      step: 'generation', 
      progress: 100, 
      message: 'Report complete!',
      data: finalReport 
    };
  }

  private buildResearchPrompt(config: ReportConfig): string {
    return `Search the web for comprehensive information about ${config.topic} ${config.timeframe ? `for ${config.timeframe}` : ''} ${config.region ? `in ${config.region}` : ''}.

Focus on gathering:
1. Market size and growth metrics
2. Key players and market share data
3. Consumer behavior and trends
4. Competitive landscape
5. Growth drivers and challenges
6. Future projections and forecasts

Analysis Type: ${config.analysisType}
Required depth: Professional analyst level
Sources needed: Recent, authoritative business and market research sources`;
  }

  private buildAnalysisPrompt(research: string, config: ReportConfig): string {
    return `As an expert business analyst, analyze the following research data and create a structured report.

Research Data:
${research}

Generate a comprehensive analysis with:
1. Executive Summary (2-3 key insights)
2. Key Findings (5-7 specific data points)
3. Market Size information (if available)
4. 3-4 meaningful charts with proper data
5. Strategic Recommendations (3-5 actionable items)
6. Risk Factors (if applicable)
7. Methodology notes

Charts should include:
- Market size/growth charts (bar or line)
- Market share charts (pie or doughnut)
- Trend analysis (line charts)
- Competitive comparison (bar charts)

Make sure all data is factual and based on the research provided.`;
  }

  private async enhanceCharts(charts: any[], research: string): Promise<any[]> {
    // Enhance chart configurations with better styling and data validation
    return charts.map((chart, index) => ({
      ...chart,
      id: `chart-${index + 1}`,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chart.title,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: chart.type === 'line' || chart.type === 'bar' ? {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' }
          }
        } : undefined
      }
    }));
  }
}
