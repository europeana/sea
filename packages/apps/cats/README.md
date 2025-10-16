# Content(ful) Automated Translation Service (CATS)

## Overview

Editors make changes to the English text of a content entry in Contentful, and select tag(s) to indicate whether it should be translated, and to which languages.

A Contentful webhook calls a micro-service endpoint, which queues a background job to _request_ translations for the updated content entry.

When this request job is picked up, it requests from eTranslation translations of any English text(s) in the entry’s localised fields, provided the entry has been tagged to indicate translation is wanted. The job also queues further background jobs ready to _receive_ and _store_ the translations when ready.

When eTranslation has completed a translation to a particular language, it sends the result to another micro-service endpoint, which triggers the receive job for that language, extracts the translation and stores it locally.

When translations for all requested target languages have been received, then the store job uses the Contentful Management API to update the entry in Contentful, which has then been successfully translated.

## Architecture

In the SEA repo, there is a new app package named “cats”, abbreviating Content(ful) Automated Translation Service. This is a micro-service implemented as a [Nitro](https://nitro.build/) app, Nitro being the web server toolkit used by Nuxt, hence already a dependency of our new architecture. The app is built as a Docker image and deployed to Kubernetes.

This micro-service has two HTTP endpoints which are used as webhook targets, the first to receive data from Contentful potentially with updated English text, the second to receive the translated text back from eTranslation.

As the eTranslation service performs translations asynchronously, [BullMQ](https://docs.bullmq.io/) is used to manage the flow of data through CATS in a message queue stored in Redis.

A Nitro plugin is used to start a BullMQ worker process, meaning that each pod will run both the Nitro web server and a BullMQ worker. Scaling the number of pods results in an increase in capacity of both request handling and job processing.

## BullMQ

Three BullMQ queues are used: request, receive and store.

### Request queue

Jobs in the request queue are responsible for compiling translation requests from an entry’s English text(s) and sending them to eTranslation.

They will have been initialised with the [idempotency key from Contentful](https://www.contentful.com/developers/docs/webhooks/overview/#idempotency) as the job ID and the entry fields and metadata including tags as the job data.

The job worker will fetch from Contentful the definition for the entry’s content type and use this to determine which fields should be translated. Only short- and long-text fields marked as localised will be translated from the English. This handles both single-value and multi-value fields.

The entry’s tags will be inspected to ascertain if it should be translated at all, and if so whether to all languages – the tag “Translate” – or just to specific languages, e.g. the tag “Translate: Bulgarian (bg-BG)”.

Content entries often contain rich text using Markdown, but eTranslation does not offer explicit support for translating text using Markdown, and the translation process sometimes breaks the formatting if sent as though plain text. To work around this, we make use of the fact that eTranslation does support translation of HTML document. Any rich text fields are converted to HTML using `marked`, then an HTML document is constructed to represent all of the entry’s content requiring translation, using data attributes to indicate the source field.

Example:

```html
<html>
  <body>
    <article>
      <section data-ctf-field-id="name">About Europeana</section>
      <section data-ctf-field-id="description">
        <p><strong>Cultural heritage!</strong></p>
      </section>
      <section data-ctf-field-id="hasPart">
        <h2>History</h2>
        <p>...Europeana's history</p>
      </section>
      <section data-ctf-field-id="hasPart">
        <h2>History</h2>
        <p>Europeana's history...</p>
      </section>
      <section data-ctf-field-id="hasPart">
        <h2>Future</h2>
        <p>Europeana's future...</p>
      </section>
    </article>
  </body>
</html>
```

The worker will then queue jobs ready for receiving and storing translations when sent back by eTranslation. One receive job is created per language, but only one store job for all languages, with the receive jobs grouped as children of the store job. The receive jobs can not be processed until eTranslation supplies the data, so they are created with a 24 hour delay. \[NB: this is not an ideal way to handle the receive jobs not being ready for immediate processing, but some of the more advanced functions of BullMQ that may have suited better require a paid subscription.\]

Finally, it will send an HTTP request to eTranslation with the HTML document base64-encoded in the request body, requesting translation to all applicable languages, as identified by the Contentful tags.

### Receive queue

Jobs in the receive queue are responsible for extracting translated text(s) from the data received from eTranslation and keeping a temporary local copy of it.

Each receive job concerns translation to one language, as eTranslation delivers its translations per-language. All per-language receive jobs for a given content entry update will be grouped as children of a store job.

Job IDs are derived from the Contentful idempotency key and the language code.

The job worker will break down the sections in the translated HTML document (see “request queue”, above) into texts for the corresponding Contentful field. If that field is rich text, then the content will be converted back to Markdown using `turndown`.

If a field has a maximum character limit but the translation text exceeds that, it will be truncated and an ellipsis added. This may occur in the middle of Markdown formatting, which could for example break links.

The extracted translations are written back to the job as its result, ready for storage by the parent store job when all siblings are complete.

### Store queue

Jobs in the store queue are responsible for gathering the translations of all per-language child receive jobs – when all are complete – and writing them back to Contentful.

Job IDs are the Contentful idempotency key, same as for the initial request job.

The job worker fetches the latest version of the content entry from Contentful, then updates its field data with all of the translations gathered from the child receive jobs.

It then uses the Contentful Management API to first update the entry, storing the translations but in “changed” status, and finally to publish it.

Translations for this entry are now live and publicly accessible!

## Micro-service endpoints

### `POST /hooks/ctf`

This endpoint is responsible for receiving an updated Contentful entry and queuing a BullMQ job in the “request” queue.

It is configured as the target of a Contentful webhook, triggered when any content entry is published, either first published or subsequently re-published with changes. The Contentful webhook filters limit this to the master environment and exclude any changes made by the development account (to prevent infinite loops of publishing changes in English resulting in publishing translations from eTranslation resulting in re-requesting translations and so on).

The request body sent by Contentful to this endpoint includes the entry fields and metadata, including tags. The headers include one named `X-Contentful-Idempotency-Key` used to ensure idempotency in processing the webhook events.

The resultant request job will have the idempotency key from Contentful as the job ID and store the request body as the job’s data.

### `POST /hooks/etr`

This endpoint is responsible for receiving a translation payload for one content entry in one target language, from eTranslation.

Its URL is specified in translation requests sent to eTranslation as the HTTP notification target.

The request body sent by eTranslation to this endpoint includes the “external reference” which is the same as the Contentful idempotency key, the target language, and the translated document, base64-encoded. These are used to locate the receive job for the given idempotency key and target language, write the translated document to it, then remove the delay set on it at initialisation so that it may be picked up by a receive queue worker and further processed.

## License

Licensed under the EUPL v1.2.
