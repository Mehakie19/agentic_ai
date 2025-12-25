// script.js - Scientific Calculator Logic
// -------------------------------------------------
// This script defines a Calculator class that encapsulates all calculator
// functionality. The public API consists of the constructor (receiving a CSS
// selector for the display element) and the `init` method, which wires UI
// events and sets the initial display value.
//
// Assumptions:
// * The HTML markup provides a container with id="calculator" that holds all
//   button elements.
// * Every button has `data-action` (digit, operator, function, clear, equals)
//   and `data-value` attributes describing its role/value.
// * The display element is an <input> (read‑only) identified by the selector
//   passed to the constructor.
// * Modern browsers support private class fields (`#`) and ES6 modules.
//
// The implementation follows the specification provided in the task prompt.

(function () {
  "use strict";

  /**
   * Calculator class handling UI interaction and arithmetic logic.
   */
  class Calculator {
    // Private fields
    #displayEl;
    #currentInput = ""; // string representation of the number being typed
    #previousValue = null; // numeric value stored before an operator
    #operator = null; // pending operator (+, -, *, /, ^)
    #resultDisplayed = false; // flag to start fresh after showing a result

    /**
     * @param {string} displaySelector CSS selector for the display <input>.
     */
    constructor(displaySelector) {
      const el = document.querySelector(displaySelector);
      if (!el) {
        throw new Error(`Display element not found for selector: ${displaySelector}`);
      }
      this.#displayEl = el;
    }

    /** Initialise the calculator – bind events and set default display. */
    init() {
      this.bindEvents();
      this.updateDisplay("0");
    }

    /** Attach a delegated click listener to the calculator container. */
    bindEvents() {
      const container = document.getElementById("calculator");
      if (!container) {
        throw new Error("Calculator container with id 'calculator' not found.");
      }
      container.addEventListener("click", this.handleClick.bind(this));
    }

    /** Central click handler – dispatches based on data-action attribute. */
    handleClick(event) {
      const btn = event.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      switch (action) {
        case "digit":
          this.appendDigit(value);
          break;
        case "operator":
          this.setOperator(value);
          break;
        case "function":
          this.applyFunction(value);
          break;
        case "clear":
          this.clearAll();
          break;
        case "equals":
          this.computeResult();
          break;
        default:
          // Unknown action – ignore.
          break;
      }
    }

    /** Append a digit or decimal point to the current input. */
    appendDigit(d) {
      if (this.#resultDisplayed) {
        // Start a new calculation after a result.
        this.#currentInput = "";
        this.#resultDisplayed = false;
      }

      if (d === "." && this.#currentInput.includes(".")) {
        // Prevent multiple decimal points.
        return;
      }

      this.#currentInput += d;
      this.updateDisplay(this.#currentInput);
    }

    /** Store the selected operator and prepare for the next operand. */
    setOperator(op) {
      // If there is no current input and no previous value, nothing to do.
      if (this.#currentInput === "" && this.#previousValue === null) return;

      // If an operator is already pending and we have a new operand, compute intermediate result.
      if (this.#previousValue !== null && this.#operator) {
        this.computeResult();
      }

      // Preserve the current input as the left-hand operand.
      this.#previousValue = parseFloat(this.#currentInput) || this.#previousValue;
      this.#operator = op;
      this.#currentInput = "";
    }

    /** Compute the result of the pending binary operation. */
    computeResult() {
      if (this.#operator === null) return; // Nothing to compute.

      const a = this.#previousValue;
      const b = parseFloat(this.#currentInput);
      let res;

      switch (this.#operator) {
        case "+":
          res = a + b;
          break;
        case "-":
          res = a - b;
          break;
        case "*":
          res = a * b;
          break;
        case "/":
          res = b !== 0 ? a / b : NaN;
          break;
        case "^":
          res = Math.pow(a, b);
          break;
        default:
          res = NaN;
      }

      this.updateDisplay(this.formatNumber(res));
      // Prepare for possible further operations.
      this.#previousValue = res;
      this.#currentInput = "";
      this.#operator = null;
      this.#resultDisplayed = true;
    }

    /** Apply a scientific function to the current input or displayed value. */
    applyFunction(fn) {
      // Determine the numeric value to operate on.
      let val = parseFloat(this.#currentInput);
      if (isNaN(val)) {
        // If no current input, fall back to the value shown on the display.
        val = parseFloat(this.#displayEl.value);
      }

      let res;
      switch (fn) {
        case "sin":
          res = Math.sin(this.toRadians(val));
          break;
        case "cos":
          res = Math.cos(this.toRadians(val));
          break;
        case "tan":
          res = Math.tan(this.toRadians(val));
          break;
        case "log":
          // Base‑10 logarithm.
          res = Math.log10(val);
          break;
        case "ln":
          res = Math.log(val);
          break;
        case "√":
          res = Math.sqrt(val);
          break;
        case "π":
          res = Math.PI;
          break;
        case "e":
          res = Math.E;
          break;
        case "±":
          res = -val;
          break;
        case "%":
          res = val / 100;
          break;
        case "^":
          // Treat as exponentiation of the current value by itself (val^val).
          res = Math.pow(val, val);
          break;
        default:
          // Unknown function – ignore.
          return;
      }

      // Store result as the new current input and update display.
      this.#currentInput = this.formatNumber(res);
      this.updateDisplay(this.#currentInput);
      this.#resultDisplayed = true;
    }

    /** Reset the calculator to its initial state. */
    clearAll() {
      this.#currentInput = "";
      this.#previousValue = null;
      this.#operator = null;
      this.#resultDisplayed = false;
      this.updateDisplay("0");
    }

    /** Update the display element with the provided content. */
    updateDisplay(content) {
      this.#displayEl.value = content;
    }

    /** Format a number for display – handles errors and limits decimal places. */
    formatNumber(num) {
      if (Number.isNaN(num) || !Number.isFinite(num)) {
        return "Error";
      }
      // Limit to 12 decimal places to avoid floating‑point noise.
      return Number(num.toFixed(12)).toString();
    }

    /** Convert degrees to radians (used by trigonometric functions). */
    toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }

  // Instantiate and initialise the calculator.
  const calc = new Calculator("#display");
  calc.init();
})();