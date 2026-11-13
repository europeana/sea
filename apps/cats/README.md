# Content(ful) Automated Task Service (CATS)

CATS is a service for performing various automated tasks on Contentful content entries.

## Features

- [Natural language translation](./docs/translate.md)
- [Zoho CRM contact sync](./docs/zoho-contacts.md)

## Architecture

CATS is a micro-service implemented as a [Nitro](https://nitro.build) app. The app is built as a Docker image and deployed to Kubernetes.

The micro-service has various HTTP endpoints which may be used as webhook targets, or requested by other means:

- `GET /` — Health check endpoint returning `OK`.
- `POST /translate/ctf` — Receives Contentful entry publish webhooks to queue translation requests.
- `POST /translate/etr` — Receives translated HTML payloads from eTranslation.
- `POST /zoho/contacts` — Receives single contact update webhooks from Zoho CRM.
- `POST /zoho/bulk` — Initiates an asynchronous Zoho CRM Bulk Read export.
- `POST /zoho/bulk/callback` — Receives completion callbacks from Zoho CRM Bulk Read jobs.

[BullMQ](https://bullmq.io) is used to manage the flow of data through CATS in a message queue stored in Redis, so that HTTP requests respond promptly and work with third-party APIs takes place in the background.

A Nitro plugin is used to start a BullMQ worker process, meaning that each pod will run both the Nitro web server and a BullMQ worker. Scaling the number of pods results in an increase in capacity of both request handling and job processing.

## Getting Started

### Prerequisites

- Node.js (compatible with Nitro v2 and TypeScript 5)
- [pnpm](https://pnpm.io)
- A running Redis instance
- Access credentials for Contentful Management API, eTranslation, and Zoho CRM

### Configuration

Copy `.env.example` to `.env` and populate the required runtime environment variables:

| Variable                                    | Required | Description                                                                                     |
| ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `NITRO_REDIS_URL`                           | Yes      | Connection URL for the Redis instance backing BullMQ.                                           |
| `NITRO_REDIS_TLS_CA`                        | No       | Base64-encoded TLS CA certificate for Redis, if using TLS.                                      |
| `NITRO_CONTENTFUL_SPACE`                    | Yes      | Target Contentful space ID.                                                                     |
| `NITRO_CONTENTFUL_ENVIRONMENT`              | Yes      | Target Contentful environment (e.g., `master`).                                                 |
| `NITRO_CONTENTFUL_ACCESS_TOKEN`             | Yes      | Contentful Management API personal access token.                                                |
| `NITRO_E_TRANSLATION_USERNAME`              | Yes      | Username for EU eTranslation API Basic Auth.                                                    |
| `NITRO_E_TRANSLATION_PASSWORD`              | Yes      | Password for EU eTranslation API Basic Auth.                                                    |
| `NITRO_E_TRANSLATION_DELIVERIES`            | Yes      | Public callback URL for `POST /translate/etr` where eTranslation delivers translated documents. |
| `NITRO_E_TRANSLATION_NOTIFICATIONS_FAILURE` | No       | Optional HTTP callback URL for eTranslation failure notifications.                              |
| `NITRO_E_TRANSLATION_NOTIFICATIONS_SUCCESS` | No       | Optional HTTP callback URL for eTranslation success notifications.                              |
| `NITRO_E_TRANSLATION_URL`                   | No       | Override URL for the eTranslation `askTranslate` endpoint.                                      |
| `NITRO_ZOHO_CLIENT_ID`                      | Yes      | Zoho OAuth client ID.                                                                           |
| `NITRO_ZOHO_CLIENT_SECRET`                  | Yes      | Zoho OAuth client secret.                                                                       |
| `NITRO_ZOHO_SERVICE_ORG_ID`                 | Yes      | Zoho CRM service organisation ID.                                                               |
| `NITRO_ZOHO_BULK_READ_CALLBACK_URL`         | No       | Public callback URL for `POST /zoho/bulk/callback` invoked when a bulk read completes.          |

### Scripts

Run scripts from `apps/cats` (or from the repository root using `pnpm --filter @europeana/cats <script>`):

- **Start development server:** `pnpm dev` (starts Nitro in watch mode along with BullMQ workers).
- **Build for production:** `pnpm build` (outputs to `.output/`).
- **Preview production build:** `pnpm preview` (runs `node .output/server/index.mjs`).

## Tests

Tests use vitest, and are in a separate directory, [tests](./tests/), as otherwise Nitro tries to auto-register them as routes/plugins/etc.

## License

Licensed under the EUPL v1.2.
