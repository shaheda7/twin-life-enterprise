Demo Narration Script — Twin Life Enterprise (voiceover)
=====================================================

0:00–0:15 — Intro (title + elevator pitch)
- "Hello — this is Twin Life Enterprise, a Declarative Agent proof-of-concept that runs scenario simulations, compares architectures for cost and risk, and produces a traceable recommendation in one page. In the next three minutes I'll show the end-to-end flow."

0:15–0:45 — Repo tour
- "First, here's the repository: `agent.yaml` contains the Declarative Agent manifest; `microservice/index.js` is the simulation grounding service; `SUBMIT.md` and `SUBMISSION_CHECKLIST.md` contain the judge instructions and artifacts."

0:45–1:30 — Run microservice and compare
- "I'll start the microservice locally with a demo API key. Then I'll run a sample compare request which triggers two simulations and returns a recommendation and explanation. Watch the terminal response: you should see JSON with `comparison` containing `A`, `B`, `recommendation`, and `explanation`."
- (Optional on-screen text as you paste):
  - "SIM_API_KEY=devkey node microservice/index.js &"
  - "curl -sS -X POST http://localhost:5001/compare -H 'Authorization: Bearer devkey' -H 'Content-Type: application/json' -d '{"scenarioA": {"name":"A","workload":1000}, "scenarioB": {"name":"B","workload":1200}}' | jq"

1:30–2:15 — Generate and open summary
- "Next I run the summary generator which calls the compare endpoint, writes `SUMMARY.html` and `SUMMARY.pdf`, and creates an audit trace. I'll open the PDF so you can see the recommendation at the top and the KPI chart illustrating cost and risk."
- (Optional on-screen text):
  - "SIM_API_KEY=devkey node scripts/generate_summary.js"
  - "open SUMMARY.pdf"

2:15–2:45 — Show audit and release
- "Here's `audit.json` which contains the decision trace: inputs, computed KPIs, and the final recommendation — useful for reviewers and compliance. Finally, the submission zip is attached to the GitHub release for judges to download."

2:45–3:00 — Close
- "That's the demo. Reproduce steps and quick-run commands are in `SUBMIT.md`. Thank you for reviewing Twin Life Enterprise — we've included the summary PDF, audit trace, and runnable microservice for validation."

Recording tips (1–2 quick lines)
- Keep commands copy-pasteable; paste rather than type long JSON.
- Narrate what the viewer should look for in the JSON and PDF (recommendation and charts).
