'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Share2, BarChart3 } from 'lucide-react';
import { type ReportData, type ReportConfig } from '@/types/report';

interface ReportViewerProps {
  reportData: ReportData;
  config: ReportConfig;
  onExport: (format: 'pdf' | 'html') => void;
  isExporting?: boolean;
}

export function ReportViewer({ reportData, config, onExport, isExporting }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'charts' | 'recommendations'>('summary');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{config.title}</CardTitle>
              {config.subtitle && (
                <p className="text-gray-600 mt-2">{config.subtitle}</p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>Type: {config.analysisType.replace('-', ' ').toUpperCase()}</span>
                <span>Generated: {new Date().toLocaleDateString()}</span>
                {config.timeframe && <span>Period: {config.timeframe}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('html')}
                disabled={isExporting}
              >
                <Eye className="w-4 h-4 mr-2" />
                HTML
              </Button>
              <Button
                size="sm"
                onClick={() => onExport('pdf')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'summary', label: 'Executive Summary', icon: FileText },
          { key: 'findings', label: 'Key Findings', icon: Eye },
          { key: 'charts', label: 'Charts', icon: BarChart3 },
          { key: 'recommendations', label: 'Recommendations', icon: Share2 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
                <p className="text-gray-700 leading-relaxed">{reportData.executiveSummary}</p>
              </div>
              
              {reportData.marketSize && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Market Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.marketSize.current && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.marketSize.current}
                          {reportData.marketSize.unit}
                        </div>
                        <div className="text-sm text-gray-600">Current Market Size</div>
                      </div>
                    )}
                    {reportData.marketSize.projected && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {reportData.marketSize.projected}
                          {reportData.marketSize.unit}
                        </div>
                        <div className="text-sm text-gray-600">Projected Size</div>
                      </div>
                    )}
                    {reportData.marketSize.growthRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.marketSize.growthRate}%
                        </div>
                        <div className="text-sm text-gray-600">Growth Rate</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'findings' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
              <ul className="space-y-3">
                {reportData.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Data Visualizations</h3>
              {reportData.charts.length > 0 ? (
                <div className="grid gap-6">
                  {reportData.charts.map((chart, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">{chart.title}</h4>
                      <div className="bg-gray-50 p-4 rounded text-center text-gray-500">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                        <p>Chart: {chart.type.toUpperCase()}</p>
                        <p className="text-sm">Labels: {chart.labels.length} items</p>
                        <p className="text-sm">Data points: {chart.datasets[0]?.data.length || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No charts available</p>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Strategic Recommendations</h3>
                <div className="space-y-3">
                  {reportData.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {reportData.riskFactors && reportData.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Risk Factors</h4>
                  <div className="space-y-2">
                    {reportData.riskFactors.map((risk, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <span className="text-gray-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
