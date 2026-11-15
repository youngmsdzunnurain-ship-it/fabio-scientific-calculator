import React from "react";
import { motion } from "framer-motion";

const variants = {
  number: "bg-card hover:bg-muted text-foreground border border-border/50",
  operator: "bg-primary/10 hover:bg-primary/20 text-primary font-semibold",
  function: "bg-muted hover:bg-muted/80 text-muted-foreground text-xs",
  equals: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold",
  clear:
    "bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold",
};

export default function CalcButton({
  label,
  onClick,
  variant = "number",
  span = 1,
  className = "",
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.08 }}
      onClick={() => onClick(label)}
      className={`
        rounded-xl flex items-center justify-center transition-colors duration-150
        ${span === 2 ? "col-span-2" : ""}
        ${variants[variant] || variants.number}
        ${className}
      `}
      style={{
        minHeight: "52px",
        fontSize: variant === "function" ? "0.75rem" : "1.1rem",
      }}>
      {label}
    </motion.button>
  );
}
