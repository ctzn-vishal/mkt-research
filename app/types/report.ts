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

// UI Message metadata for report generation
export const reportMetadataSchema = z.object({
  step: z.enum(['research', 'analysis', 'charts', 'generation', 'export']),
  progress: z.number().min(0).max(100),
  estimatedTime: z.number().optional(),
  sourcesFound: z.number().optional(),
  chartsGenerated: z.number().optional(),
});

export type ReportMetadata = z.infer<typeof reportMetadataSchema>;
