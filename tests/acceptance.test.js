import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/calculator.js';
import { formatResult } from '../src/format.js';

for (const [expression, expected] of [
  ['1,5+2,25', '3,75'],
  ['1/3', '0,333'],
  ['2/3', '0,667'],
  ['0.1+0.2', '0,3'],
  ['1,23456*10000', '12345,6'],
  ['0.0000123456/10', '1,235e-6'],
  ['123456789*10000', '1,235e+12'],
]) {
  test(`aceptación: ${expression} muestra ${expected}`, () => {
    assert.equal(formatResult(evaluate(expression)).text, expected);
  });
}

test('aceptación: presentar tres decimales no redondea Ans', () => {
  const ans = evaluate('1/3');
  assert.equal(formatResult(ans).text, '0,333');
  assert.equal(formatResult(evaluate('Ans*3', { ans })).text, '1');
});
