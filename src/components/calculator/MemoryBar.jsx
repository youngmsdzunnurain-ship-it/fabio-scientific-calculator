import React from "react";

const memButtons = ["MC", "MR", "M+", "M−"];

export default function MemoryBar({ onPress }) {
  return (
    <div className="flex gap-1 px-3 py-1">
      {memButtons.map((btn) => (
        <button
          key={btn}
          onClick={() => onPress(btn)}
          className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground transition-colors">
          {btn}
        </button>
      ))}
    </div>
  );
}
