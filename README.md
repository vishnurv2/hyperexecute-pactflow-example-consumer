# Running pactflow-example-consumer on HyperExecute

[![Build](https://github.com/pactflow/example-consumer/actions/workflows/build.yml/badge.svg)](https://github.com/pactflow/example-consumer/actions/workflows/build.yml)

[![Pact Status](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest/badge.svg?label=provider)](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest) (latest pact)

[![Can I deploy Status](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)

This is an example of a Node consumer using Pact to create a consumer driven contract, and sharing it via [PactFlow](https://pactflow.io).

It is using a public tenant on PactFlow, which you can access [here](https://test.pactflow.io/) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest).

The project uses a Makefile to simulate a very simple build pipeline with two stages - test and deploy.

* Test
  * Run tests (including the pact tests that generate the contract)
  * Publish pacts, associating the consumer version with the name of the current branch
  * Check if we are safe to deploy to prod (ie. has the pact content been successfully verified)
* Deploy (only from master)
  * Deploy app (just pretend for the purposes of this example!)
  * Record the deployment in the Pact Broker

## Tech Stack

| Concern          | Tool       |
| ---------------- | ---------- |
| Build            | Vite       |
| Language         | TypeScript |
| Test runner      | Vitest     |
| Linter/formatter | Biome      |
| UI framework     | React      |

## Prerequisites

**Node.js ≥ 24** is required.

Other tools: see https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/

A [PactFlow](https://pactflow.io) account with a valid [API token](https://docs.pactflow.io/#configuring-your-api-token).

## Usage

See the [PactFlow CI/CD Workshop](https://github.com/pactflow/ci-cd-workshop).

## Running the application

Start up the [provider](https://github.com/pactflow/example-provider/) (or another [compatible](https://docs.pactflow.io/docs/examples) provider) API.

Open a separate terminal for the consumer.

Before starting the consumer, create a `.env` file in the root of the project (use `.env.example` as a template) and set the URL to point to your running provider:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Then run:

```bash
npm run dev
```

## Scripts

| Script               | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start the Vite dev server on port 3000 |
| `npm run build`      | Production build (output: `build/`)    |
| `npm run preview`    | Preview the production build           |
| `npm test`           | Run all tests with Vitest              |
| `npm run test:pact`  | Run pact tests only                    |
| `npm run type-check` | TypeScript type checking (no emit)     |
| `npm run lint`       | Biome lint                             |
| `npm run format`     | Biome format check                     |
| `npm run check`      | Biome lint + format check              |
| `npm run check:fix`  | Auto-fix all Biome issues              |

## Environment variables

| Variable               | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | Base URL of the provider API (default: `http://localhost:8080`) |
| `PACT_BROKER_TOKEN`    | Valid API token for PactFlow                                    |
| `PACT_BROKER_BASE_URL` | Fully qualified domain with protocol to your pact broker        |

## Running pactflow-example-consumer on HyperExecute

[HyperExecute](https://www.lambdatest.com/hyperexecute) is LambdaTest's cloud test-orchestration platform. The `hyperexecute.yaml` in this repo is pre-configured to run the Pact consumer contract tests in the cloud with parallel execution, test reports, and artifact upload.

### What the pipeline does

| Stage | Command | Details |
| ----- | ------- | ------- |
| Install | `npm ci` | Clean install with lockfile |
| Type check | `npm run type-check` | TypeScript validation |
| Lint | `npm run check` | Biome lint + format check |
| Build | `npm run build` | Vite production build |
| Test | `npx vitest run <file>` | Each spec file runs in an isolated worker |
| Reports | auto | JUnit XML + Allure results uploaded to dashboard |
| Artifacts | auto | `pacts/` and `reports/` saved as job artifacts |

### Prerequisites

1. A [LambdaTest](https://www.lambdatest.com/) account — grab your **Username** and **Access Key** from the [profile page](https://accounts.lambdatest.com/details/profile).
2. Download the HyperExecute CLI for your OS and place it in the project root:

   | OS | Download |
   | -- | -------- |
   | macOS | `curl -O https://downloads.lambdatest.com/hyperexecute/darwin/hyperexecute` |
   | Linux | `curl -O https://downloads.lambdatest.com/hyperexecute/linux/hyperexecute` |
   | Windows | `curl -O https://downloads.lambdatest.com/hyperexecute/windows/hyperexecute.exe` |

   Then make it executable (macOS/Linux):
   ```bash
   chmod +x hyperexecute
   ```

3. Export your LambdaTest credentials:
   ```bash
   export LT_USERNAME="your-lambdatest-username"
   export LT_ACCESS_KEY="your-lambdatest-access-key"
   ```

### Run

```bash
./hyperexecute --config hyperexecute.yaml
```

Or pass credentials inline without exporting:

```bash
./hyperexecute --user <LT_USERNAME> --key <LT_ACCESS_KEY> --config hyperexecute.yaml
```

### Reports

After the job completes, two report types are available in the HyperExecute dashboard under the job detail page:

- **JUnit XML** — pass/fail summary per test, parsed natively by the dashboard
- **Allure** — rich HTML report with per-test logs, timeline, and response details

Both are also downloadable as job artifacts alongside the generated `pacts/` contract files.

### PactFlow credentials

The `hyperexecute.yaml` is pre-configured with the public demo PactFlow tenant for convenience. To use your own tenant, update these two values in `hyperexecute.yaml`:

```yaml
env:
  PACT_BROKER_BASE_URL: https://your-org.pactflow.io
  PACT_BROKER_TOKEN: your-read-write-api-token
```

> **Publishing pacts after the run** — download the `pacts/` artifact and run `make publish_pacts` locally, or add a `post` step with the Pact broker CLI once Docker is available in your HyperExecute plan.

## Pact use cases

* `make test` — run the pact test locally
* `make fake_ci` — run the CI process locally
