import React from "react";
import CalcButton from "./CalcButton";

export default function StandardKeypad({ onPress }) {
  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      <CalcButton label="C" onClick={onPress} variant="clear" />
      <CalcButton label="CE" onClick={onPress} variant="clear" />
      <CalcButton label="%" onClick={onPress} variant="operator" />
      <CalcButton label="÷" onClick={onPress} variant="operator" />

      <CalcButton label="7" onClick={onPress} />
      <CalcButton label="8" onClick={onPress} />
      <CalcButton label="9" onClick={onPress} />
      <CalcButton label="×" onClick={onPress} variant="operator" />

      <CalcButton label="4" onClick={onPress} />
      <CalcButton label="5" onClick={onPress} />
      <CalcButton label="6" onClick={onPress} />
      <CalcButton label="−" onClick={onPress} variant="operator" />

      <CalcButton label="1" onClick={onPress} />
      <CalcButton label="2" onClick={onPress} />
      <CalcButton label="3" onClick={onPress} />
      <CalcButton label="+" onClick={onPress} variant="operator" />

      <CalcButton label="±" onClick={onPress} variant="function" />
      <CalcButton label="0" onClick={onPress} />
      <CalcButton label="." onClick={onPress} />
      <CalcButton label="=" onClick={onPress} variant="equals" />
    </div>
  );
}
