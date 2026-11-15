import React, { useState } from "react";
import CalcButton from "./CalcButton";

export default function ScientificKeypad({
  onPress,
  angleMode,
  onToggleAngle,
}) {
  const [page, setPage] = useState(0);

  const sciRow1 =
    page === 0
      ? [
          {
            label: angleMode === "deg" ? "DEG" : "RAD",
            variant: "function",
            action: "toggleAngle",
          },
          { label: "sin", variant: "function" },
          { label: "cos", variant: "function" },
          { label: "tan", variant: "function" },
          { label: "π", variant: "function" },
        ]
      : [
          { label: "2nd", variant: "function", action: "toggle2nd" },
          { label: "asin", variant: "function" },
          { label: "acos", variant: "function" },
          { label: "atan", variant: "function" },
          { label: "e", variant: "function" },
        ];

  const sciRow2 =
    page === 0
      ? [
          { label: "2nd", variant: "function", action: "toggle2nd" },
          { label: "x²", variant: "function" },
          { label: "x³", variant: "function" },
          { label: "xʸ", variant: "function" },
          { label: "eˣ", variant: "function" },
        ]
      : [
          {
            label: angleMode === "deg" ? "DEG" : "RAD",
            variant: "function",
            action: "toggleAngle",
          },
          { label: "sinh", variant: "function" },
          { label: "cosh", variant: "function" },
          { label: "tanh", variant: "function" },
          { label: "10ˣ", variant: "function" },
        ];

  const sciRow3 =
    page === 0
      ? [
          { label: "(", variant: "function" },
          { label: "√", variant: "function" },
          { label: "∛", variant: "function" },
          { label: "log", variant: "function" },
          { label: "ln", variant: "function" },
        ]
      : [
          { label: ")", variant: "function" },
          { label: "x!", variant: "function" },
          { label: "1/x", variant: "function" },
          { label: "|x|", variant: "function" },
          { label: "EXP", variant: "function" },
        ];

  const handlePress = (label) => {
    if (label === "2nd") {
      setPage(page === 0 ? 1 : 0);
      return;
    }
    if (label === "DEG" || label === "RAD") {
      onToggleAngle();
      return;
    }
    onPress(label);
  };

  return (
    <div className="px-3 pt-1 pb-0">
      {[sciRow1, sciRow2, sciRow3].map((row, ri) => (
        <div key={ri} className="grid grid-cols-5 gap-1.5 mb-1.5">
          {row.map((btn) => (
            <CalcButton
              key={btn.label}
              label={btn.label}
              onClick={() => handlePress(btn.label)}
              variant={btn.variant}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
