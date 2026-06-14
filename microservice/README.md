# Simulation microservice

Minimal Node.js microservice that accepts scenario JSON and returns mocked KPIs.

Endpoints
- `GET /health` — health check
- `POST /simulate` — accepts scenario JSON, returns `{ id, results }`
- `GET /results/{id}` — retrieve stored result
 - `POST /compare` — accepts `{ scenarios: [scenarioA, scenarioB] }` or `{ scenarioA, scenarioB }` and returns a merged comparison with a recommendation

Security and HTTPS

- To require a bearer API key for all non-health endpoints, set the `SIM_API_KEY` environment variable. The service will validate `Authorization: Bearer <SIM_API_KEY>`.
- To enable HTTPS, set `HTTPS=true` and provide `TLS_CERT_PATH` and `TLS_KEY_PATH` env vars (defaults shown below).

Example (self-signed cert for local dev):

```bash
# generate a self-signed cert (OpenSSL required)
mkdir -p twin-life-enterprise/microservice/certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout twin-life-enterprise/microservice/certs/key.pem \
  -out twin-life-enterprise/microservice/certs/cert.pem -days 365 -subj "/CN=localhost"

# run the service with HTTPS and an API key
SIM_API_KEY=devkey HTTPS=true TLS_CERT_PATH=./microservice/certs/cert.pem TLS_KEY_PATH=./microservice/certs/key.pem node index.js
```

Note: For production, use valid TLS certificates and a secure key store (Azure Key Vault, etc.).

Run locally

```bash
cd twin-life-enterprise/microservice
npm install
npm start
```

Example scenario JSON

```json
{
  "name": "cloud-example",
  "infra": "cloud",
  "costEstimate": 120000,
  "complexity": 1.2,
  "workload": 3,
  "complianceGaps": []
}
```
