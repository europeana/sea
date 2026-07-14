# Europeana Map component

Vue 3 component/app to show a map on which clustered points may be displayed.

## Usage

TODO

### Popover

To use the popover feature pass in the `pinPopover` prop with an existing HTML element.
When single points are clicked a `change:activefeature` event with a `activeFeatureName` prop is dispatched on the map instance. This can be used, for exampe, to set the relevant popover content.

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
