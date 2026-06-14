# Agent HTTP Flow — example curl calls

These are the exact HTTP calls the Declarative Agent runtime or a developer script will make to the simulation microservice (default: http://localhost:5001).

Set base URL

```bash
BASE_URL=http://localhost:5001
```

1) Run a single scenario (POST /simulate)

```bash
curl -sS -X POST "$BASE_URL/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cloud-example",
    "infra": "cloud",
    "costEstimate": 120000,
    "complexity": 1.1,
    "workload": 3,
    "complianceGaps": []
  }'

```

Example response (single simulate):

```json
{ "id": "<uuid>", "results": { "cost": 132000, "timeToMarketMonths": 3, "riskScore": 11, "complianceGaps": [] } }
```

2) Retrieve a stored result (GET /results/{id})

```bash
curl -sS "$BASE_URL/results/<id>" | jq .
```

3) Compare two scenarios (agent should call /simulate twice)

Example sequence (shell):

```bash
# simulate A
RESP_A=$(curl -sS -X POST "$BASE_URL/simulate" -H "Content-Type: application/json" -d @microservice/scenarios/cloud.json)
ID_A=$(echo "$RESP_A" | jq -r .id)

# simulate B
RESP_B=$(curl -sS -X POST "$BASE_URL/simulate" -H "Content-Type: application/json" -d @microservice/scenarios/hybrid.json)
ID_B=$(echo "$RESP_B" | jq -r .id)

# fetch both results
RES_A=$(curl -sS "$BASE_URL/results/$ID_A")
RES_B=$(curl -sS "$BASE_URL/results/$ID_B")

# quick merge and comparison using jq
echo '{"A":'"$RES_A"',"B":'"$RES_B"'}' | jq .
```

4) Example composite payload the agent can return

```json
{
  "comparison": {
    "A": { "id": "<idA>", "results": { "cost": 132000, "timeToMarketMonths": 3, "riskScore": 11 } },
    "B": { "id": "<idB>", "results": { "cost": 140000, "timeToMarketMonths": 4, "riskScore": 18 } },
    "recommendation": "Scenario A (cloud) has lower cost and risk; recommended for faster TTM."
  }
}
```

Notes
- Ensure `agent.yaml` connector `baseUrl` matches `BASE_URL`.
- For production, secure the connector with authentication and switch to an HTTPS endpoint.
