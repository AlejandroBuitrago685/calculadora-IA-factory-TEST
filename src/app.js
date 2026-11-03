import { evaluate } from './calculator.js';
import { formatResult } from './format.js';

const input = document.querySelector('#expression');
const output = document.querySelector('#result');
const status = document.querySelector('#status');
let ans = 0;
let mode = 'DEG';
let history = [];

function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
  input.setAttribute('aria-invalid', String(error));
}
function setMode(next) {
  mode = next;
  for (const unit of ['DEG', 'RAD']) document.querySelector(`#${unit.toLowerCase()}`).setAttribute('aria-pressed', String(unit === mode));
}
function renderHistory() {
  const list = document.querySelector('#history');
  list.replaceChildren();
  document.querySelector('#empty-history').hidden = history.length > 0;
  for (const entry of history) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const expression = document.createElement('small');
    const result = document.createElement('strong');
    expression.textContent = `${entry.expression} · ${entry.mode}`;
    result.textContent = `${entry.formatted.approximate ? '≈' : '='} ${entry.formatted.text}`;
    button.append(expression, result);
    button.setAttribute('aria-label', `Recuperar ${entry.expression}, modo ${entry.mode}`);
    button.addEventListener('click', () => {
      input.value = entry.expression;
      ans = entry.ans;
      setMode(entry.mode);
      message('Operación recuperada, incluido su valor de Ans. Pulsa Calcular.');
      input.focus();
    });
    item.append(button);
    list.append(item);
  }
}
function calculate() {
  try {
    const value = evaluate(input.value, { ans, mode });
    const formatted = formatResult(value);
    history.unshift({ expression: input.value, mode, ans, formatted });
    history = history.slice(0, 20);
    ans = value;
    output.textContent = formatted.text;
    document.querySelector('#approx').textContent = formatted.approximate ? '≈' : '';
    message(formatted.unsafeInteger ? 'Aviso: entero fuera del rango seguro; puede perder precisión.' : formatted.approximate ? 'Resultado aproximado. Ans conserva la precisión interna.' : 'Resultado listo. Usa Ans para continuar.');
    renderHistory();
  } catch (error) {
    output.textContent = '—';
    document.querySelector('#approx').textContent = '';
    message(error.message, true);
  }
}
function clear() {
  input.value = '';
  output.textContent = '0';
  document.querySelector('#approx').textContent = '';
  message('Nueva operación. Ans conserva el último resultado.');
  input.focus();
}
document.querySelectorAll('[data-insert], [data-action]').forEach(button => {
  // Keep the input selection when using the pointer keypad.
  button.addEventListener('mousedown', event => event.preventDefault());
  button.addEventListener('click', () => {
    if (button.dataset.action === 'calculate') return calculate();
    if (button.dataset.action === 'clear') return clear();
    let start = input.selectionStart;
    const end = input.selectionEnd;
    const insertion = button.dataset.insert ?? '';
    if (button.dataset.action === 'delete' && start === end) start = Math.max(0, start - 1);
    if (input.value.length - (end - start) + insertion.length > 1000) return message('La expresión admite hasta 1000 caracteres.', true);
    input.setRangeText(insertion, start, end, 'end');
    message('Pulsa Enter o Calcular para resolver.');
    input.focus();
  });
});
input.addEventListener('input', () => message('Pulsa Enter o Calcular para resolver.'));
input.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); calculate(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); clear(); }
});
document.querySelector('#deg').addEventListener('click', () => setMode('DEG'));
document.querySelector('#rad').addEventListener('click', () => setMode('RAD'));
document.querySelector('#clear-history').addEventListener('click', () => { history = []; renderHistory(); message('Historial borrado.'); });
