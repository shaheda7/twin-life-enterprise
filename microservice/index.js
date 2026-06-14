const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || process.env.SIM_PORT || 5001;

// Security: optional API key (Bearer) and optional HTTPS
const SIM_API_KEY = process.env.SIM_API_KEY || '';
const USE_HTTPS = (process.env.HTTPS === 'true');
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || './microservice/certs/cert.pem';
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || './microservice/certs/key.pem';

// Simple auth middleware: if SIM_API_KEY is set, require Authorization: Bearer <key>
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (!SIM_API_KEY) return next();
  const auth = req.header('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return res.status(401).json({ error: 'missing bearer token' });
  const token = auth.slice(7).trim();
  if (token !== SIM_API_KEY) return res.status(403).json({ error: 'invalid token' });
  next();
});

const store = {};

function computeKPIs(scenario) {
  const baseCost = scenario.costEstimate || 100000;
  const complexity = scenario.complexity || 1;
  const infraMultiplier = scenario.infra === 'hybrid' ? 1.25 : 1.0;
  const ttm = Math.max(1, Math.round((scenario.workload || 3) * complexity));
  const cost = Math.round(baseCost * infraMultiplier + (complexity * 10000));
  const risk = Math.round((complexity * 10 + (infraMultiplier - 1) * 20));
  const complianceGaps = scenario.complianceGaps || [];
  return { cost, timeToMarketMonths: ttm, riskScore: risk, complianceGaps };
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/simulate', (req, res) => {
  const scenario = req.body || {};
  const id = uuidv4();
  const results = computeKPIs(scenario);
  store[id] = { id, scenario, results, createdAt: new Date().toISOString() };
  res.json({ id, results });
});

app.get('/results/:id', (req, res) => {
  const id = req.params.id;
  if (!store[id]) return res.status(404).json({ error: 'not found' });
  res.json(store[id]);
});

// Adapter endpoint: compare two scenarios and return merged comparison
app.post('/compare', (req, res) => {
  const body = req.body || {};
  const scenarios = body.scenarios || [];
  // support alternate shape
  if (!Array.isArray(scenarios) || scenarios.length < 2) {
    // try fallback to scenarioA/scenarioB
    if (body.scenarioA && body.scenarioB) {
      scenarios.push(body.scenarioA, body.scenarioB);
    } else {
      return res.status(400).json({ error: 'provide `scenarios` array with at least two entries or `scenarioA` and `scenarioB`' });
    }
  }

  const ids = [];
  const resultsArr = scenarios.slice(0, 2).map((s) => {
    const id = uuidv4();
    const results = computeKPIs(s);
    store[id] = { id, scenario: s, results, createdAt: new Date().toISOString() };
    ids.push(id);
    return { id, results, scenario: s };
  });

  const A = resultsArr[0];
  const B = resultsArr[1];

  // Simple recommendation logic: prefer lower cost and lower risk; otherwise score by weighted sum
  const preferA = (A.results.cost <= B.results.cost && A.results.riskScore <= B.results.riskScore);
  const preferB = (B.results.cost < A.results.cost && B.results.riskScore < A.results.riskScore);

  let recommendation = '';
  if (preferA) recommendation = `Recommend scenario A (${A.id}) — lower cost and risk.`;
  else if (preferB) recommendation = `Recommend scenario B (${B.id}) — lower cost and risk.`;
  else {
    const scoreA = A.results.cost + A.results.riskScore * 10000;
    const scoreB = B.results.cost + B.results.riskScore * 10000;
    recommendation = scoreA <= scoreB ? `Recommend scenario A (${A.id}) by combined score.` : `Recommend scenario B (${B.id}) by combined score.`;
  }

  const explanation = {
    costA: A.results.cost,
    costB: B.results.cost,
    riskA: A.results.riskScore,
    riskB: B.results.riskScore,
    deltaCost: A.results.cost - B.results.cost,
    deltaRisk: A.results.riskScore - B.results.riskScore,
  };

  res.json({ comparison: { A, B, recommendation, explanation } });
});

app.listen(port, () => console.log(`Simulation microservice listening on ${port}`));
