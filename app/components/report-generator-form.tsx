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
