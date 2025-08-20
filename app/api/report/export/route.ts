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
