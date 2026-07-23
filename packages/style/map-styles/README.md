# Europeana Map styles

NOTE: map-styles pre-release #1

Custom styles for `@europeana/map`.

Includes two custom styles:

- Protomaps, which builds to 25 European languages
- Versatiles, which builds to 9 European languages

Each style has a base StyleJSON file and a script responsible for generating
multiple versions of the same, e.g. for supported locale, to be included in
the published package.

Build with `pnpm  build`.

Once published, use a CDN to load the required version of the style.

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
