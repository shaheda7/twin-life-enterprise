Demo Recording Script — Twin Life Enterprise (2–5 minutes)
=========================================================

Goal
- Record a concise 2–5 minute demo that shows the Declarative Agent invoking the simulation microservice, performing a comparison, and producing the one-page summary and audit.

Setup (before recording)
- Ensure repository is cloned and dependencies installed.
- Start the microservice from the project root:

```bash
cd twin-life-enterprise/microservice
SIM_API_KEY=devkey node index.js &
```

- Verify health and smoke tests:

```bash
cd ..
bash scripts/smoke_test.sh
```

Recording timeline (suggested)
- 0:00–0:15 — Title slide + quick one-line elevator pitch (what judges will see).
- 0:15–0:45 — Show the repo layout in VS Code (open `agent.yaml`, `microservice/index.js`, `SUBMIT.md`).
- 0:45–1:30 — Start microservice (terminal) and run a live `/compare` request (curl) showing the JSON response.
  - Command (run in terminal):

```bash
curl -sS -X POST http://localhost:5001/compare \
  -H "Authorization: Bearer devkey" \
  -H "Content-Type: application/json" \
  -d '{"scenarioA": {"name":"A","workload":1000}, "scenarioB": {"name":"B","workload":1200}}' | jq
```

- 1:30–2:15 — Run `scripts/generate_summary.js` to produce `SUMMARY.html` and `SUMMARY.pdf`, and open `SUMMARY.pdf` to show charts and recommendation.

```bash
SIM_API_KEY=devkey node scripts/generate_summary.js
open SUMMARY.pdf   # macOS; or use your PDF viewer
```

- 2:15–2:45 — Show `audit.json` contents (decision trace) and point to `microservice/submission_summary.zip` in the release.

- 2:45–3:00 — Close with notes: how to reproduce (refer judges to `SUBMIT.md`), where to find artifacts, and contact or repo link.

Recording checklist (quick)
- [ ] Microservice running on port 5001 with `SIM_API_KEY=devkey`.
- [ ] `scripts/smoke_test.sh` passes locally.
- [ ] `curl /compare` response visible (recommendation + explanation present).
- [ ] `SUMMARY.pdf` generated and opened on screen (charts visible).
- [ ] `audit.json` displayed to show traceability.
- [ ] Release page and `submission_summary.zip` visible/downloadable.
- [ ] Narration: 1–2 short sentences per step explaining what viewers see.

Recording tips
- Use a single-terminal view and a browser/VS Code window for clarity.
- Keep each command copy-pastable; avoid long typing — paste and explain.
- If recording system audio, narrate actions and expected outcomes concisely.
- If time permits, capture a 30–60s clip of the agent executing end-to-end from a prompt (optional).

Delivery
- Attach the recording to the release or include a short link in the submission materials.

Notes
- Do not commit or share real secrets. Use `SIM_API_KEY=devkey` for demo only.
