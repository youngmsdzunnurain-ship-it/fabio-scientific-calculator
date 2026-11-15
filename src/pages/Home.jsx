import React, { useState, useCallback, useEffect } from "react";
import { useAppContext } from "@/lib/AppContext";
import { evaluate } from "@/lib/calcEngine";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import CalcDisplay from "@/components/calculator/CalcDisplay";
import StandardKeypad from "@/components/calculator/StandardKeypad";
import ScientificKeypad from "@/components/calculator/ScientificKeypad";
import MemoryBar from "@/components/calculator/MemoryBar";
import { ChevronUp, ChevronDown, Copy, Check, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoiceInput from "@/components/calculator/VoiceInput";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { lang, angleMode, savePreferences } = useAppContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [memory, setMemory] = useState(0);
  const [showScientific, setShowScientific] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = result || expression || "0";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result, expression]);

  const saveToHistory = useCallback(
    async (expr, res) => {
      try {
        await base44.entities.CalculationHistory.create({
          expression: expr,
          result: res,
          calc_type: showScientific ? "scientific" : "standard",
        });
      } catch (e) {
        /* silent */
      }
    },
    [showScientific],
  );

  const handlePress = useCallback(
    (label) => {
      // If just evaluated and user presses a number, start fresh
      if (justEvaluated && /^[\d.]$/.test(label)) {
        setExpression(label);
        setResult(null);
        setJustEvaluated(false);
        return;
      }
      if (justEvaluated && /^[+\-×÷%]$/.test(label)) {
        // Continue with result
        setExpression(String(result) + label);
        setResult(null);
        setJustEvaluated(false);
        return;
      }
      setJustEvaluated(false);

      switch (label) {
        case "C":
          setExpression("");
          setResult(null);
          break;
        case "CE":
          setExpression((prev) => prev.slice(0, -1));
          break;
        case "=": {
          if (!expression) return;
          const res = evaluate(expression, angleMode);
          setResult(res.value);
          if (!res.error) {
            saveToHistory(expression, res.value);
          }
          setJustEvaluated(true);
          break;
        }
        case "±": {
          if (result !== null) {
            const num = parseFloat(result);
            if (!isNaN(num)) {
              setResult(String(-num));
            }
          } else if (expression) {
            if (expression.startsWith("-")) {
              setExpression(expression.slice(1));
            } else {
              setExpression("-" + expression);
            }
          }
          break;
        }
        // Scientific functions
        case "x²":
          setExpression((prev) => prev + "²");
          break;
        case "x³":
          setExpression((prev) => prev + "³");
          break;
        case "xʸ":
          setExpression((prev) => prev + "^");
          break;
        case "√":
          setExpression((prev) => prev + "√(");
          break;
        case "∛":
          setExpression((prev) => prev + "∛(");
          break;
        case "x!":
          setExpression((prev) => prev + "!");
          break;
        case "1/x": {
          if (expression) {
            setExpression("1/(" + expression + ")");
          }
          break;
        }
        case "|x|":
          setExpression((prev) => prev + "abs(");
          break;
        case "eˣ":
          setExpression((prev) => prev + "EXP(");
          break;
        case "10ˣ":
          setExpression((prev) => prev + "10^");
          break;
        case "sin":
        case "cos":
        case "tan":
        case "asin":
        case "acos":
        case "atan":
        case "sinh":
        case "cosh":
        case "tanh":
        case "log":
        case "ln":
        case "EXP":
          setExpression((prev) => prev + label + "(");
          break;
        default:
          setExpression((prev) => prev + label);
      }
    },
    [expression, result, angleMode, justEvaluated, saveToHistory],
  );

  const handleMemory = useCallback(
    (action) => {
      const current =
        result !== null ? parseFloat(result) : parseFloat(expression) || 0;
      switch (action) {
        case "MC":
          setMemory(0);
          break;
        case "MR":
          if (memory !== 0) {
            setExpression(String(memory));
            setResult(null);
          }
          break;
        case "M+":
          setMemory((prev) => prev + current);
          break;
        case "M−":
          setMemory((prev) => prev - current);
          break;
      }
    },
    [result, expression, memory],
  );

  const toggleAngle = useCallback(() => {
    const newMode = angleMode === "deg" ? "rad" : "deg";
    savePreferences({ angle_mode: newMode });
  }, [angleMode, savePreferences]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key;

      // Skip if user is typing in an input/textarea (e.g. search on other pages)
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Digits and decimal
      if (/^[0-9.]$/.test(key)) {
        handlePress(key);
        e.preventDefault();
        return;
      }
      // Operators
      const opMap = { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" };
      if (opMap[key]) {
        handlePress(opMap[key]);
        e.preventDefault();
        return;
      }
      // Enter or = → evaluate
      if (key === "Enter" || key === "=") {
        handlePress("=");
        e.preventDefault();
        return;
      }
      // Backspace → CE
      if (key === "Backspace") {
        handlePress("CE");
        e.preventDefault();
        return;
      }
      // Escape → Clear
      if (key === "Escape") {
        handlePress("C");
        e.preventDefault();
        return;
      }
      // Brackets
      if (key === "(" || key === ")") {
        handlePress(key);
        e.preventDefault();
        return;
      }
      // ^ for power
      if (key === "^") {
        handlePress("xʸ");
        e.preventDefault();
        return;
      }
      // ! for factorial
      if (key === "!") {
        handlePress("x!");
        e.preventDefault();
        return;
      }
      // 'r' for square root
      if (key === "r" || key === "R") {
        handlePress("√");
        e.preventDefault();
        return;
      }
      // 'p' for pi
      if (key === "p" || key === "P") {
        handlePress("π");
        e.preventDefault();
        return;
      }
      // 'e' for euler's number
      if (key === "e" || key === "E") {
        handlePress("e");
        e.preventDefault();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePress]);

  // Recall expression from library
  useEffect(() => {
    const recalled = sessionStorage.getItem("recallExpression");
    if (recalled) {
      setExpression(recalled);
      setResult(null);
      sessionStorage.removeItem("recallExpression");
    }
  }, []);

  const handleSaveToLibrary = useCallback(() => {
    if (!expression) return;
    navigate(`/library?expr=${encodeURIComponent(expression)}`);
  }, [expression, navigate]);

  const handleVoiceResult = useCallback((parsed) => {
    setExpression(parsed);
    setResult(null);
    setJustEvaluated(false);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <h1 className="text-sm font-heading font-bold text-foreground tracking-tight">
          {t("appName", lang)}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveToLibrary}
            disabled={!expression}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            title={t("saveFormula", lang)}>
            <Bookmark size={16} className="text-muted-foreground" />
          </button>
          <VoiceInput onResult={handleVoiceResult} lang={lang} />
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-muted transition-colors">
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Display */}
      <CalcDisplay
        expression={expression}
        result={result}
        memory={memory}
        angleMode={angleMode}
        lang={lang}
      />

      {/* Scientific toggle */}
      <button
        onClick={() => setShowScientific(!showScientific)}
        className="flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {showScientific ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span>{t(showScientific ? "standard" : "scientific", lang)}</span>
      </button>

      {/* Scientific Keypad */}
      <AnimatePresence>
        {showScientific && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <ScientificKeypad
              onPress={handlePress}
              angleMode={angleMode}
              onToggleAngle={toggleAngle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Bar */}
      <MemoryBar onPress={handleMemory} />

      {/* Standard Keypad */}
      <div className="flex-1 flex flex-col justify-end">
        <StandardKeypad onPress={handlePress} />
      </div>
    </div>
  );
}
