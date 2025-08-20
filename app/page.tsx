'use client';

import { useState } from 'react';
import { ReportGeneratorForm } from '@/components/report-generator-form';
import { ReportProgress } from '@/components/report-progress';
import { ReportViewer } from '@/components/report-viewer';
import { type ReportConfig, type ReportData, type ReportMetadata } from '@/types/report';

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ReportMetadata | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ReportConfig | null>(null);

  const generateReport = async (config: ReportConfig) => {
    setIsGenerating(true);
    setProgress(null);
    setReportData(null);
    setCurrentConfig(config);

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.step && typeof data.progress === 'number') {
                  setProgress(data as ReportMetadata);
                }

                if (data.message) {
                  setCurrentMessage(data.message);
                }

                if (data.data && data.progress === 100) {
                  setReportData(data.data);
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      setCurrentMessage('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'html') => {
    if (!reportData || !currentConfig) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/report/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData,
          config: currentConfig,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentConfig.title.replace(/[^a-zA-Z0-9]/g, '-')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AI Report Generator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate comprehensive business reports with AI-powered research, analysis, and professional formatting
          </p>
        </div>

        {/* Main Content */}
        {!isGenerating && !reportData && (
          <ReportGeneratorForm onSubmit={generateReport} isLoading={isGenerating} />
        )}

        {isGenerating && progress && (
          <ReportProgress progress={progress} currentMessage={currentMessage} />
        )}

        {reportData && currentConfig && (
          <ReportViewer
            reportData={reportData}
            config={currentConfig}
            onExport={exportReport}
            isExporting={isExporting}
          />
        )}

        {/* Reset Button */}
        {(reportData || isGenerating) && (
          <div className="text-center">
            <button
              onClick={() => {
                setIsGenerating(false);
                setProgress(null);
                setReportData(null);
                setCurrentConfig(null);
                setCurrentMessage('');
              }}
              className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Generate New Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
