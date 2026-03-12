// Calculator app — UI wiring and event handling.

import { CalculatorEngine } from './engine.js';

const engine = new CalculatorEngine();
const displayEl = document.querySelector('.display-value');
const keypad = document.querySelector('.keypad');

/**
 * Format a display string with locale-aware thousands separators.
 * Preserves trailing decimal points and fractional digits during input.
 */
function formatForDisplay(raw) {
  if (raw === 'Error') return 'Error';

  // Split integer and fractional parts
  const negative = raw.startsWith('-');
  const abs = negative ? raw.slice(1) : raw;
  const [intPart, fracPart] = abs.split('.');

  // Format integer part with thousands separators
  const formatted = Number(intPart).toLocaleString('en-US');

  let result = negative ? '-' + formatted : formatted;

  // Re-attach fractional part (including trailing dot for mid-input)
  if (raw.includes('.')) {
    result += '.' + (fracPart ?? '');
  }

  return result;
}

/** Read the engine display value and update the DOM. */
function updateDisplay() {
  const raw = engine.getDisplayValue();
  displayEl.textContent = formatForDisplay(raw);
}

/**
 * Handle a button action from the keypad.
 * @param {string} action - The data-action attribute value.
 * @param {string} [value] - The data-value attribute value (for digits/operators).
 */
function handleAction(action, value) {
  switch (action) {
    case 'digit':
      engine.inputDigit(Number(value));
      break;
    case 'decimal':
      engine.inputDecimal();
      break;
    case 'operator':
      engine.chooseOperation(value);
      break;
    case 'equals':
      engine.compute();
      break;
    case 'clear':
      engine.clear();
      break;
    case 'delete':
      engine.deleteDigit();
      break;
    case 'toggle-sign':
      engine.toggleSign();
      break;
    case 'percent':
      engine.percentage();
      break;
    default:
      return; // Unknown action — do nothing
  }
  updateDisplay();
}

// --- Event delegation on the keypad container ---
keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, value } = btn.dataset;
  handleAction(action, value);
});

// --- Keyboard support ---
const KEY_MAP = {
  '0': ['digit', '0'],
  '1': ['digit', '1'],
  '2': ['digit', '2'],
  '3': ['digit', '3'],
  '4': ['digit', '4'],
  '5': ['digit', '5'],
  '6': ['digit', '6'],
  '7': ['digit', '7'],
  '8': ['digit', '8'],
  '9': ['digit', '9'],
  '.': ['decimal'],
  '+': ['operator', '+'],
  '-': ['operator', '-'],
  '*': ['operator', '*'],
  '/': ['operator', '/'],
  Enter: ['equals'],
  '=': ['equals'],
  Backspace: ['delete'],
  Escape: ['clear'],
  Delete: ['clear'],
  '%': ['percent'],
};

document.addEventListener('keydown', (e) => {
  const mapping = KEY_MAP[e.key];
  if (!mapping) return;

  // Prevent default browser behavior for mapped keys (e.g., / opening find)
  e.preventDefault();

  const [action, value] = mapping;
  handleAction(action, value);
});

// Initialize display
updateDisplay();
