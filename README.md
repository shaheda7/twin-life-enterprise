# Twin Life Enterprise — Declarative Agent (PoC)

Short: a declarative Microsoft 365 Copilot Agent PoC that runs scenario simulations, compares architectures, and produces traceable recommendations.

## What this repo contains
- Declarative Agent manifest and sample grounding config (scaffolded via ATK).
- Minimal simulation microservice (example API to run scenarios).
- Demo script and submission checklist to validate hackathon criteria.

## Prerequisites
- VS Code
- Node.js (LTS) / npm
- Azure CLI (for optional provisioning)
- ATK (Microsoft 365 Agents Toolkit): `npm i -g @microsoft/m365agentstoolkit-cli@beta`
- Set `export ATK_CLI_SKILL=true` in your shell for ATK helper features.

## Quickstart — Scaffold the Declarative Agent
1. Open a terminal in this project root.
2. Create a new Declarative Agent (non-interactive):

```bash
atk new -i false -f ./twin-life-enterprise -t declarative
```

3. Open the generated agent manifest (look for `agent.yaml` or `manifest.yaml`) and update metadata (name, intents, grounding sources).

Example minimal intent snippet to add into the manifest:

```yaml
intents:
  - id: simulate-scenarios
    examples:
      - "Simulate this architecture"
      - "Run scenario comparison"
  - id: compare-architectures
    examples:
      - "Compare two architectures for cost and risk"
```

## Run the local development environment
- Install dependencies (if this repo has a `package.json`):

```bash
npm install
npm run dev
```

- Start the simulation microservice (see `microservice/README` or the `DEMO_SCRIPT.md` for a minimal Node example):

```bash
# from twin-life-enterprise/microservice
npm install
npm start
```

- Use Agents Playground or VS Code ATK debug run to test the Declarative Agent. Sideload into Copilot Chat in your tenant for full demo.

## Files to review
- [twin-life-enterprise/DEMO_SCRIPT.md](twin-life-enterprise/DEMO_SCRIPT.md)
- [twin-life-enterprise/SUBMISSION_CHECKLIST.md](twin-life-enterprise/SUBMISSION_CHECKLIST.md)
 - [SUBMIT.md](SUBMIT.md)

## Artifacts
- One-page PDF summary: [twin-life-enterprise/SUMMARY.pdf](twin-life-enterprise/SUMMARY.pdf)
- Submission ZIP package: [twin-life-enterprise/microservice/submission_summary.zip](twin-life-enterprise/microservice/submission_summary.zip)

If you want the README to display the PDF inline on GitHub, note GitHub does not render PDFs inline; linking is the most reliable option. For local viewing, the PDF will open in your OS viewer when clicked.

Quick upload suggestions for sharing the ZIP

- Upload to GitHub Releases (recommended for hackathon submissions):

```bash
# create a release and upload
gh release create v1.0 microservice/submission_summary.zip --title "Twin Life Enterprise PoC" --notes "Submission package"
```

- Upload to SharePoint / OneDrive: drag the ZIP into your project site or use `azcopy`/OneDrive sync.

## Next steps I can do for you
- Scaffold the `agent.yaml` Declarative manifest and sample triggers.
- Create a minimal Node.js simulation microservice with `/simulate` and `/results/{id}` endpoints.
- Wire a simple React dashboard or Power BI embed sample.

Pick one and I'll scaffold it now.