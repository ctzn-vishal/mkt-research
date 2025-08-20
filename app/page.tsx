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
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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
