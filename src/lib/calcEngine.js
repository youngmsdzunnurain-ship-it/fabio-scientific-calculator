// Safe scientific calculator expression parser.
// Expressions are tokenized and parsed locally; no dynamic code execution is used.

const MAX_EXPRESSION_LENGTH = 512;
const MAX_TOKENS = 256;
const MAX_PARSE_DEPTH = 64;

const FUNCTIONS = Object.freeze({
  sin: (x, mode) => Math.sin(toRadians(x, mode)),
  cos: (x, mode) => Math.cos(toRadians(x, mode)),
  tan: (x, mode) => Math.tan(toRadians(x, mode)),
  asin: (x, mode) => fromRadians(Math.asin(x), mode),
  acos: (x, mode) => fromRadians(Math.acos(x), mode),
  atan: (x, mode) => fromRadians(Math.atan(x), mode),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  asinh: (x) => Math.asinh(x),
  acosh: (x) => Math.acosh(x),
  atanh: (x) => Math.atanh(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  ceil: (x) => Math.ceil(x),
  floor: (x) => Math.floor(x),
  round: (x) => Math.round(x),
  exp: (x) => Math.exp(x),
});

function toRadians(value, angleMode) {
  return angleMode === "deg" ? (value * Math.PI) / 180 : value;
}

function fromRadians(value, angleMode) {
  return angleMode === "deg" ? (value * 180) / Math.PI : value;
}

export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

function tokenize(expression) {
  if (typeof expression !== "string" || expression.length > MAX_EXPRESSION_LENGTH) {
    throw new Error("Invalid expression length");
  }

  const source = expression
    .replace(/[×]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√\s*(\d+(?:\.\d*)?|\.\d+)/g, "sqrt($1)")
    .replace(/∛\s*(\d+(?:\.\d*)?|\.\d+)/g, "cbrt($1)")
    .replace(/√(?=\s*\()/g, "sqrt")
    .replace(/∛(?=\s*\()/g, "cbrt");

  const tokens = [];
  let position = 0;

  while (position < source.length) {
    const rest = source.slice(position);
    if (/^\s+/.test(rest)) {
      position += rest.match(/^\s+/)[0].length;
      continue;
    }

    const mathConstantMatch = rest.match(/^Math\.(PI|E)\b/);
    if (mathConstantMatch) {
      tokens.push({
        type: "constant",
        value: mathConstantMatch[1] === "PI" ? Math.PI : Math.E,
      });
      position += mathConstantMatch[0].length;
    } else {
      const numberMatch = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (numberMatch) {
        const value = Number(numberMatch[0]);
        if (!Number.isFinite(value)) throw new Error("Invalid number");
        tokens.push({ type: "number", value });
        position += numberMatch[0].length;
      } else {
        const identifierMatch = rest.match(/^[a-zA-Z]+|^π/);
        if (identifierMatch) {
          const name = identifierMatch[0].toLowerCase();
          if (name === "e" || name === "π" || name === "pi") {
            tokens.push({ type: "constant", value: name === "e" ? Math.E : Math.PI });
          } else if (Object.hasOwn(FUNCTIONS, name)) {
            tokens.push({ type: "function", value: name });
          } else {
            throw new Error("Unknown function or constant");
          }
          position += identifierMatch[0].length;
        } else {
          const char = source[position];
          if ("+-*/^!%()".includes(char)) {
            tokens.push({
              type: char === "(" ? "lparen" : char === ")" ? "rparen" : "operator",
              value: char,
            });
            position += 1;
          } else {
            throw new Error("Unsupported character");
          }
        }
      }
    }

    if (tokens.length > MAX_TOKENS) throw new Error("Expression is too complex");
  }

  for (let index = 1; index < tokens.length; index += 1) {
    if (tokens[index - 1].type === "number" && tokens[index].type === "number") {
      throw new Error("Adjacent numeric literals are invalid");
    }
  }

  const expanded = [];
  const endsValue = (token) =>
    token.type === "number" ||
    token.type === "constant" ||
    token.type === "rparen" ||
    (token.type === "operator" && (token.value === "!" || token.value === "%"));
  const startsValue = (token) =>
    token.type === "number" ||
    token.type === "constant" ||
    token.type === "function" ||
    token.type === "lparen";

  for (const token of tokens) {
    const previous = expanded[expanded.length - 1];
    if (previous && endsValue(previous) && startsValue(token)) {
      expanded.push({ type: "operator", value: "*" });
    }
    expanded.push(token);
  }

  return expanded;
}

function parse(tokens, angleMode) {
  let cursor = 0;

  function peek() {
    return tokens[cursor];
  }

  function consume() {
    return tokens[cursor++];
  }

  function parseExpression(minBindingPower = 0, depth = 0) {
    if (depth > MAX_PARSE_DEPTH) throw new Error("Expression is too deeply nested");
    const token = consume();
    if (!token) throw new Error("Expected a value");

    let left;
    if (token.type === "number" || token.type === "constant") {
      left = token.value;
    } else if (token.type === "operator" && (token.value === "+" || token.value === "-")) {
      const operand = parseExpression(25, depth + 1);
      left = token.value === "-" ? -operand : operand;
    } else if (token.type === "lparen") {
      left = parseExpression(0, depth + 1);
      if (peek()?.type !== "rparen") throw new Error("Missing closing parenthesis");
      consume();
    } else if (token.type === "function") {
      if (peek()?.type !== "lparen") throw new Error("Function requires parentheses");
      consume();
      const argument = parseExpression(0, depth + 1);
      if (peek()?.type !== "rparen") throw new Error("Missing function parenthesis");
      consume();
      left = FUNCTIONS[token.value](argument, angleMode);
    } else {
      throw new Error("Expected a value");
    }

    while (cursor < tokens.length) {
      const next = peek();
      if (!next || next.type === "rparen" || next.type !== "operator") break;

      if (next.value === "!" || next.value === "%") {
        const bindingPower = 40;
        if (bindingPower < minBindingPower) break;
        consume();
        left = next.value === "!" ? factorial(left) : left / 100;
        continue;
      }

      const bindingPowers = {
        "+": [10, 11],
        "-": [10, 11],
        "*": [20, 21],
        "/": [20, 21],
        "^": [30, 30],
      };
      const powers = bindingPowers[next.value];
      if (!powers || powers[0] < minBindingPower) break;
      consume();
      const right = parseExpression(powers[1], depth + 1);

      switch (next.value) {
        case "+": left += right; break;
        case "-": left -= right; break;
        case "*": left *= right; break;
        case "/": left /= right; break;
        case "^": left = left ** right; break;
        default: throw new Error("Unsupported operator");
      }
    }

    return left;
  }

  const result = parseExpression();
  if (cursor !== tokens.length) throw new Error("Unexpected token");
  return result;
}

function formatResult(value) {
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-10 && value !== 0)) {
    return value.toExponential(10).replace(/\.?0+e/, "e");
  }
  return Number(value.toPrecision(12)).toString();
}

export function evaluate(expression, angleMode = "deg") {
  try {
    if (!["deg", "rad"].includes(angleMode)) throw new Error("Invalid angle mode");
    const tokens = tokenize(expression);
    if (tokens.length === 0) throw new Error("Empty expression");
    const result = parse(tokens, angleMode);

    if (typeof result !== "number" || Number.isNaN(result)) {
      return { error: true, value: "Error" };
    }
    if (!Number.isFinite(result)) {
      return { error: false, value: result > 0 ? "Infinity" : "-Infinity" };
    }
    return { error: false, value: formatResult(result) };
  } catch {
    return { error: true, value: "Error" };
  }
}
