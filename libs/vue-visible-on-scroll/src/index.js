let element;
let routeWithHash;
let desktopBreakpoint;

export default {
  // Vue 3
  mounted(el, binding) {
    initOnMounted(el, binding);
  },
  unmounted() {
    onUnmounted();
  },

  // Vue 2
  inserted(el, binding) {
    initOnMounted(el, binding);
  },
  unbind() {
    onUnmounted();
  },
};

const initOnMounted = (el, binding) => {
  element = el;
  routeWithHash = binding.value?.routeHash;
  desktopBreakpoint = binding.value?.desktopBreakpoint;

  if (onDesktop() || !desktopBreakpoint) {
    enableVisibleOnScroll();
  }

  if (desktopBreakpoint) {
    window.addEventListener("resize", handleResize);
  }
};

const onUnmounted = () => {
  disableVisibleOnScroll();
  window.removeEventListener("resize", handleResize);

  element = null;
  routeWithHash = null;
  desktopBreakpoint = null;
};

let enabled = false;

const onDesktop = () => window.innerWidth >= desktopBreakpoint;

const handleScroll = () => {
  const oldPosition = element.scrollPosition ?? 0;
  const newPosition = window.scrollY;
  const scrolledDown = oldPosition < newPosition;
  const scrolledUp = oldPosition - 5 > newPosition;

  if (scrolledDown && oldPosition > 150 && element.scrolledVisible) {
    element.style.transform = "translate3d(0, -100%, 0)";
    element.classList.remove("show");
    element.scrolledVisible = false;
  } else if ((scrolledUp || oldPosition <= 150) && !element.scrolledVisible) {
    element.style.transform = "translate3d(0, 0, 0)";
    element.classList.add("show");
    element.scrolledVisible = true;
  }
  element.scrollPosition = newPosition;
};

const handleHashChange = () => {
  element.scrolledVisible = false;
};

const enableVisibleOnScroll = () => {
  element.scrolledVisible = !routeWithHash;
  element.style.transform = "translate3d(0, 0, 0)";
  element.classList.add("show");

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("hashchange", handleHashChange);
  enabled = true;
};

const disableVisibleOnScroll = () => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("hashchange", handleHashChange);
  if (element) {
    element.style.transform = "translate3d(0, 0, 0)";
    element.classList.remove("show");
  }
  enabled = false;
};

const handleResize = () => {
  if (!enabled && onDesktop()) {
    enableVisibleOnScroll();
  } else if (enabled && !onDesktop()) {
    disableVisibleOnScroll();
  }
};
