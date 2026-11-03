import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, CalculationError } from '../src/calculator.js';

for (const [expression, expected] of [
  ['2+3*4',14], ['(2+3)*4',20], ['2^3^2',512], ['-2^2',-4], ['2^-2',0.25],
  ['(-2)^2',4], ['10-3-2',5], ['24/4/2',3], ['1,5 + 2,25',3.75], ['.5+.25',0.75],
  ['50%',0.5], ['200*10%',20], ['200+10%',200.1], ['100%%',0.01],
  ['sqrt(9)',3], ['abs(-2)',2], ['ln(e)',1], ['log(100)',2],
  ['sin(30)',0.5], ['cos(60)',0.5], ['tan(45)',1], ['sin(-30)',-0.5],
  ['π*2',Math.PI*2], ['2×3−4÷2',4], ['2e-3+1E2',100.002], ['+2--3',5], ['sqrt(abs(-16))',4], ['0^0',1],
]) test(`evalúa ${expression}`, () => assert.ok(Math.abs(evaluate(expression)-expected)<1e-12));

test('radianes, grados y Ans con precisión interna', () => {
  assert.equal(evaluate('sin(pi/2)', { mode:'RAD' }),1);
  assert.ok(Math.abs(evaluate('sin(390)')-0.5)<1e-12);
  assert.equal(evaluate('Ans*3', { ans:evaluate('1/3') }),1);
});
for (const expression of ['', '1+', '2(3)', '(2+3', '2)', '1..2', '3 4', 'foo(2)',
  '1/0', '1/(-0)', 'sqrt(-1)', 'ln(0)', 'log(-1)', 'tan(90)', 'tan(270)',
  '10^1000', '(-1)^0.5', 'sin 30', '1e999', 'alert(1)', 'globalThis.process',
  'constructor(1)', '<script>', '1;2', '2**3']) {
  test(`rechaza ${expression || 'entrada vacía'}`, () => assert.throws(() => evaluate(expression), CalculationError));
}
test('singularidades y límites con errores controlados', () => {
  assert.throws(() => evaluate('tan(pi/2)', {mode:'RAD'}), /tangente/);
  assert.throws(() => evaluate('1'.repeat(1001)), /1000/);
  for (const expression of ['('.repeat(90)+'1'+')'.repeat(90), '-'.repeat(90)+'1', '1^'.repeat(90)+'1']) assert.throws(() => evaluate(expression), /anidada/);
  assert.equal(evaluate('('.repeat(20)+'1'+')'.repeat(20)),1);
  assert.throws(() => evaluate('Ans', {ans:Infinity}), CalculationError);
  assert.throws(() => evaluate('1', {mode:'unknown'}), CalculationError);
});
