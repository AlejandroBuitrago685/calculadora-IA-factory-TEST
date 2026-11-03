import test from 'node:test';
import assert from 'node:assert/strict';
import { formatResult } from '../src/format.js';
for (const [value, expected] of [[1/3,'0,333'], [2/3,'0,667'], [3.75,'3,75'],
  [0.1+0.2,'0,3'], [2,'2'], [-0,'0'], [-1.2345,'-1,235'], [1.2345,'1,235'],
  [9.9999,'10'], [0.001,'0,001'], [1e-8,'1e-8'], [-1.23456e-8,'-1,235e-8'],
  [1e20,'1e+20'], [Number.MIN_VALUE,'4,941e-324'], [Number.MAX_VALUE,'1,798e+308']]) {
  test(`presenta ${value} como ${expected}`, () => assert.equal(formatResult(value).text,expected));
}
test('aproximaciones, enteros no seguros y valores inválidos', () => {
  assert.equal(formatResult(1/3).approximate,true);
  assert.equal(formatResult(0.1+0.2).approximate,true);
  assert.equal(formatResult(0.5).approximate,false);
  assert.equal(formatResult(-0).approximate,false);
  assert.equal(formatResult(1e20).unsafeInteger,true);
  assert.equal(formatResult(42).unsafeInteger,false);
  for (const value of [NaN,Infinity,-Infinity]) assert.throws(() => formatResult(value),RangeError);
});
