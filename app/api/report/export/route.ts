import { NextRequest } from 'next/server';
import { ReportExporter } from '@/lib/report-exporter';
import { reportDataSchema, reportConfigSchema } from '@/types/report';

export async function POST(req: NextRequest) {
  try {
    const { reportData, config, format = 'pdf' } = await req.json();
    
    const validatedData = reportDataSchema.parse(reportData);
    const validatedConfig = reportConfigSchema.parse(config);
    
    const exporter = new ReportExporter();
    
    if (format === 'pdf') {
      const pdfBuffer = await exporter.exportToPDF(validatedData, validatedConfig);
      
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${validatedConfig.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
        },
      });
    }
    
    if (format === 'html') {
      const html = exporter.generateHTML(validatedData, validatedConfig);
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${validatedConfig.title.replace(/[^a-zA-Z0-9]/g, '-')}.html"`,
        },
      });
    }
    
    return Response.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json(
      { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
