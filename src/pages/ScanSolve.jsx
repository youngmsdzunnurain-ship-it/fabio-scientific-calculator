import React, { useState, useRef } from "react";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function ScanSolve() {
  const { lang } = useAppContext();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  async function processImage(file) {
    setLoading(true);
    setResult(null);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);

      // Upload
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // AI solve
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a math expert. Look at this image of a mathematical expression or equation.
1. Identify the mathematical expression written in the image.
2. Solve it step by step.
3. Provide the final answer.

Be precise and accurate. If you cannot read the expression clearly, say so.
Respond in ${lang === "ar" ? "Arabic" : "English"}.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description: "The recognized mathematical expression",
            },
            result: { type: "string", description: "The final answer/result" },
            steps: { type: "string", description: "Step-by-step solution" },
            recognized: {
              type: "boolean",
              description: "Whether the expression was successfully recognized",
            },
          },
          required: ["expression", "result", "steps", "recognized"],
        },
        model: "claude_sonnet_4_6",
      });

      setResult(response);

      // Save to history
      if (response.recognized) {
        await base44.entities.CalculationHistory.create({
          expression: response.expression,
          result: response.result,
          steps: response.steps,
          calc_type: "scan",
        });
      }
    } catch (e) {
      toast({ description: t("scanError", lang), variant: "destructive" });
    }
    setLoading(false);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] px-4 pt-5">
      <h1 className="text-xl font-heading font-bold mb-1">
        {t("scanTitle", lang)}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t("scanDesc", lang)}
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/20 transition-colors">
          <Camera size={28} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {t("takePhoto", lang)}
          </span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-muted hover:bg-muted/80 border-2 border-dashed border-border transition-colors">
          <Upload size={28} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {t("uploadImage", lang)}
          </span>
        </button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
          <img
            src={previewUrl}
            alt="Scanned"
            className="w-full max-h-48 object-contain bg-muted"
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="relative">
            <Loader2 size={32} className="text-primary animate-spin" />
            <Sparkles
              size={14}
              className="text-yellow-500 absolute -top-1 -right-1 animate-pulse"
            />
          </div>
          <p className="text-sm text-muted-foreground">{t("solving", lang)}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
          {result.recognized ? (
            <>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">
                  {t("solution", lang)}
                </span>
              </div>

              <div dir="ltr">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t("expression", lang)}
                </label>
                <p className="text-base font-mono mt-1">{result.expression}</p>
              </div>

              <div dir="ltr">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t("result", lang)}
                </label>
                <p className="text-2xl font-heading font-bold text-primary mt-1">
                  {result.result}
                </p>
              </div>

              {result.steps && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {t("steps", lang)}
                  </label>
                  <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-xl p-3">
                    {result.steps}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle size={18} />
              <span className="text-sm">{t("scanError", lang)}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
