export class CalculationError extends Error {}
const fail = (message) => { throw new CalculationError(message); };
const functions = new Set(['sqrt', 'abs', 'ln', 'log', 'sin', 'cos', 'tan']);

export function evaluate(expression, { ans = 0, mode = 'DEG' } = {}) {
  if (typeof expression !== 'string' || expression.length > 1000) fail('La expresión admite hasta 1000 caracteres.');
  if (!['DEG', 'RAD'].includes(mode)) fail('Modo angular inválido.');
  const source = expression.replaceAll(',', '.').replaceAll('π', 'pi').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
  const tokens = [];
  const pattern = /\s+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[+\-*/^()%]/gy;
  let offset = 0;
  while (offset < source.length) {
    pattern.lastIndex = offset;
    const match = pattern.exec(source);
    if (!match) fail(`Símbolo no permitido en la posición ${offset + 1}.`);
    offset = pattern.lastIndex;
    if (!/^\s+$/.test(match[0])) tokens.push(match[0].toLowerCase());
  }
  let position = 0;
  let depth = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const finite = (value) => {
    if (!Number.isFinite(value)) fail('Resultado fuera del rango numérico o del dominio real.');
    return value;
  };
  function nested(callback) {
    if (++depth > 80) fail('Expresión demasiado anidada. Simplifícala.');
    try { return callback(); } finally { depth--; }
  }
  function parenthesized() {
    if (take() !== '(') fail('Las funciones requieren paréntesis: sin(30).');
    const value = nested(sum);
    if (take() !== ')') fail('Falta cerrar un paréntesis.');
    return value;
  }
  function atom() {
    const token = peek();
    if (token === '(') return parenthesized();
    take();
    if (token === undefined) fail('La expresión está incompleta.');
    if (/^(?:\d|\.)/.test(token)) return finite(Number(token));
    if (token === 'pi') return Math.PI;
    if (token === 'e') return Math.E;
    if (token === 'ans') return finite(ans);
    if (!functions.has(token)) fail(`Valor o función no reconocido: ${token}.`);
    const value = parenthesized();
    if (token === 'sqrt' && value < 0) fail('La raíz cuadrada requiere un valor no negativo.');
    if (['ln', 'log'].includes(token) && value <= 0) fail('El logaritmo requiere un valor positivo.');
    const angle = mode === 'DEG' ? (value % 360) * Math.PI / 180 : value;
    if (token === 'tan' && Math.abs(Math.cos(angle)) < 1e-14) fail('La tangente no está definida en este ángulo.');
    const operations = { sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10 };
    return finite(operations[token] ? operations[token](value) : Math[token](angle));
  }
  function power() {
    let value = atom();
    while (peek() === '%') { take(); value /= 100; }
    if (peek() === '^') { take(); value = finite(value ** nested(unary)); }
    return value;
  }
  function unary() {
    if (peek() === '+' || peek() === '-') {
      const sign = take();
      const value = nested(unary);
      return sign === '-' ? -value : value;
    }
    return power();
  }
  function product() {
    let value = unary();
    while (peek() === '*' || peek() === '/') {
      const operator = take();
      const right = unary();
      if (operator === '/' && right === 0) fail('No se puede dividir entre cero.');
      value = finite(operator === '*' ? value * right : value / right);
    }
    return value;
  }
  function sum() {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const operator = take();
      const right = product();
      value = finite(operator === '+' ? value + right : value - right);
    }
    return value;
  }
  if (!tokens.length) fail('Escribe una operación para comenzar.');
  const result = sum();
  if (position !== tokens.length) fail('Expresión inesperada. Usa multiplicación explícita, por ejemplo 2*(3).');
  return finite(result);
}
