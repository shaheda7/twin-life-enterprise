Submission Checklist — Twin Life Enterprise Declarative Agent PoC

Required artifacts
- README with architecture diagram and setup steps.
- Demo script and short demo recording (2–5 minutes).
- Evidence of IQ integration (screenshots or logs).
- Simulation microservice code and sample scenario inputs.
- Traceability artifacts (decision audit JSON or report).
- Deployment instructions or `atk` lifecycle commands used.
- Resource list (ARM/Bicep/Terraform snippets or `atk` steps).

Security & hygiene
- No secrets committed (check `.env`, `config` files).
- Key Vault or secret references documented for reviewers.

Validation tests
- Steps to reproduce demo locally (Quickstart section in README).
- Smoke test commands for microservice endpoints.

Optional (bonus)
- MCP App package or link to MCP server code.
- OAuth flow diagram and token validation steps.

Submission packaging
- ZIP containing: README, demo recording, screenshots, scenario JSONs, and a short one-page summary.
- Include a `SUBMIT.md` with instructions for judges to run the demo locally.

Checklist (for team)
- [ ] README written and linked
- [ ] Demo script finalized
- [ ] Demo recording captured
- [ ] IQ integration evidence captured
- [ ] Microservice runs locally
- [ ] No secrets in repo
- [ ] ZIP package created for submission

Release & submission
- Release published: https://github.com/shaheda7/twin-life-enterprise/releases/tag/v1.0
- Ensure the release asset `microservice/submission_summary.zip` is attached and downloadable.

Judging instructions (one-liner to include in SUBMIT.md)
- Step 1: Download and unzip `submission_summary.zip`.
- Step 2: Start microservice: `cd microservice && SIM_API_KEY=devkey node index.js &`.
- Step 3: Run the demo: use `scripts/generate_summary.js` or follow `DEMO_SCRIPT.md` in the repo.

Final checklist
- [ ] Release created and link shared with judges
- [ ] ZIP verified downloadable
- [ ] `SUBMIT.md` included with quick run steps