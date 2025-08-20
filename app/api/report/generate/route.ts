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
        error: error instanceof Error ? error.message : 'Failed to generate report',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
