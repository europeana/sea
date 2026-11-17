# Zoho CRM contact sync

## Overview

Contact records and profile photos from Zoho CRM are synchronised into Contentful as `person` entries.

Syncing happens in two ways:

- **Individual updates:** A Zoho CRM workflow/webhook notifies CATS when a single contact is created or modified.
- **Bulk reads:** An HTTP request triggers a Zoho CRM Bulk Read job, which exports matching contacts as a zipped CSV file and notifies CATS via a callback URL when ready.

In both cases, each contact is processed using a parent–child BullMQ flow. A child job first fetches and uploads the contact's profile photo to Contentful, and once complete, the parent job creates or updates the corresponding `person` entry in Contentful and publishes it.

## Endpoints

Zoho CRM contact sync uses three HTTP endpoints.

### `POST /zoho/contacts`

This endpoint receives a single contact update notification (e.g., from a Zoho CRM webhook) and queues a BullMQ flow to sync that contact and their photo.

The request body must include:

- `id`: The Zoho CRM Contact ID (e.g., `"486281000001030363"`).
- `modified`: The contact's last modified UTC timestamp.

Job IDs for both the contact sync parent job and photo sync child job are derived from `id` and `modified` to ensure idempotency.

### `POST /zoho/bulk`

This endpoint initiates an asynchronous Zoho CRM Bulk Read export.

The request body must include `criteria` matching the `ZohoBulkReadCriteria` format expected by `@europeana/zoho-client`. The endpoint queues a job in the `zoho-crm-create-bulk-read` queue with a timestamp-derived job ID.

### `POST /zoho/bulk/callback`

This endpoint acts as the callback target invoked by Zoho CRM once a Bulk Read job finishes.

Zoho sends a payload containing `job_id` and `state`. When `state` is `"COMPLETED"`, CATS queues a job in the `zoho-crm-process-bulk-read` queue to download and process the exported CSV. If `state` is missing or not `"COMPLETED"`, the endpoint responds with HTTP `400 Bad Request`.

## BullMQ

Four BullMQ queues are used: `zoho-crm-create-bulk-read`, `zoho-crm-process-bulk-read`, `zoho-crm-sync-contact`, and `zoho-crm-sync-photo`.

### Create bulk read queue (`zoho-crm-create-bulk-read`)

Jobs in this queue call the Zoho CRM API via `@europeana/zoho-client` to schedule a Bulk Read export using the provided `criteria` and the configured `NITRO_ZOHO_BULK_READ_CALLBACK_URL`.

### Process bulk read queue (`zoho-crm-process-bulk-read`)

Jobs in this queue download the result of a completed Zoho Bulk Read job as a zipped archive stream.

The worker unzips the stream, locates `<zohoBulkReadJobId>.csv`, parses the CSV rows, and converts semicolon-delimited fields (`Communities` and `Contact_Participation`) into arrays. It then queues parent–child sync flows (`zoho-crm-sync-contact` and `zoho-crm-sync-photo`) in batches of 100 via BullMQ's `FlowProducer`, passing the parsed CSV record directly in the job data so individual Zoho API fetches are not needed.

### Sync photo queue (`zoho-crm-sync-photo`)

Jobs in this queue run as children of `zoho-crm-sync-contact` jobs.

The worker fetches the contact's photo from Zoho CRM. If no photo exists, it returns `{ assetId: null }`. Otherwise, it uploads the file to Contentful and creates or updates an asset with the deterministic ID `zoho-contact-photo-<contactId>`, processes the asset for all locales, publishes it, and returns the `assetId` to the parent job.

### Sync contact queue (`zoho-crm-sync-contact`)

Jobs in this queue run once their child `zoho-crm-sync-photo` job completes.

If a `contactRecord` was not already supplied by a bulk read job, the worker fetches the full contact record from Zoho CRM using `contactId`. It maps the Zoho fields (`Full_Name`, `Public_email`, `Contact_Participation`, `Title`, `Country_new`, `Communities`, `LinkedIn`, and `id`) to Contentful `person` entry fields in the configured default locale (`en-GB`) and attaches the Contentful image asset link if `assetId` was returned by the photo job.

Before writing to Contentful, array values (`communities` and `participation`) are filtered against the Contentful content type's allowed validation values (`in`) so invalid options do not reject the entry update. The worker then finds any existing `person` entry matching `fields.zohoId`, updates or creates the entry, and publishes it.
