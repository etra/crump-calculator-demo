// Calculator engine — pure computation logic, no DOM dependencies.

const MAX_DIGITS = 12;

export class CalculatorEngine {
  constructor() {
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetDisplay = false;
    this.error = false;
  }

  inputDigit(digit) {
    if (this.error) return;

    if (this.shouldResetDisplay) {
      this.currentOperand = String(digit);
      this.shouldResetDisplay = false;
      return;
    }

    // Don't allow more than MAX_DIGITS digits (excluding decimal point and minus)
    const digitCount = this.currentOperand.replace(/[-.]/, '').length;
    if (digitCount >= MAX_DIGITS) return;

    if (this.currentOperand === '0' && digit !== 0) {
      this.currentOperand = String(digit);
    } else if (this.currentOperand === '0' && digit === 0) {
      // No-op: already "0"
    } else {
      this.currentOperand += String(digit);
    }
  }

  inputDecimal() {
    if (this.error) return;

    if (this.shouldResetDisplay) {
      this.currentOperand = '0.';
      this.shouldResetDisplay = false;
      return;
    }

    if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
    }
  }

  chooseOperation(op) {
    if (this.error) return;

    // If there's a pending operation and the user hasn't reset the display,
    // compute the intermediate result first (chained operations).
    if (this.operation && !this.shouldResetDisplay) {
      this.compute();
      if (this.error) return;
    }

    this.operation = op;
    this.previousOperand = this.currentOperand;
    this.shouldResetDisplay = true;
  }

  compute() {
    if (this.error) return;
    if (this.operation === null) return;

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let result;
    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          this.error = true;
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = null;
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    // Check for overflow
    if (!isFinite(result)) {
      this.error = true;
      this.currentOperand = 'Error';
      this.previousOperand = '';
      this.operation = null;
      return;
    }

    this.currentOperand = this._formatResult(result);
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetDisplay = true;
  }

  deleteDigit() {
    if (this.error) return;
    if (this.shouldResetDisplay) return;

    if (this.currentOperand.length === 1 ||
        (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  toggleSign() {
    if (this.error) return;
    if (this.currentOperand === '0') return;

    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  percentage() {
    if (this.error) return;

    const value = parseFloat(this.currentOperand);
    if (isNaN(value)) return;

    const result = value / 100;
    this.currentOperand = this._formatResult(result);
  }

  getDisplayValue() {
    if (this.error) return 'Error';

    // If the user is still typing (has trailing decimal), return as-is
    if (this.currentOperand.endsWith('.')) {
      return this.currentOperand;
    }

    // For computed results, format nicely
    const num = parseFloat(this.currentOperand);
    if (isNaN(num)) return this.currentOperand;

    // If the string representation is what the user typed (not a computed result),
    // return it preserving trailing zeros after decimal during input
    if (!this.shouldResetDisplay && this.currentOperand.includes('.')) {
      return this.currentOperand;
    }

    return this._formatDisplay(num);
  }

  /**
   * Format a computation result to a clean string,
   * avoiding floating-point artifacts.
   */
  _formatResult(value) {
    // Use toPrecision to limit significant digits and strip artifacts
    const formatted = parseFloat(value.toPrecision(MAX_DIGITS));
    return String(formatted);
  }

  /**
   * Format a number for display, limiting to MAX_DIGITS significant digits.
   * Falls back to scientific notation for very large or very small numbers.
   */
  _formatDisplay(value) {
    if (value === 0) return '0';

    const str = String(value);

    // If the plain string is short enough, use it
    const digitCount = str.replace(/[-.]/, '').length;
    if (digitCount <= MAX_DIGITS) {
      return str;
    }

    // Try toPrecision first
    const precise = parseFloat(value.toPrecision(MAX_DIGITS));
    const preciseStr = String(precise);

    // If the result is still too long, use scientific notation
    if (preciseStr.length > MAX_DIGITS + 2) {
      return value.toExponential(6);
    }

    return preciseStr;
  }

  /** Return the currently pending operation, if any. */
  getOperation() {
    return this.operation;
  }
}
