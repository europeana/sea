# Europeana Map component

Vue 3 component/app to show a map on which clustered points may be displayed.

## Usage

TODO

## Customisation

### Controls

The attributions control is added by default.

To add and customise the zoom, fullscreen and attribution controls pass in the `controls` prop with each control to be added and the options:

```js
{ zoom: options, fullscreen: options, attribution: options }
```

The attribution will be added by default, but can be customised. E.g. to use localised text and display as collapsible element.

Zoom, Fullscreen and Attribution control docs with list of options:

- https://openlayers.org/en/latest/apidoc/module-ol_control_Zoom-Zoom.html
- https://openlayers.org/en/latest/apidoc/module-ol_control_FullScreen-FullScreen.html
- https://openlayers.org/en/latest/apidoc/module-ol_control_Attribution-Attribution.html

### Style

Specify the style using the `style` prop, indicating either just the name of an
explicitly supported style, or a URL to a StyleJSON file.

```js
{
  style: "STYLE_NAME_OR_URL";
}
```

If passed an array, the first value is the style name/URL, and the second is an
object of style options for supported styles.

#### OpenStreetMap (default)

Uses standard [OpenStreetMap](https://www.openstreetmap.org/) tiles.

```js
// optional as this is the default
{
  style: "openstreetmap";
}
```

Options: none.

#### Protomaps

Uses customised [Protomaps](https://protomaps.com/) tiles, via [`@europeana/map-styles`](https://github.com/europeana/sea/tree/main/packages/style/map-styles).

No native-language version is available, so locale must be supplied.

```js
{
  style: ["protomaps", { locale: "en" }];
}
```

Options:

- `baseURL` — base URL of the CDN to use, defaults to `"https://cdn.jsdelivr.net/npm"`
  ```js
  {
    style: ["protomaps", { baseURL: "https://unpkg.com" }];
  }
  ```
- `locale` — locale to use for the localised place names
  ```js
  {
    style: ["protomaps", { locale: "en" }];
  }
  ```
- `version` — `@europeana/map-styles` version to load, or latest if omitted
  ```js
  {
    style: ["protomaps", { version: "0.1.13" }];
  }
  ```

#### Versatiles

Uses customised [Versatiles](https://versatiles.org/) tiles, via [`@europeana/map-styles`](https://github.com/europeana/sea/tree/main/packages/style/map-styles).

Native-language version is available, so locale is optional.

```js
{
  style: "versatiles";
}
```

Options:

- `baseURL` — base URL of the CDN to use, defaults to `"https://cdn.jsdelivr.net/npm"`
  ```js
  {
    style: ["versatiles", { baseURL: "https://unpkg.com" }];
  }
  ```
- `locale` — locale to use for the localised place names
  ```js
  {
    style: ["versatiles", { locale: "en" }];
  }
  ```
- `version` — `@europeana/map-styles` version to load, or latest if omitted
  ```js
  {
    style: ["versatiles", { version: "0.1.13" }];
  }
  ```

#### Other (URL)

Other styles may be loaded by supplying the URL to the StyleJSON file.

```js
{
  style: "https://tiles.openfreemap.org/styles/liberty";
}
```

Options: none.

### Popover

To use the popover feature pass in the `pinPopover` prop with an existing HTML element.

When single points are clicked a `change:activefeature` event with a `activeFeatureName` prop is dispatched on the map instance. This can be used, for example, to set the relevant popover content.

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
