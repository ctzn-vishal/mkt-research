import puppeteer from 'puppeteer';
import { ReportData, ReportConfig } from '@/types/report';

export class ReportExporter {
  async exportToPDF(reportData: ReportData, config: ReportConfig): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      const html = this.generateHTML(reportData, config);
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.75in',
          bottom: '1in',
          left: '0.75in'
        },
      });

      return pdf;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
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
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
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
        .section {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
        }
        .executive-summary { background: #f8f9fa; border-left: 4px solid #3498db; }
        .key-findings { background: #fff; border: 1px solid #ddd; }
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
        .recommendations {
            background: #e8f5e8;
            border-left: 4px solid #27ae60;
        }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <header>
        <h1>${config.title}</h1>
        <p><strong>Analysis Type:</strong> ${config.analysisType.replace('-', ' ').toUpperCase()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </header>

    <div class="section executive-summary">
        <h2>Executive Summary</h2>
        <p>${reportData.executiveSummary}</p>
    </div>

    <div class="section key-findings">
        <h2>Key Findings</h2>
        <ul>
            ${reportData.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </div>

    ${reportData.marketSize ? `
    <div class="section">
        <h2>Market Overview</h2>
        <div style="display: flex; gap: 20px; margin: 20px 0;">
            ${reportData.marketSize.current ? `
            <div style="flex: 1; background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Current Market Size</h3>
                <p style="font-size: 20px; font-weight: bold; color: #1976d2;">
                    ${reportData.marketSize.current}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.projected ? `
            <div style="flex: 1; background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Projected Size</h3>
                <p style="font-size: 20px; font-weight: bold; color: #7b1fa2;">
                    ${reportData.marketSize.projected}
                </p>
            </div>
            ` : ''}
            ${reportData.marketSize.growthRate ? `
            <div style="flex: 1; background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                <h3>Growth Rate</h3>
                <p style="font-size: 20px; font-weight: bold; color: #388e3c;">
                    ${reportData.marketSize.growthRate}
                </p>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${reportData.charts.length > 0 ? `
    <div class="section">
        <h2>Data Visualizations</h2>
        ${reportData.charts.map((chart, index) => `
        <div class="chart-container">
            <h3>${chart.title}</h3>
            <div class="chart-wrapper">
                <canvas id="chart${index + 1}" width="800" height="400"></canvas>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section recommendations">
        <h2>Strategic Recommendations</h2>
        <ul>
            ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <script>
        ${reportData.charts.map((chart, index) => `
        try {
            new Chart(document.getElementById('chart${index + 1}'), {
                type: '${chart.type}',
                data: {
                    labels: ${JSON.stringify(chart.labels)},
                    datasets: [{
                        label: '${chart.title}',
                        data: ${JSON.stringify(chart.data)},
                        backgroundColor: ${JSON.stringify(chart.backgroundColor || ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'])},
                        borderColor: '${chart.borderColor || '#2c3e50'}',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '${chart.title}'
                        }
                    }
                }
            });
        } catch(e) {
            console.error('Chart ${index + 1} error:', e);
        }
        `).join('')}
    </script>
</body>
</html>`;
  }
}
