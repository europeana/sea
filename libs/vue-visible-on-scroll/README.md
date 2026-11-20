# Visible on scroll Vue directive

Makes an element hide scrolling down and appear scrolling up.
Example use case: hide and appear of the top page header.

## Usage

Import the directive into a component and set it on the element that should hide/appear on scroll:

```jsx
import vVisibleOnScroll from "@europeana/vue-visible-on-scroll";
```

```jsx
<div v-visible-on-scroll />
```

### optional values to pass to the directive

- `routeHash`: Pass in (`$route.hash`) to prevent the element hiding when the route contains a hash (and scrolls down automatically on page load). Will hide the element again on subsequent scroll.
- `desktopBreakpoint`: an integer breakpoint value below which the effect should be disabled.

### Smooth transition on hide/appear

For a smoother transition effect set a transition style on the element:

```scss
transition: transform $standard-transition;
```

## License

Licensed under the [EUPL v1.2](../../../LICENSE.md).
