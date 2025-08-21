/**
 * ... and stores that as the `parity` property with value "odd" or "even"
 */
export function annotateParity(items) {
  for (let i = 0; i < items.length; i = i + 1) {
    const num = i + 1;
    items[i].parity = num % 2 === 1 ? "odd" : "even";
  }
}
