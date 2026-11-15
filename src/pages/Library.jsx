import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Trash2, Play, BookMarked, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const categoryColors = {
  general: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  algebra: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  trigonometry: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  calculus: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  physics: "bg-green-500/10 text-green-600 dark:text-green-400",
  finance: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  statistics: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

const categoryLabels = {
  en: {
    general: "General",
    algebra: "Algebra",
    trigonometry: "Trigonometry",
    calculus: "Calculus",
    physics: "Physics",
    finance: "Finance",
    statistics: "Statistics",
  },
  ar: {
    general: "عام",
    algebra: "الجبر",
    trigonometry: "حساب المثلثات",
    calculus: "التفاضل",
    physics: "الفيزياء",
    finance: "المالية",
    statistics: "الإحصاء",
  },
};

export default function LibraryPage() {
  const { lang } = useAppContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExpression, setNewExpression] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newNotes, setNewNotes] = useState("");

  // Check for pre-filled expression from calculator (save flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("expr");
    if (prefill) {
      setNewExpression(prefill);
      setShowAdd(true);
    }
  }, []);

  const loadFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SavedFormula.list(
        "-created_date",
        200,
      );
      setFormulas(data);
    } catch (e) {
      /* silent */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFormulas();
  }, [loadFormulas]);

  const filtered = formulas.filter(
    (f) =>
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.expression?.toLowerCase().includes(search.toLowerCase()),
  );

  function handleRecall(formula) {
    // Store the expression to recall in the calculator
    sessionStorage.setItem("recallExpression", formula.expression);
    navigate("/");
  }

  async function handleDelete(id) {
    try {
      await base44.entities.SavedFormula.delete(id);
      setFormulas((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      /* silent */
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newExpression.trim()) return;
    try {
      const created = await base44.entities.SavedFormula.create({
        title: newTitle.trim(),
        expression: newExpression.trim(),
        category: newCategory,
        notes: newNotes.trim(),
      });
      setFormulas((prev) => [created, ...prev]);
      toast({ description: t("formulaSaved", lang) });
    } catch (e) {
      /* silent */
    }
    setNewTitle("");
    setNewExpression("");
    setNewCategory("general");
    setNewNotes("");
    setShowAdd(false);
    // Clear URL param
    if (window.location.search) navigate("/library");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading font-bold flex items-center gap-2">
          <BookMarked size={20} className="text-primary" />
          {t("library", lang)}
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} />
          {t("addFormula", lang)}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchFormulas", lang)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookMarked size={40} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            {t("noFormulas", lang)}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("noFormulasDesc", lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto pb-4">
          <AnimatePresence>
            {filtered.map((formula) => (
              <motion.div
                key={formula.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card rounded-xl border border-border/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[formula.category] || categoryColors.general}`}>
                        {categoryLabels[lang]?.[formula.category] ||
                          categoryLabels.en[formula.category]}
                      </span>
                    </div>
                    <h3 className="text-sm font-heading font-semibold truncate">
                      {formula.title}
                    </h3>
                    <p
                      className="text-sm font-mono text-muted-foreground mt-1 truncate"
                      dir="ltr">
                      {formula.expression}
                    </p>
                    {formula.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                        {formula.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => handleRecall(formula)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors">
                    <Play size={12} />
                    {t("recall", lang)}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(formula.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => {
              setShowAdd(false);
              if (window.location.search) navigate("/library");
            }}>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold">
                  {t("saveFormulaTitle", lang)}
                </h2>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    if (window.location.search) navigate("/library");
                  }}
                  className="p-1 rounded-lg hover:bg-muted">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("formulaTitle", lang)}
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("formulaTitlePlaceholder", lang)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("expression", lang)}
                  </label>
                  <input
                    type="text"
                    value={newExpression}
                    onChange={(e) => setNewExpression(e.target.value)}
                    placeholder="e.g. sin(x)+cos(x)"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border-0 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("category", lang)}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.keys(categoryLabels.en).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          newCategory === cat
                            ? categoryColors[cat]
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}>
                        {categoryLabels[lang]?.[cat] || categoryLabels.en[cat]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("notes", lang)}
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder={t("notesPlaceholder", lang)}
                    rows={2}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  {t("save", lang)}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
