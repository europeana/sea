# Content(ful) Automated Task Service (CATS)

CATS is a service for performing various automated tasks on Contentful content entries.

## Features

- [Natural language translation](./docs/translate.md)
- [Zoho CRM contact sync](./docs/zoho-contacts.md)

## Architecture

CATS is a micro-service implemented as a [Nitro](https://nitro.build/) app. The app is built as a Docker image and deployed to Kubernetes.

The micro-service has various HTTP endpoints which may be used as webhook targets, or requested by other means.

[BullMQ](https://docs.bullmq.io/) is used to manage the flow of data through CATS in a message queue stored in Redis, so that HTTP requests respond promptly and work with third-party APIs takes place in the background.

A Nitro plugin is used to start a BullMQ worker process, meaning that each pod will run both the Nitro web server and a BullMQ worker. Scaling the number of pods results in an increase in capacity of both request handling and job processing.

## Tests

Tests use vitest, and are in a separate directory, [tests](./tests/), as otherwise Nitro tries to auto-register them as routes/plugins/etc.

## License

Licensed under the EUPL v1.2.
