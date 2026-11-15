import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, factorial } from "./calcEngine.js";

test("respects arithmetic precedence and right-associative powers", () => {
  assert.equal(evaluate("2 + 3 × 4").value, "14");
  assert.equal(evaluate("2^3^2").value, "512");
  assert.equal(evaluate("-2^2").value, "-4");
  assert.equal(evaluate("2^-2").value, "0.25");
});

test("supports constants and implicit multiplication", () => {
  assert.equal(evaluate("2π").value, "6.28318530718");
  assert.equal(evaluate("2(3 + 4)").value, "14");
  assert.equal(evaluate("(2 + 3)(4)").value, "20");
  assert.equal(evaluate("2e").value, String(2 * Math.E));
});

test("supports degree and radian trigonometry", () => {
  assert.equal(evaluate("sin(30)", "deg").value, "0.5");
  assert.equal(evaluate("sin(π/2)", "rad").value, "1");
  assert.equal(evaluate("asin(0.5)", "deg").value, "30");
  assert.equal(evaluate("cosh(0)").value, "1");
});

test("supports roots, logarithms, powers, and percentages", () => {
  assert.equal(evaluate("√(81)").value, "9");
  assert.equal(evaluate("∛(27)").value, "3");
  assert.equal(evaluate("log(1000)").value, "3");
  assert.equal(evaluate("ln(e)").value, "1");
  assert.equal(evaluate("EXP(1)").value, String(Math.E));
  assert.equal(evaluate("50% × 200").value, "100");
});

test("factorial accepts only non-negative integers", () => {
  assert.equal(factorial(0), 1);
  assert.equal(factorial(5), 120);
  assert.equal(Number.isNaN(factorial(-1)), true);
  assert.equal(Number.isNaN(factorial(2.5)), true);
  assert.equal(factorial(171), Infinity);
  assert.equal(evaluate("5!").value, "120");
  assert.equal(evaluate("2.5!").error, true);
});

test("rejects malformed expressions and invalid domains", () => {
  for (const expression of ["", "2+", "sin()", "unknown(2)", "1..2", "2**3", "(2+3", "(-1)!"]) {
    assert.equal(evaluate(expression).error, true, expression);
  }
  assert.equal(evaluate("√(-1)").error, true);
});

test("does not execute JavaScript embedded in an expression", () => {
  globalThis.__fabioCalcInjectionProbe = false;
  const result = evaluate("globalThis.__fabioCalcInjectionProbe = true");
  assert.equal(result.error, true);
  assert.equal(globalThis.__fabioCalcInjectionProbe, false);
  delete globalThis.__fabioCalcInjectionProbe;
});

test("rejects expressions that exceed parser limits", () => {
  assert.equal(evaluate("1+".repeat(300) + "1").error, true);
});
