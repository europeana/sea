export default function useClickOutside(element: ref<HTMLElement | null>) {
  const clickedOutside = ref<boolean>(false);

  const clickOutsideEvents: string[] = [
    "click",
    "dblclick",
    "focusin",
    "touchstart",
  ];

  const checkAndHandleClickOutside = (event: Event) => {
    if (!element.value) return;

    const path = event.composedPath && event.composedPath();
    const isClickOutside = path
      ? path.indexOf(element.value) < 0
      : !element.value.contains(event.target);

    clickedOutside.value = isClickOutside;
  };

  const removeEventListeners = () => {
    clickOutsideEvents.forEach((eventName) =>
      window.removeEventListener(eventName, checkAndHandleClickOutside, {
        capture: true,
      }),
    );
  };

  const addEventListeners = () => {
    clickOutsideEvents.forEach((eventName) =>
      window.addEventListener(eventName, checkAndHandleClickOutside, {
        capture: true,
      }),
    );
  };

  return {
    clickedOutside: readonly(clickedOutside),
    enable: addEventListeners,
    disable: removeEventListeners,
  };
}
