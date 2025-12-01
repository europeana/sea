export default function useClickOutside(
  element: ref<HTMLElement | null>,
  isActive: ref<boolean>,
  onOutsideClick: () => void,
) {
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

    if (isClickOutside) {
      onOutsideClick();
    }
  };

  const removeEventListeners = () => {
    clickOutsideEvents.forEach((eventName) =>
      window.removeEventListener(eventName, checkAndHandleClickOutside, {
        capture: true,
      }),
    );
  };

  watch(isActive, (newVal: boolean) => {
    if (newVal) {
      clickOutsideEvents.forEach((eventName) =>
        window.addEventListener(eventName, checkAndHandleClickOutside, {
          capture: true,
        }),
      );
    } else {
      removeEventListeners();
    }
  });

  onUnmounted(() => {
    removeEventListeners();
  });
}
