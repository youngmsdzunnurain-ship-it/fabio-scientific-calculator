// Calculator engine - evaluates mathematical expressions safely

export function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function evaluate(expr, angleMode = "deg") {
  try {
    let processed = expr;

    // Replace display symbols with JS operators
    processed = processed.replace(/×/g, "*");
    processed = processed.replace(/÷/g, "/");
    processed = processed.replace(/−/g, "-");

    // Handle percentage
    processed = processed.replace(/(\d+\.?\d*)%/g, "($1/100)");

    // Handle factorial
    processed = processed.replace(/(\d+\.?\d*)!/g, "factorial($1)");

    // Handle implicit multiplication: 2π, 2e, 5(, )(
    processed = processed.replace(/(\d)(π|e|Math\.PI|Math\.E)/g, "$1*$2");
    processed = processed.replace(/(\d)\(/g, "$1*(");
    processed = processed.replace(/\)(\d)/g, ")*$1");
    processed = processed.replace(/\)\(/g, ")*(");

    // Constants
    processed = processed.replace(/π/g, "Math.PI");
    processed = processed.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "Math.E");

    // Scientific notation: handle EXP or E+ notation
    // (already handled by JS parser for numbers like 1e5)

    // Trig functions with angle conversion
    const trigFns = ["sin", "cos", "tan"];
    const invTrigFns = ["asin", "acos", "atan"];
    const hypFns = ["sinh", "cosh", "tanh"];
    const invHypFns = ["asinh", "acosh", "atanh"];

    // Inverse trig (must be before regular trig replacement)
    for (const fn of invTrigFns) {
      const regex = new RegExp(`${fn}\\(`, "g");
      if (angleMode === "deg") {
        processed = processed.replace(regex, `(180/Math.PI)*Math.${fn}(`);
      } else {
        processed = processed.replace(regex, `Math.${fn}(`);
      }
    }

    // Hyperbolic inverse
    for (const fn of invHypFns) {
      const regex = new RegExp(`${fn}\\(`, "g");
      processed = processed.replace(regex, `Math.${fn}(`);
    }

    // Hyperbolic
    for (const fn of hypFns) {
      const regex = new RegExp(`${fn}\\(`, "g");
      processed = processed.replace(regex, `Math.${fn}(`);
    }

    // Regular trig
    for (const fn of trigFns) {
      const regex = new RegExp(`(?<!a)(?<!Math\\.)${fn}\\(`, "g");
      if (angleMode === "deg") {
        processed = processed.replace(regex, `Math.${fn}(Math.PI/180*`);
      } else {
        processed = processed.replace(regex, `Math.${fn}(`);
      }
    }

    // Log functions
    processed = processed.replace(/ln\(/g, "Math.log(");
    processed = processed.replace(/log\(/g, "Math.log10(");

    // Square root, cube root
    processed = processed.replace(/√\(/g, "Math.sqrt(");
    processed = processed.replace(/∛\(/g, "Math.cbrt(");
    processed = processed.replace(/√(\d+\.?\d*)/g, "Math.sqrt($1)");

    // Power
    processed = processed.replace(/\^/g, "**");

    // abs
    processed = processed.replace(/abs\(/g, "Math.abs(");

    // Ceil, floor, round
    processed = processed.replace(/ceil\(/g, "Math.ceil(");
    processed = processed.replace(/floor\(/g, "Math.floor(");
    processed = processed.replace(/round\(/g, "Math.round(");

    // EXP function (e^x)
    processed = processed.replace(/EXP\(/g, "Math.exp(");

    // 10^x
    processed = processed.replace(/10\^/g, "10**");

    // x² and x³
    processed = processed.replace(/²/g, "**2");
    processed = processed.replace(/³/g, "**3");

    // Safety check: only allow math operations
    const allowed = /^[\d\s+\-*/().,%^!eE\n\r\t]*$|Math\.|factorial/;
    // Instead of strict regex, use Function with restricted scope
    const safeEval = new Function(
      "Math",
      "factorial",
      `"use strict"; return (${processed});`,
    );

    const result = safeEval(Math, factorial);

    if (typeof result !== "number" || isNaN(result)) {
      return { error: true, value: "Error" };
    }

    if (!isFinite(result)) {
      return { error: false, value: result > 0 ? "Infinity" : "-Infinity" };
    }

    // Format result
    const formatted = formatResult(result);
    return { error: false, value: formatted };
  } catch (e) {
    return { error: true, value: "Error" };
  }
}

function formatResult(num) {
  if (Number.isInteger(num) && Math.abs(num) < 1e15) {
    return num.toString();
  }
  // Check if the number is very large or very small
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential(10).replace(/\.?0+e/, "e");
  }
  // Round to 10 decimal places to avoid floating point issues
  const rounded = parseFloat(num.toPrecision(12));
  return rounded.toString();
}
