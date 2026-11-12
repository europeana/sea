# Europeana Map styles

Custom styles for [`@europeana/map`](../../components/map/README.md).

## Usage

Includes two custom styles:

- [Protomaps](#protomaps)
- [Versatiles](#versatiles)

Each style has a base StyleJSON file and a script responsible for generating
multiple versions of the same, e.g. for supported locale, to be included in
the published package.

Build with `pnpm build`.

Once published, use a CDN to load the required version of the style.

## CDN URLs

A helper function, `useEuropeanaMapStyle`, is provided to generate CDN URLs for the
available styles.

```js
const styleURL = useEuropeanaMapStyle(styleName, styleOptions);
```

## Styles

### Protomaps

Uses [Protomaps](https://protomaps.com/) tiles with Europeana brand-themed styling.

No native-language version is available, so locale must be supplied.
Otherwise, or if the requested language is not supported, the English
version will be used as a fallback.

Localised versions are available in 25 European languages:
bg, cs, da, de, el, en, es, et, eu, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv

```js
const styleURL = useEuropeanaMapStyle("protomaps");
```

Options:

- `baseURL` — base URL of the CDN to use, defaults to `"https://cdn.jsdelivr.net/npm"`
  ```js
  const styleURL = useEuropeanaMapStyle("protomaps", {
    baseURL: "https://unpkg.com",
  });
  ```
- `locale` — locale to use for the localised place names
  ```js
  const styleURL = useEuropeanaMapStyle("protomaps", { locale: "fr" });
  ```
- `version` — `@europeana/map-styles` version to load, or latest if omitted
  ```js
  const styleURL = useEuropeanaMapStyle("protomaps", { version: "0.1.13" });
  ```

### Versatiles

Uses [Versatiles](https://versatiles.org/) tiles with Europeana brand-themed styling.

Native-language version is available, so locale is optional. If not supplied, or if
the requested language is not supported, native-language version will be used as a
fallback.

Localised versions are available in 9 European languages:
de, el, en, es, fr, it, nl, pl, pt

```js
const styleURL = useEuropeanaMapStyle("versatiles");
```

Options:

- `baseURL` — base URL of the CDN to use, defaults to `"https://cdn.jsdelivr.net/npm"`
  ```js
  const styleURL = useEuropeanaMapStyle("versatiles", {
    baseURL: "https://unpkg.com",
  });
  ```
- `locale` — locale to use for the localised place names
  ```js
  const styleURL = useEuropeanaMapStyle("versatiles", { locale: "fr" });
  ```
- `version` — `@europeana/map-styles` version to load, or latest if omitted
  ```js
  const styleURL = useEuropeanaMapStyle("versatiles", { version: "0.1.13" });
  ```

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
