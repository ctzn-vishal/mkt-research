'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reportConfigSchema, type ReportConfig } from '@/types/report';

interface ReportGeneratorFormProps {
  onSubmit: (config: ReportConfig) => void;
  isLoading: boolean;
}

export function ReportGeneratorForm({ onSubmit, isLoading }: ReportGeneratorFormProps) {
  const [formData, setFormData] = useState<Partial<ReportConfig>>({
    title: '',
    topic: '',
    analysisType: 'market-analysis',
    timeframe: '2024-2025',
    format: 'pdf',
    includeCharts: true,
    includeSources: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedConfig = reportConfigSchema.parse(formData);
      onSubmit(validatedConfig);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const updateField = (field: keyof ReportConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Report Generator</CardTitle>
        <CardDescription>
          Generate comprehensive business reports with AI-powered research and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Market Analysis Report"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="analysisType">Analysis Type</Label>
              <Select 
                value={formData.analysisType} 
                onValueChange={(value) => updateField('analysisType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market-analysis">Market Analysis</SelectItem>
                  <SelectItem value="competitive-analysis">Competitive Analysis</SelectItem>
                  <SelectItem value="trend-analysis">Trend Analysis</SelectItem>
                  <SelectItem value="financial-analysis">Financial Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic</Label>
            <Textarea
              id="topic"
              value={formData.topic || ''}
              onChange={(e) => updateField('topic', e.target.value)}
              placeholder="Plant-based milk market in North America"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Input
                id="timeframe"
                value={formData.timeframe || ''}
                onChange={(e) => updateField('timeframe', e.target.value)}
                placeholder="2024-2025"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region (Optional)</Label>
              <Input
                id="region"
                value={formData.region || ''}
                onChange={(e) => updateField('region', e.target.value)}
                placeholder="North America"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (Optional)</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Comprehensive market analysis and strategic insights"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeCharts"
                checked={formData.includeCharts || false}
                onChange={(e) => updateField('includeCharts', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="includeCharts">Include Charts</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeSources"
                checked={formData.includeSources || false}
                onChange={(e) => updateField('includeSources', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="includeSources">Include Sources</Label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
