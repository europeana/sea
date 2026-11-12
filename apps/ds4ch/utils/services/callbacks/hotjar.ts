export default function hotjarCallback(consent: boolean) {
  const { initHotjar } = useHotjar();

  const runtimeConfig = useRuntimeConfig();
  if (consent) {
    if (!window.hj) {
      // only init hotjar again if it's not yet defined on the window as consent may trigger multiple times
      initHotjar(
        runtimeConfig?.public?.hotjar?.id,
        runtimeConfig?.public?.hotjar?.snippetVersion,
      );
    }
  } else if (window.hj) {
    // hotjar tracking code offers no method to disable/unload it, so
    // reload the page to get rid of it
    window.location.reload();
  }
}
