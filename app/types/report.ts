import { z } from 'zod';

// Chart configuration schema
export const chartConfigSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'doughnut', 'radar']),
  title: z.string(),
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.array(z.string()).optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
  })),
  options: z.object({
    responsive: z.boolean().default(true),
    plugins: z.object({
      title: z.object({
        display: z.boolean().default(true),
        text: z.string(),
      }).optional(),
      legend: z.object({
        display: z.boolean().default(true),
      }).optional(),
    }).optional(),
  }).optional(),
});

// Report configuration schema
export const reportConfigSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  topic: z.string(),
  analysisType: z.enum(['market-analysis', 'competitive-analysis', 'trend-analysis', 'financial-analysis']),
  timeframe: z.string(),
  region: z.string().optional(),
  includeCharts: z.boolean().default(true),
  includeSources: z.boolean().default(true),
  format: z.enum(['pdf', 'html', 'markdown']).default('pdf'),
});

// Report data schema for structured output
export const reportDataSchema = z.object({
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  marketSize: z.object({
    current: z.number().optional(),
    projected: z.number().optional(),
    unit: z.string().optional(),
    growthRate: z.number().optional(),
  }).optional(),
  charts: z.array(chartConfigSchema),
  recommendations: z.array(z.string()),
  riskFactors: z.array(z.string()).optional(),
  methodology: z.string().optional(),
});

export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type ReportConfig = z.infer<typeof reportConfigSchema>;
export type ReportData = z.infer<typeof reportDataSchema>;

// UI Message metadata for report generation
export const reportMetadataSchema = z.object({
  step: z.enum(['research', 'analysis', 'charts', 'generation', 'export']),
  progress: z.number().min(0).max(100),
  estimatedTime: z.number().optional(),
  sourcesFound: z.number().optional(),
  chartsGenerated: z.number().optional(),
});

export type ReportMetadata = z.infer<typeof reportMetadataSchema>;
