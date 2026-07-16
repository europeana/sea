# Europeana Map component

Vue 3 component/app to show a map on which clustered points may be displayed.

## Usage

TODO

### Popover

To use the popover feature pass in the `pinPopover` prop with an existing HTML element.

When single points are clicked a `change:activefeature` event with a `activeFeatureName` prop is dispatched on the map instance. This can be used, for exampe, to set the relevant popover content.

### Controls

The attributions control is added by default.

To add and customise the zoom and/or fullscreen controls pass in the `controls` prop with each control to be added and the options:

```
{ zoom: options, fullscreen: options }
```

Zoom control docs with list of options: https://openlayers.org/en/latest/apidoc/module-ol_control_Zoom-Zoom.html

Fullscreen control docs with list of options: https://openlayers.org/en/latest/apidoc/module-ol_control_FullScreen-FullScreen.html

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
