'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Search, BarChart3, FileText, Download } from 'lucide-react';
import { type ReportMetadata } from '@/types/report';

interface ReportProgressProps {
  progress: ReportMetadata;
  currentMessage?: string;
}

export function ReportProgress({ progress, currentMessage }: ReportProgressProps) {
  const steps = [
    { key: 'research', label: 'Research', icon: Search, description: 'Gathering market data' },
    { key: 'analysis', label: 'Analysis', icon: Clock, description: 'Processing information' },
    { key: 'charts', label: 'Charts', icon: BarChart3, description: 'Creating visualizations' },
    { key: 'generation', label: 'Generation', icon: FileText, description: 'Building report' },
    { key: 'export', label: 'Export', icon: Download, description: 'Finalizing document' },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === progress.step);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Generating Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="w-full" />
        </div>

        {/* Current Message */}
        {currentMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">{currentMessage}</p>
          </div>
        )}

        {/* Step Progress */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isCurrent 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.label}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
                {isCurrent && (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {progress.sourcesFound && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium">Sources Found</div>
              <div className="text-gray-600">{progress.sourcesFound}</div>
            </div>
          )}
          {progress.chartsGenerated && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium">Charts Generated</div>
              <div className="text-gray-600">{progress.chartsGenerated}</div>
            </div>
          )}
          {progress.estimatedTime && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium">Est. Time</div>
              <div className="text-gray-600">{Math.ceil(progress.estimatedTime / 60)}min</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
