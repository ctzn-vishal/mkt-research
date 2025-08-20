import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { ReportGenerator } from '@/lib/report-generator';
import { reportConfigSchema, reportMetadataSchema } from '@/types/report';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = reportConfigSchema.parse(body);
    
    const generator = new ReportGenerator();
    
    // Create a readable stream for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const update of generator.streamReportGeneration(config)) {
            const chunk = encoder.encode(`data: ${JSON.stringify(update)}\n\n`);
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorChunk = encoder.encode(`data: ${JSON.stringify({
            error: 'Failed to generate report',
            details: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`);
          controller.enqueue(errorChunk);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }
}
