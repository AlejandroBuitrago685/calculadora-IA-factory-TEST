export function formatResult(value) {
  if (!Number.isFinite(value)) throw new RangeError('El resultado debe ser finito.');
  const magnitude = Math.abs(value);
  const scientific = magnitude !== 0 && (magnitude < 0.001 || magnitude >= 1e12);
  // Round the decimal representation, avoiding binary scaling at ties (1.005).
  const [coefficient, exponent = '0'] = magnitude.toString().split('e');
  const rounded = scientific ? null : Math.round(Number(`${coefficient}e${Number(exponent) + 3}`)) / 1000 * Math.sign(value);
  let raw = scientific ? value.toExponential(3) : String(Object.is(rounded, -0) ? 0 : rounded);
  if (scientific) raw = raw.replace(/(\.\d*?)0+e/, '$1e').replace('.e', 'e');
  return {
    text: raw.replace('.', ','),
    approximate: Number(raw) !== value,
    unsafeInteger: Number.isInteger(value) && !Number.isSafeInteger(value),
  };
}
