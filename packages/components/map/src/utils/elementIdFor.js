// derives ids for various elements from the map element id
export const elementIdFor = (mapElementId, type) => {
  return {
    keyboardEventTarget: `${mapElementId}-keyboard-toggle`,
    keyboardFocusPinToggle: `${mapElementId}-keyboard-focus-pin-toggle`,
  }[type];
};
