let element;
let routeWithHash;
let desktopBreakpoint;

export default {
  mounted(el, binding) {
    element = el;
    // expects $route.hash and desktop breakpoint to be passed
    routeWithHash = binding.value.routeHash;
    desktopBreakpoint = binding.value.desktopBreakpoint;

    if (process.browser && onDesktop()) {
      enableVisibleOnScroll();
    }

    window.addEventListener("resize", handleResize);
  },

  // TODO remove even listeners on unmounted? Current use in header, is always mounted
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
  element.style.transform = "translate3d(0, 0, 0)";
  element.classList.remove("show");
  enabled = false;
};

const handleResize = () => {
  if (!enabled && onDesktop()) {
    enableVisibleOnScroll();
  } else if (enabled && !onDesktop()) {
    disableVisibleOnScroll();
  }
};
