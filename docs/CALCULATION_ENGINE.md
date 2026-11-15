# Calculation engine

The scientific expression engine uses a bounded tokenizer and Pratt parser. It supports arithmetic precedence, right-associative exponentiation, unary operators, factorial, percentages, implicit multiplication, common trigonometric and hyperbolic functions, logarithms, roots, and Euler/pi constants. It does not evaluate JavaScript source. Regression tests cover arithmetic, angle modes, domain errors, malformed input, and an injection attempt.
