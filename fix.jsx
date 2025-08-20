# ==================================================
# 🔧 COMPLETE FIX FOR MKT-RESEARCH ISSUES
# ==================================================

# Step 1: Clean existing installation
rm -rf node_modules package-lock.json

# ==================================================
# 📁 package.json - Fixed Dependencies
# ==================================================

{
  "name": "mkt-research",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next node_modules package-lock.json"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "ai": "^3.4.32",
    "@ai-sdk/google": "^0.0.54",
    "zod": "^3.23.8",
    "puppeteer": "^21.11.0",
    "chart.js": "^4.4.0",
    "chartjs-adapter-date-fns": "^3.0.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "15.0.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}

# ==================================================
# 📁 next.config.js - Fixed Configuration (NO TypeScript)
# ==================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove React 19 specific features that cause issues
    serverComponentsExternalPackages: ['puppeteer'],
  },
  
  // Webpack configuration for Puppeteer compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    
    // Handle canvas dependency issues
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // API route timeout for long report generation
  async rewrites() {
    return [];
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

# ==================================================
# 📁 app/types/report.ts - Simplified Types
# ==================================================

import { z } from 'zod';

// Simplified chart configuration
export const chartConfigSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'doughnut']),
  title: z.string(),
  labels: z.array(z.string()),
  data: z.array(z.number()),
  backgroundColor: z.array(z.string()).optional(),
  borderColor: z.string().optional(),
});

// Simplified report configuration
export const reportConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  analysisType: z.enum(['market-analysis', 'competitive-analysis', 'trend-analysis']),
  timeframe: z.string().optional(),
  region: z.string().optional(),
});

// Simplified report data
export const reportDataSchema = z.object({
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  marketSize: z.object({
    current: z.string().optional(),
    projected: z.string().optional(),
    growthRate: z.string().optional(),
  }).optional(),
  charts: z.array(chartConfigSchema),
  recommendations: z.array(z.string()),
});

export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type ReportConfig = z.infer<typeof reportConfigSchema>;
export type ReportData = z.infer<typeof reportDataSchema>;

# ==================================================
# 📁 app/lib/report-generator.ts - Simplified Implementation
# ==================================================

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { reportDataSchema, type ReportConfig, type ReportData } from '@/types/report';

export class ReportGenerator {
  private model = google('gemini-1.5-flash'); // Use stable model version
  
  async generateReport(config: ReportConfig): Promise<ReportData> {
    try {
      console.log('Starting report generation for:', config.title);
      
      // Step 1: Research with Google Search
      const researchPrompt = this.buildResearchPrompt(config);
      console.log('Research prompt:', researchPrompt);
      
      const { text: rawResearch } = await generateText({
        model: this.model,
        tools: {
          google_search: google.tools.googleSearch(),
        },
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
    return `Search the web for comprehensive information about ${config.topic} ${config.timeframe ? `for ${config.timeframe}` : ''} ${config.region ? `in ${config.region}` : ''}.

Focus on gathering:
1. Market size and growth data
2. Key players and market share
3. Consumer trends and behavior
4. Competitive landscape
5. Growth drivers and challenges

Analysis Type: ${config.analysisType}
Keep research factual and cite specific data points.`;
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

# ==================================================
# 📁 app/lib/report-exporter.ts - Simplified Exporter
# ==================================================

import puppeteer from 'puppeteer';
import { ReportData, ReportConfig } from '@/types/report';

export class ReportExporter {
  async exportToPDF(reportData: ReportData, config: ReportConfig): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      const html = this.generateHTML(reportData, config);
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.75in',
          bottom: '1in',
          left: '0.75in'
        },
      });

      return pdf;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  generateHTML(reportData: ReportData, config: ReportConfig): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .section {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
        }
        .executive-summary { background: #f8f9fa; border-left: 4px solid #3498db; }
        .key-findings { background: #fff; border: 1px solid #ddd; }
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            background: #fafafa;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
            width: 100%;
        }
        .recommendations {
            background: #e8f5e8;
            border-left: 4px solid #27ae60;
        }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <header>
        <h1>${config.title}</h1>
        <p><strong>Analysis Type:</strong> ${config.analysisType.replace('-', ' ').toUpperCase()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </header>

    <div class="section executive-summary">
        <h2>Executive Summary</h2>
        <p>${reportData.executiveSummary}</p>
    </div>

    <div class="section key-findings">
        <h2>Key Findings</h2>
        <ul>
            ${reportData.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </div>

    ${reportData.marketSize ? `
    <div class="section">
        <h2>Market Overview</h2>
        <div style="display: flex; gap: 20px; margin: 20px 0;">
            ${reportData.marketSize.current ? `
            <div style="flex: 1; background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Current Market Size</h3>
                <p style="font-size: 20px; font-weight: bold; color: #1976d2;">
                    ${reportData.marketSize.current}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.projected ? `
            <div style="flex: 1; background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Projected Size</h3>
                <p style="font-size: 20px; font-weight: bold; color: #7b1fa2;">
                    ${reportData.marketSize.projected}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.growthRate ? `
            <div style="flex: 1; background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Growth Rate</h3>
                <p style="font-size: 20px; font-weight: bold; color: #388e3c;">
                    ${reportData.marketSize.growthRate}
                </p>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${reportData.charts.length > 0 ? `
    <div class="section">
        <h2>Data Visualizations</h2>
        ${reportData.charts.map((chart, index) => `
        <div class="chart-container">
            <h3>${chart.title}</h3>
            <div class="chart-wrapper">
                <canvas id="chart${index + 1}" width="800" height="400"></canvas>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section recommendations">
        <h2>Strategic Recommendations</h2>
        <ul>
            ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <script>
        ${reportData.charts.map((chart, index) => `
        try {
            new Chart(document.getElementById('chart${index + 1}'), {
                type: '${chart.type}',
                data: {
                    labels: ${JSON.stringify(chart.labels)},
                    datasets: [{
                        label: '${chart.title}',
                        data: ${JSON.stringify(chart.data)},
                        backgroundColor: ${JSON.stringify(chart.backgroundColor || ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'])},
                        borderColor: '${chart.borderColor || '#2c3e50'}',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '${chart.title}'
                        }
                    }
                }
            });
        } catch(e) {
            console.error('Chart ${index + 1} error:', e);
        }
        `).join('')}
    </script>
</body>
</html>`;
  }
}

# ==================================================
# 📁 app/api/report/generate/route.ts - Simplified API
# ==================================================

import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator } from '@/lib/report-generator';
import { reportConfigSchema } from '@/types/report';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received request:', body);
    
    // Validate input
    const config = reportConfigSchema.parse(body);
    
    // Generate report
    const generator = new ReportGenerator();
    const reportData = await generator.generateReport(config);
    
    return NextResponse.json({ 
      success: true, 
      data: reportData 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate report',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

# ==================================================
# 📁 app/api/report/export/route.ts - Export API
# ==================================================

import { NextRequest, NextResponse } from 'next/server';
import { ReportExporter } from '@/lib/report-exporter';
import { reportDataSchema, reportConfigSchema } from '@/types/report';

export async function POST(req: NextRequest) {
  try {
    const { reportData, config } = await req.json();
    
    // Validate input
    const validatedData = reportDataSchema.parse(reportData);
    const validatedConfig = reportConfigSchema.parse(config);
    
    // Generate PDF
    const exporter = new ReportExporter();
    const pdfBuffer = await exporter.exportToPDF(validatedData, validatedConfig);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${validatedConfig.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Export Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Export failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

# ==================================================
# 📁 app/components/report-generator-form.tsx - Simplified Form
# ==================================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ReportConfig } from '@/types/report';

interface ReportGeneratorFormProps {
  onSubmit: (config: ReportConfig) => void;
  isLoading: boolean;
}

export function ReportGeneratorForm({ onSubmit, isLoading }: ReportGeneratorFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    analysisType: 'market-analysis' as const,
    timeframe: '2024-2025',
    region: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.topic.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Market Research Generator</CardTitle>
        <CardDescription>
          Generate comprehensive market research reports powered by Google Gemini AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Plant-Based Milk Market Analysis"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic *</Label>
            <Textarea
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Plant-based milk market trends, growth, and key players in North America"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="analysisType">Analysis Type</Label>
              <select
                id="analysisType"
                value={formData.analysisType}
                onChange={(e) => setFormData(prev => ({ ...prev, analysisType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="market-analysis">Market Analysis</option>
                <option value="competitive-analysis">Competitive Analysis</option>
                <option value="trend-analysis">Trend Analysis</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Input
                id="timeframe"
                value={formData.timeframe}
                onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                placeholder="2024-2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region (Optional)</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              placeholder="North America"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating Report...' : 'Generate Market Research Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

# ==================================================
# 📁 app/page.tsx - Simplified Main Page
# ==================================================

'use client';

import { useState } from 'react';
import { ReportGeneratorForm } from '@/components/report-generator-form';
import { type ReportConfig, type ReportData } from '@/types/report';

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ReportConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (config: ReportConfig) => {
    setIsGenerating(true);
    setError(null);
    setReportData(null);
    setCurrentConfig(config);

    try {
      console.log('Starting report generation...');
      
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      setReportData(result.data);
      console.log('Report generated successfully');
      
    } catch (error) {
      console.error('Report generation failed:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportData || !currentConfig) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/report/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData,
          config: currentConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentConfig.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AI Market Research Generator</h1>
          <p className="text-xl text-gray-600">
            Generate comprehensive market research reports using Google Gemini AI
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        {!reportData && (
          <ReportGeneratorForm onSubmit={generateReport} isLoading={isGenerating} />
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating your market research report...</p>
          </div>
        )}

        {/* Results */}
        {reportData && currentConfig && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{currentConfig.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => {
                    setReportData(null);
                    setCurrentConfig(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  New Report
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <p className="text-gray-700">{reportData.executiveSummary}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
                <ul className="list-disc list-inside space-y-1">
                  {reportData.keyFindings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>

              {reportData.marketSize && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Market Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.marketSize.current && (
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.marketSize.current}
                        </div>
                        <div className="text-sm text-blue-800">Current Size</div>
                      </div>
                    )}
                    {reportData.marketSize.projected && (
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {reportData.marketSize.projected}
                        </div>
                        <div className="text-sm text-purple-800">Projected Size</div>
                      </div>
                    )}
                    {reportData.marketSize.growthRate && (
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.marketSize.growthRate}
                        </div>
                        <div className="text-sm text-green-800">Growth Rate</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Strategic Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {reportData.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>

              {reportData.charts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Charts Generated</h3>
                  <div className="grid gap-4">
                    {reportData.charts.map((chart, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{chart.title}</h4>
                        <p className="text-sm text-gray-600">
                          Type: {chart.type.toUpperCase()} | Data Points: {chart.data.length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

# ==================================================
# 📁 Installation & Fix Commands
# ==================================================

# STEP 1: Clean everything
echo "🧹 Cleaning existing installation..."
rm -rf node_modules package-lock.json .next

# STEP 2: Fix Next.js config
echo "🔧 Converting next.config.ts to next.config.js..."
rm -f next.config.ts

# STEP 3: Install with correct versions
echo "📦 Installing dependencies..."
npm install --save next@15.0.3 react@^18.3.1 react-dom@^18.3.1
npm install --save ai@^3.4.32 @ai-sdk/google@^0.0.54
npm install --save zod@^3.23.8 puppeteer@^21.11.0
npm install --save chart.js@^4.4.0 chartjs-adapter-date-fns@^3.0.0 date-fns@^3.6.0
npm install --save lucide-react@^0.263.1 class-variance-authority@^0.7.0 clsx@^2.1.1 tailwind-merge@^2.3.0
npm install --save @radix-ui/react-dialog@^1.0.5 @radix-ui/react-label@^2.0.2 @radix-ui/react-select@^2.0.0 @radix-ui/react-slot@^1.0.2
npm install --save tailwindcss-animate@^1.0.7

# STEP 4: Install dev dependencies
npm install --save-dev typescript@^5 @types/node@^20 @types/react@^18 @types/react-dom@^18
npm install --save-dev autoprefixer@^10.0.1 eslint@^8 eslint-config-next@15.0.3 postcss@^8 tailwindcss@^3.4.1

# STEP 5: Initialize shadcn/ui (if not already done)
echo "🎨 Setting up shadcn/ui components..."
npx shadcn@latest init --yes --defaults
npx shadcn@latest add button card input label textarea

# STEP 6: Security audit fix
echo "🔒 Fixing security vulnerabilities..."
npm audit fix --force

# STEP 7: Verify installation
echo "✅ Verifying installation..."
npm list --depth=0

# STEP 8: Test the application
echo "🚀 Starting development server..."
npm run dev

# ==================================================
# 📁 .env.local - Environment Variables Template
# ==================================================

# Google Gemini AI API Key (required)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Optional: For production deployment
NEXTAUTH_SECRET=your_secret_key_for_production
NEXTAUTH_URL=http://localhost:3000

# ==================================================
# 📁 components.json - shadcn/ui Configuration
# ==================================================

{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}

# ==================================================
# 📁 lib/utils.ts - Utility Functions
# ==================================================

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

# ==================================================
# 📁 TROUBLESHOOTING GUIDE
# ==================================================

## Common Issues and Solutions

### 1. Next.js Configuration Error
❌ Error: Configuring Next.js via 'next.config.ts' is not supported
✅ Solution: Use next.config.js instead (included above)

### 2. React Version Conflicts
❌ Error: React 18 vs 19 version mismatches
✅ Solution: Use React 18.3.1 (stable) instead of React 19

### 3. AI SDK Version Issues
❌ Error: No matching version found for @ai-sdk/rsc@^0.1.17
✅ Solution: Use stable AI SDK v3.4.32 instead of beta versions

### 4. Puppeteer Issues
❌ Error: Puppeteer launch failures or canvas errors
✅ Solution: Use Puppeteer v21.11.0 with proper webpack config

### 5. Dependency Conflicts
❌ Error: Peer dependency warnings and conflicts
✅ Solution: Use exact versions specified in package.json above

### 6. Build Failures
❌ Error: TypeScript compilation errors
✅ Solution: Use simplified types and remove complex generics

### 7. Chart.js Integration
❌ Error: Chart rendering issues in PDF
✅ Solution: Use stable Chart.js v4.4.0 with proper canvas handling

## Testing Steps

1. **Clean Installation Test:**
   ```bash
   rm -rf node_modules package-lock.json .next
   npm install
   ```

2. **Development Server Test:**
   ```bash
   npm run dev
   ```

3. **API Endpoint Test:**
   - Visit http://localhost:3000
   - Fill out the form
   - Submit and check browser console for errors

4. **PDF Generation Test:**
   - Generate a report successfully
   - Click "Download PDF" button
   - Verify PDF downloads correctly

5. **Production Build Test:**
   ```bash
   npm run build
   npm start
   ```

## Key Changes Made

1. **Simplified Dependencies:** Removed beta versions and React 19
2. **Fixed Configuration:** Converted TypeScript config to JavaScript
3. **Stable AI SDK:** Used production-ready AI SDK v3.4.32
4. **Better Error Handling:** Added comprehensive try-catch blocks
5. **Simplified Types:** Removed complex generics that caused issues
6. **Puppeteer Fixes:** Added proper webpack configuration
7. **Security Fixes:** Updated vulnerable packages
8. **Better UX:** Added loading states and error messages

## Next Steps After Fixing

1. Test the basic functionality
2. Add more advanced features gradually
3. Implement proper error logging
4. Add rate limiting for production
5. Consider adding authentication
6. Implement report caching
7. Add more chart types
8. Improve PDF styling

This fix should resolve all the major issues you were experiencing. The key is using stable versions and avoiding the bleeding-edge features that aren't ready for production yet.