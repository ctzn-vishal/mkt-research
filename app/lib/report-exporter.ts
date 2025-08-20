import puppeteer from 'puppeteer';
import { ReportData, ReportConfig, ChartConfig } from '@/types/report';

export class ReportExporter {
  async exportToPDF(
    reportData: ReportData, 
    config: ReportConfig,
    htmlContent?: string
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport and content
      await page.setViewport({ width: 1200, height: 800 });
      
      const html = htmlContent || this.generateHTML(reportData, config);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF with professional formatting
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.75in',
          bottom: '1in',
          left: '0.75in'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
            ${config.title}
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
            <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  generateHTML(reportData: ReportData, config: ReportConfig): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .executive-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
        }
        .key-findings {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            background: #fafafa;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
            width: 100%;
        }
        ul.recommendations {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
        }
        .risk-factors {
            background: #fdf2e9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e67e22;
        }
        .sources {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <header>
        <h1>${config.title}</h1>
        ${config.subtitle ? `<h2>${config.subtitle}</h2>` : ''}
        <p><strong>Analysis Type:</strong> ${config.analysisType.replace('-', ' ').toUpperCase()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </header>

    <section class="executive-summary">
        <h2>Executive Summary</h2>
        <p>${reportData.executiveSummary}</p>
    </section>

    <section class="key-findings">
        <h2>Key Findings</h2>
        <ul>
            ${reportData.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </section>

    ${reportData.marketSize ? `
    <section>
        <h2>Market Overview</h2>
        <div style="display: flex; gap: 20px; margin: 20px 0;">
            ${reportData.marketSize.current ? `
            <div style="flex: 1; background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Current Market Size</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1976d2;">
                    ${reportData.marketSize.current}${reportData.marketSize.unit || ''}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.projected ? `
            <div style="flex: 1; background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Projected Size</h3>
                <p style="font-size: 24px; font-weight: bold; color: #7b1fa2;">
                    ${reportData.marketSize.projected}${reportData.marketSize.unit || ''}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.growthRate ? `
            <div style="flex: 1; background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Growth Rate</h3>
                <p style="font-size: 24px; font-weight: bold; color: #388e3c;">
                    ${reportData.marketSize.growthRate}%
                </p>
            </div>
            ` : ''}
        </div>
    </section>
    ` : ''}

    ${reportData.charts.length > 0 ? `
    <section>
        <h2>Data Visualizations</h2>
        ${reportData.charts.map((chart, index) => `
        <div class="chart-container">
            <h3>${chart.title}</h3>
            <div class="chart-wrapper">
                <canvas id="chart${index + 1}"></canvas>
            </div>
        </div>
        `).join('')}
    </section>
    ` : ''}

    <section class="recommendations">
        <h2>Strategic Recommendations</h2>
        <ul>
            ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </section>

    ${reportData.riskFactors && reportData.riskFactors.length > 0 ? `
    <section class="risk-factors">
        <h2>Risk Factors</h2>
        <ul>
            ${reportData.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
        </ul>
    </section>
    ` : ''}

    ${reportData.methodology ? `
    <section>
        <h2>Methodology</h2>
        <p>${reportData.methodology}</p>
    </section>
    ` : ''}

    <script>
        // Chart rendering
        ${reportData.charts.map((chart, index) => `
        new Chart(document.getElementById('chart${index + 1}'), ${JSON.stringify(chart)});
        `).join('')}
    </script>
</body>
</html>`;
  }
}
