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

Specify the style using the `style` prop, supplying a URL to a StyleJSON file.

```js
{
  style: "https://map.example.org/style.json";
}
```

If no value is specified, or the special value "openstreetmap" is supplied, then
standard [OpenStreetMap](https://www.openstreetmap.org/) tiles will be used.

For pre-built Europeana map styles, see [@europeana/map-styles](../../style/map-styles/README.md).

### Popover

To use the popover feature pass in the `pinPopover` prop with an existing HTML element.

When single points are clicked a `change:activefeature` event with a `activeFeatureName` prop is dispatched on the map instance. This can be used, for example, to set the relevant popover content.

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
