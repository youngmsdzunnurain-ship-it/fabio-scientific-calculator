import React, { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Number/operator word maps for spoken math
const wordToSymbol = {
  // Numbers
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
  sixty: "60",
  seventy: "70",
  eighty: "80",
  ninety: "90",
  hundred: "100",
  thousand: "1000",
  // Arabic numbers
  صفر: "0",
  واحد: "1",
  اثنان: "2",
  ثلاثة: "3",
  أربعة: "4",
  خمسة: "5",
  ستة: "6",
  سبعة: "7",
  ثمانية: "8",
  تسعة: "9",
  عشرة: "10",
  // Operators
  plus: "+",
  add: "+",
  minus: "−",
  subtract: "−",
  times: "×",
  multiply: "×",
  divided: "÷",
  divide: "÷",
  "divided by": "÷",
  over: "÷",
  percent: "%",
  percentage: "%",
  mod: "%",
  // Arabic operators
  زائد: "+",
  ناقص: "−",
  ضرب: "×",
  قسمة: "÷",
  في: "×",
  // Functions
  sine: "sin(",
  cosine: "cos(",
  tangent: "tan(",
  sin: "sin(",
  cos: "cos(",
  tan: "tan(",
  logarithm: "log(",
  log: "log(",
  "natural log": "ln(",
  ln: "ln(",
  "square root": "√(",
  root: "√(",
  "cube root": "∛(",
  factorial: "!",
  power: "^",
  "to the power": "^",
  squared: "²",
  cubed: "³",
  "open bracket": "(",
  "close bracket": ")",
  "left paren": "(",
  "right paren": ")",
  pi: "π",
  e: "e",
  // Arabic functions
  جتا: "cos(",
  جا: "sin(",
  ظا: "tan(",
  جذر: "√(",
  مضروب: "!",
  أس: "^",
  باي: "π",
  قوس: "(",
};

function parseSpokenMath(text) {
  let result = text.toLowerCase().trim();
  // Replace multi-word phrases first
  const multiWord = [
    "divided by",
    "natural log",
    "square root",
    "cube root",
    "open bracket",
    "close bracket",
    "left paren",
    "right paren",
    "to the power",
  ];
  multiWord.forEach((phrase) => {
    if (wordToSymbol[phrase]) {
      result = result.replace(new RegExp(phrase, "g"), wordToSymbol[phrase]);
    }
  });
  // Replace single words
  const words = result.split(/\s+/);
  const parsed = words.map((word) => {
    const clean = word.replace(/[.,!?;]/g, "");
    return wordToSymbol[clean] || word;
  });
  return parsed.join("");
}

export default function VoiceInput({ onResult, lang }) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === "ar" ? "ar-SA" : "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "no-speech" ? "No speech detected" : event.error,
      );
      setListening(false);
      setProcessing(false);
    };

    recognition.onend = () => {
      setListening(false);
      setProcessing(true);
      setTimeout(() => {
        setTranscript((finalText) => {
          if (finalText) {
            const parsed = parseSpokenMath(finalText);
            if (parsed) {
              onResult(parsed);
            }
          }
          setProcessing(false);
          return finalText;
        });
      }, 200);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [lang, onResult]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError("");
    setTranscript("");

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setError("Could not start voice input");
      }
    }
  }, [listening]);

  const closeOverlay = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
    setProcessing(false);
    setTranscript("");
    setError("");
  }, [listening]);

  if (!supported) return null;

  return (
    <>
      <button
        onClick={toggleListening}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        title="Voice input">
        <Mic size={16} className="text-muted-foreground" />
      </button>

      <AnimatePresence>
        {(listening || processing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeOverlay}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeOverlay}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>

              {listening ? (
                <>
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Mic size={32} className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-2">
                    {lang === "ar" ? "جاري الاستماع..." : "Listening..."}
                  </p>
                  {transcript && (
                    <p
                      className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-xl"
                      dir="ltr">
                      {transcript}
                    </p>
                  )}
                  <button
                    onClick={() => recognitionRef.current?.stop()}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    {lang === "ar" ? "إيقاف" : "Stop"}
                  </button>
                </>
              ) : (
                <>
                  <Loader2
                    size={32}
                    className="mx-auto text-primary animate-spin mb-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "جاري المعالجة..." : "Processing..."}
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
