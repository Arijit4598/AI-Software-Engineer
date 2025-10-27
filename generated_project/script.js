// Calculator script
// Define constants for DOM elements
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

/**
 * Calculator class handling the core logic.
 */
class Calculator {
  constructor() {
    this.currentInput = '';
    this.previousValue = null; // number
    this.operator = null; // '+', '-', '*', '/'
    this.resetNext = false; // flag to clear input on next digit press
  }

  /** Update the visual display */
  updateDisplay() {
    display.value = this.currentInput;
  }

  /** Append a digit or decimal point to the current input */
  append(value) {
    if (this.resetNext) {
      this.currentInput = '';
      this.resetNext = false;
    }
    // Prevent multiple leading zeros (except when after decimal point)
    if (value === '0' && this.currentInput === '0') return;
    // Prevent multiple decimal points
    if (value === '.' && this.currentInput.includes('.')) return;
    this.currentInput += value;
    this.updateDisplay();
  }

  /** Set the operator (+, -, *, /) */
  setOperator(op) {
    // If there is already an operator and a previous value, calculate first
    if (this.operator && this.previousValue !== null && this.currentInput !== '') {
      this.calculate();
    }
    // Store the current number as previousValue
    if (this.currentInput !== '') {
      this.previousValue = parseFloat(this.currentInput);
    }
    this.operator = op;
    this.resetNext = true; // next number entry should start fresh
  }

  /** Perform the calculation based on stored operator */
  calculate() {
    if (!this.operator || this.previousValue === null || this.currentInput === '') {
      return; // nothing to compute
    }
    const current = parseFloat(this.currentInput);
    let result;
    switch (this.operator) {
      case '+':
        result = this.previousValue + current;
        break;
      case '-':
        result = this.previousValue - current;
        break;
      case '*':
        result = this.previousValue * current;
        break;
      case '/':
        // Handle division by zero gracefully
        result = current === 0 ? 'Error' : this.previousValue / current;
        break;
      default:
        return;
    }
    // Convert result to string (handle Error case)
    this.currentInput = typeof result === 'number' ? result.toString() : result;
    // Reset stored values
    this.previousValue = null;
    this.operator = null;
    this.resetNext = true;
    this.updateDisplay();
  }

  /** Clear all entries */
  clear() {
    this.currentInput = '';
    this.previousValue = null;
    this.operator = null;
    this.resetNext = false;
    this.updateDisplay();
  }

  /** Remove the last character from the current input */
  backspace() {
    if (this.resetNext) {
      // If we were about to start a new number, just clear it
      this.currentInput = '';
      this.resetNext = false;
    } else {
      this.currentInput = this.currentInput.slice(0, -1);
    }
    this.updateDisplay();
  }
}

// Instantiate the calculator
const calc = new Calculator();

/**
 * Handle button click events.
 */
function handleButtonClick(event) {
  const key = event.currentTarget.dataset.key;
  if (!key) return;

  if (/[0-9.]/.test(key)) {
    calc.append(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    calc.setOperator(key);
  } else if (key === '=') {
    calc.calculate();
  } else if (key === 'C') {
    calc.clear();
  } else if (key === '←') {
    calc.backspace();
  }
}

// Attach click listeners to all calculator buttons
buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

/**
 * Keyboard support – map physical keys to calculator actions.
 */
function handleKeyDown(e) {
  const key = e.key;
  if (/[0-9]/.test(key)) {
    calc.append(key);
    e.preventDefault();
  } else if (key === '.' || key === ',') {
    // Accept comma as decimal separator for convenience
    calc.append('.');
    e.preventDefault();
  } else if (['+', '-', '*', '/'].includes(key)) {
    calc.setOperator(key);
    e.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    calc.calculate();
    e.preventDefault();
  } else if (key === 'Backspace') {
    calc.backspace();
    e.preventDefault();
  } else if (key === 'Escape') {
    calc.clear();
    e.preventDefault();
  }
}

document.addEventListener('keydown', handleKeyDown);

// Export the class for potential testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator;
} else {
  // Attach to window for non‑module environments
  window.Calculator = Calculator;
}
