const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || process.env.SIM_BASE_URL || 'http://localhost:5001';
const API_KEY = process.env.SIM_API_KEY || '';
// resolve scenario paths relative to repo root (script lives in scripts/)
const repoRoot = path.resolve(__dirname, '..');
const SCENARIO_A = process.env.SCENARIO_A || path.join(repoRoot, 'microservice', 'scenarios', 'cloud.json');
const SCENARIO_B = process.env.SCENARIO_B || path.join(repoRoot, 'microservice', 'scenarios', 'hybrid.json');

function runCompare() {
  const authHeader = API_KEY ? `-H "Authorization: Bearer ${API_KEY}"` : '';
  const cmd = `curl -sS -X POST ${BASE_URL}/compare -H "Content-Type: application/json" ${authHeader} -d '{"scenarios":['$(cat ${SCENARIO_A})', '$(cat ${SCENARIO_B})']}'`;
  // Compose command manually because of nested quotes — build JSON first
  const scenarioA = fs.readFileSync(path.resolve(SCENARIO_A), 'utf8');
  const scenarioB = fs.readFileSync(path.resolve(SCENARIO_B), 'utf8');
  const payload = JSON.stringify({ scenarios: [JSON.parse(scenarioA), JSON.parse(scenarioB)] });
  const curlCmd = `curl -sS -X POST ${BASE_URL}/compare -H "Content-Type: application/json" ${API_KEY ? `-H \"Authorization: Bearer ${API_KEY}\"` : ''} -d '${payload.replace(/'/g, "'\\''")}'`;
  try {
    const out = execSync(curlCmd, { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    console.error('Error calling /compare:', e.message);
    console.error('Command output:', e.stdout ? e.stdout.toString() : '');
    process.exit(1);
  }
}

function writeSummary(result) {
  const outDir = path.resolve('.');
  const summaryPath = path.join(outDir, 'SUMMARY.md');
  const auditPath = path.join(outDir, 'audit.json');
  const htmlPath = path.join(outDir, 'SUMMARY.html');
  const pdfPath = path.join(outDir, 'SUMMARY.pdf');

  const A = result.comparison.A;
  const B = result.comparison.B;
  const rec = result.comparison.recommendation || '';
  const expl = result.comparison.explanation || {};

  const md = [];
  md.push('# One-Page Recommendation');
  md.push('');
  md.push(`**Recommendation:** ${rec}`);
  md.push('');
  md.push('## KPIs');
  md.push('');
  md.push('| Scenario | Cost | Time-to-market (months) | Risk score |');
  md.push('|---|---:|---:|---:|');
  md.push(`| A (${A.id}) | ${A.results.cost} | ${A.results.timeToMarketMonths} | ${A.results.riskScore} |`);
  md.push(`| B (${B.id}) | ${B.results.cost} | ${B.results.timeToMarketMonths} | ${B.results.riskScore} |`);
  md.push('');
  md.push('## Explanation');
  md.push('');
  md.push(`- Delta cost: ${expl.deltaCost}`);
  md.push(`- Delta risk: ${expl.deltaRisk}`);
  md.push('');
  md.push('## Audit');
  md.push('The full comparison audit is saved as `audit.json` in this folder.');

  fs.writeFileSync(summaryPath, md.join('\n'));
  fs.writeFileSync(auditPath, JSON.stringify(result, null, 2));

  // write an HTML one-page summary with embedded Chart.js chart
  const chartData = {
    labels: ['A', 'B'],
    costs: [A.results.cost, B.results.cost],
    risks: [A.results.riskScore, B.results.riskScore]
  };

  // small placeholder PNG (1x1) base64 — replace by setting LOGO_BASE64 env var
  const logoBase64 = process.env.LOGO_BASE64 || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>One-Page Recommendation</title>
  <style>
    body{font-family: Arial, Helvetica, sans-serif; margin:24px}
    .header{display:flex;justify-content:space-between;align-items:center}
    .kpi-table{margin-top:16px;border-collapse:collapse;width:100%}
    .kpi-table td, .kpi-table th{border:1px solid #ddd;padding:8px}
    .chart{max-width:700px}
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="data:image/png;base64,${logoBase64}" alt="Logo" style="height:48px" />
      <h1 style="margin:0">One-Page Recommendation</h1>
    </div>
    <div><strong>Recommendation:</strong><br/>${rec}</div>
  </div>

  <h2>KPIs</h2>
  <table class="kpi-table">
    <tr><th>Scenario</th><th>Cost</th><th>Time-to-market (months)</th><th>Risk score</th></tr>
    <tr><td>A (${A.id})</td><td>${A.results.cost}</td><td>${A.results.timeToMarketMonths}</td><td>${A.results.riskScore}</td></tr>
    <tr><td>B (${B.id})</td><td>${B.results.cost}</td><td>${B.results.timeToMarketMonths}</td><td>${B.results.riskScore}</td></tr>
  </table>

  <h2>Chart</h2>
  <canvas id="kpiChart" class="chart" width="700" height="320"></canvas>

  <h2>Explanation</h2>
  <ul>
    <li>Delta cost: ${expl.deltaCost}</li>
    <li>Delta risk: ${expl.deltaRisk}</li>
  </ul>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const labels = ${JSON.stringify(chartData.labels)};
    const data = {
      labels: labels,
      datasets: [
        { label: 'Cost', backgroundColor: '#4e79a7', data: ${JSON.stringify(chartData.costs)} , yAxisID: 'y'},
        { label: 'Risk', backgroundColor: '#f28e2b', data: ${JSON.stringify(chartData.risks)}, yAxisID: 'y1' }
      ]
    };

    const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { type: 'linear', position: 'left', title: { display: true, text: 'Cost' } },
          y1: { type: 'linear', position: 'right', title: { display: true, text: 'Risk' }, grid: { drawOnChartArea: false } }
        }
      }
    };

    new Chart(document.getElementById('kpiChart'), config);
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html);

  // Attempt to create PDF using puppeteer if available
  let createdPdf = false;
  try {
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
      await browser.close();
      console.log('PDF created at', pdfPath);
      createdPdf = true;
    })();
  } catch (e) {
    // puppeteer not installed or failed — fall back to manual instructions
    console.warn('Puppeteer not available or PDF generation failed. To enable automatic PDF export, install puppeteer and rerun: `npm install puppeteer`');
  }

  return { summaryPath, auditPath, htmlPath, pdfPath: createdPdf ? pdfPath : null };

  return { summaryPath, auditPath };
}

function zipArtifacts(files, outName = 'submission_summary.zip') {
  // use system zip
  const args = files.map((f) => `"${f}"`).join(' ');
  const cmd = `zip -j ${outName} ${args}`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    return path.resolve(outName);
  } catch (e) {
    console.error('Error creating zip:', e.message);
    return null;
  }
}

function main() {
  console.log('Calling compare at', BASE_URL);
  const result = runCompare();
  const { summaryPath, auditPath } = writeSummary(result);
  // include scenario files
  const zipPath = zipArtifacts([summaryPath, auditPath, SCENARIO_A, SCENARIO_B]);
  console.log('Summary written to', summaryPath);
  console.log('Audit written to', auditPath);
  if (zipPath) console.log('ZIP created at', zipPath);
}

main();
