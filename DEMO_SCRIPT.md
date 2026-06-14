Demo Script — Twin Life Enterprise (Declarative Agent PoC)

Goal
- Show side-by-side comparison of two architecture scenarios (cloud-only vs hybrid).
- Surface KPIs (cost, risk, time-to-market), explain drivers, and produce a traceability artifact.

Prerequisites
- Microservice running: `http://localhost:5001` (or HTTPS + `SIM_API_KEY`).
- Agent sideloaded or open in Agents Playground referencing `agent.yaml`.
- Sample scenarios present: `microservice/scenarios/cloud.json` and `microservice/scenarios/hybrid.json`.

Quickstart commands (start services)

```bash
# from project root
cd twin-life-enterprise/microservice
SIM_API_KEY=devkey node index.js &

# verify
curl -sS -H "Authorization: Bearer devkey" -X POST http://localhost:5001/compare \
   -H "Content-Type: application/json" \
   -d '{"scenarios":[{"name":"cloud","infra":"cloud","costEstimate":120000,"complexity":1.1,"workload":3},{"name":"hybrid","infra":"hybrid","costEstimate":100000,"complexity":1.4,"workload":4}]}' | jq .
```

Step-by-step demo (with exact prompts and HTTP calls)

1) Load scenarios into the agent (optional: upload files to a grounding store).

- User prompt to paste into Copilot Chat / Agents Playground:

   "Load scenario A from microservice/scenarios/cloud.json and scenario B from microservice/scenarios/hybrid.json. Prepare them for simulation and list the key assumptions (cost horizon, time-to-market horizon, compliance baseline)."

- Expected agent response (example):

   "Loaded scenario A (cloud-example) and scenario B (hybrid-example). Assumptions: 5-year cost horizon, migration window: 6 months, compliance baseline: GDPR. Ready to simulate."

2) Run the comparison (agent calls the microservice `/compare` adapter).

- User prompt to agent:

   "Simulate both scenarios and compare cost (5-year), risk score, time-to-market, and compliance gaps. Provide a ranked recommendation and a one-paragraph rationale."

- Under the hood (what the agent will call):

   ```bash
   curl -sS -X POST http://localhost:5001/compare \
      -H "Authorization: Bearer devkey" \
      -H "Content-Type: application/json" \
      -d @microservice/scenarios/cloud.json
   # then call /simulate for hybrid, or call /compare with both scenarios
   ```

- Expected JSON response (agent will convert to a human-friendly summary):

   {
      "comparison": {
         "A": { "id": "<idA>", "results": { "cost": 131000, "timeToMarketMonths": 3, "riskScore": 11 } },
         "B": { "id": "<idB>", "results": { "cost": 139000, "timeToMarketMonths": 6, "riskScore": 19 } },
         "recommendation": "Recommend scenario A (<idA>) — lower cost and risk.",
         "explanation": { "deltaCost": -8000, "deltaRisk": -8 }
      }
   }

3) Ask for explanations and citations.

- User prompt:

   "Explain the main drivers for the cost delta and list the top 3 risks for each scenario. Cite any grounding documents or assumptions."

- Expected agent output (example bullets):

   - "Cost driver: hybrid requires on-prem licensing and data replication (adds ~25% infra multiplier)."
   - "Top risks (cloud): data egress cost fluctuation, vendor lock-in, integration complexity."
   - "Top risks (hybrid): data residency penalties, ops complexity, longer migration window."
   - "Citations: [SharePoint: Migration-Plan.docx], [Foundry: Org-Standards-index]."

4) Request traceability/audit artifact.

- User prompt:

   "Show the decision trace for the recommended scenario and export an audit JSON that includes input assumptions, scenario versions, and the result snapshot." 

- Expected agent action + output:

   - Agent returns a downloadable JSON (or link) containing: scenarioA, scenarioB, the two result objects, the recommendation text, timestamp, and author.

   Example audit payload (what the agent should produce):

   ```json
   {
      "audit": {
         "scenarios": {"A": {...}, "B": {...}},
         "results": {"A": {...}, "B": {...}},
         "recommendation": "...",
         "assumptions": {...},
         "timestamp": "2026-06-14T..."
      }
   }
   ```

5) Visualize and capture the dashboard.

- Action: open the React dashboard (if implemented) or export KPIs as a CSV/JSON and open in Power BI.
- User prompt to agent (optional):

   "Export the KPI table as CSV and prepare a one-slide summary with the recommendation." 

Wrap-up and artifact packaging

- User prompt:

   "Package a ZIP containing: README, audit JSON, scenario JSONs, screenshots, and a one-page recommendation summary. Provide download link."

- Expected agent output:

   - Agent confirms ZIP created and provides the file or instructions to retrieve it (MCP storage, SharePoint link, or local path).

Recording tips

- Start screen recording before running the simulations.
- Narration script (short): "We're comparing cloud and hybrid — here are the costs, risks, and recommendation. The agent cites sources and provides an auditable decision pack."

Test checklist for the demo (quick run)

- [ ] Microservice running at `http://localhost:5001` with `SIM_API_KEY` set.
- [ ] `agent.yaml` connector `baseUrl` points to the service and uses bearer auth token.
- [ ] Scenarios available under `microservice/scenarios/`.
- [ ] Agent sideloaded into Agents Playground or Copilot Chat.
- [ ] Run the above prompts and verify the agent returns the comparison, explanation, and audit JSON.

Files to check

- `twin-life-enterprise/agent.yaml` — connector & actions
- `twin-life-enterprise/microservice/index.js` — endpoints: `/simulate`, `/results/{id}`, `/compare`
- `twin-life-enterprise/AGENT_FLOW.md` — low-level curl sequences used by the agent

If you want, I can now: generate the one-page recommendation summary automatically, or record a sample demo based on these steps.