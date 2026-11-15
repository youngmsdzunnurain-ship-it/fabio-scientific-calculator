import React from "react";
import { motion } from "framer-motion";

export default function CalcDisplay({
  expression,
  result,
  memory,
  angleMode,
  lang,
}) {
  const hasResult = result !== null && result !== undefined;

  return (
    <div className="relative px-4 pt-4 pb-3 min-h-[140px] flex flex-col justify-end">
      {/* Top indicators */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-2">
        <span className="px-2 py-0.5 rounded bg-muted font-semibold tracking-wider">
          {angleMode === "deg" ? "DEG" : "RAD"}
        </span>
        {memory !== 0 && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
            M
          </span>
        )}
      </div>

      {/* Expression */}
      <div
        className="text-right text-muted-foreground font-light overflow-x-auto scrollbar-hide whitespace-nowrap"
        dir="ltr"
        style={{ fontSize: expression.length > 25 ? "0.875rem" : "1.1rem" }}>
        {expression || "0"}
      </div>

      {/* Result */}
      <motion.div
        key={result}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="text-right font-heading font-bold overflow-x-auto scrollbar-hide whitespace-nowrap mt-1"
        dir="ltr"
        style={{
          fontSize: hasResult
            ? String(result).length > 15
              ? "1.5rem"
              : "2.25rem"
            : "2.25rem",
          color: hasResult ? "hsl(var(--foreground))" : "transparent",
        }}>
        {hasResult ? result : "0"}
      </motion.div>
    </div>
  );
}
