import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  Search,
  Trash2,
  Copy,
  Star,
  StarOff,
  Clock,
  Check,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import HistoryChart from "@/components/history/HistoryChart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { lang } = useAppContext();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await base44.entities.CalculationHistory.list(
        "-created_date",
        200,
      );
      setItems(data);
    } catch (e) {
      /* silent */
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "favorites") {
      list = list.filter((i) => i.is_favorite);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.expression?.toLowerCase().includes(q) ||
          i.result?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, tab, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((item) => {
      const date = moment(item.created_date).format("YYYY-MM-DD");
      const today = moment().format("YYYY-MM-DD");
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
      let label = moment(item.created_date).format("MMM D, YYYY");
      if (date === today) label = t("today", lang);
      else if (date === yesterday) label = t("yesterday", lang);
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [filtered, lang]);

  async function handleDelete(id) {
    try {
      await base44.entities.CalculationHistory.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ description: t("deleted", lang) });
    } catch (e) {
      /* silent */
    }
  }

  async function handleToggleFav(item) {
    const newVal = !item.is_favorite;
    try {
      await base44.entities.CalculationHistory.update(item.id, {
        is_favorite: newVal,
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_favorite: newVal } : i)),
      );
      toast({ description: t(newVal ? "favorited" : "unfavorited", lang) });
    } catch (e) {
      /* silent */
    }
  }

  function handleCopy(item) {
    navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleClearAll() {
    try {
      await base44.entities.CalculationHistory.deleteMany({});
      setItems([]);
      toast({ description: t("deleted", lang) });
    } catch (e) {
      /* silent */
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-heading font-bold">
            {t("calculationHistory", lang)}
          </h1>
          {items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-xs text-destructive hover:underline font-medium">
                  {t("clearAll", lang)}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("clearAllConfirm", lang)}
                  </AlertDialogTitle>
                  <AlertDialogDescription />
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel", lang)}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>
                    {t("confirm", lang)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchHistory", lang)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["all", "favorites"].map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {t(key, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <HistoryChart items={items} />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {search ? t("noResults", lang) : t("noHistory", lang)}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                {t("noHistoryDesc", lang)}
              </p>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, groupItems]) => (
            <div key={dateLabel} className="mb-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {dateLabel}
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {groupItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-card rounded-xl border border-border/50 p-3">
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() =>
                          setExpandedId(expandedId === item.id ? null : item.id)
                        }>
                        <div className="flex-1 min-w-0" dir="ltr">
                          <p className="text-xs text-muted-foreground truncate">
                            {item.expression}
                          </p>
                          <p className="text-lg font-heading font-bold mt-0.5">
                            = {item.result}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 ml-2 shrink-0">
                          {item.is_favorite && (
                            <Star
                              size={12}
                              className="text-yellow-500 fill-yellow-500"
                            />
                          )}
                          {item.steps && (
                            <ChevronDown
                              size={14}
                              className={`text-muted-foreground transition-transform ${expandedId === item.id ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Steps (for scan results) */}
                      {expandedId === item.id && item.steps && (
                        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground whitespace-pre-wrap">
                          {item.steps}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                        <button
                          onClick={() => handleCopy(item)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          {copiedId === item.id ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} className="text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleFav(item)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          {item.is_favorite ? (
                            <Star
                              size={14}
                              className="text-yellow-500 fill-yellow-500"
                            />
                          ) : (
                            <StarOff
                              size={14}
                              className="text-muted-foreground"
                            />
                          )}
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 size={14} className="text-muted-foreground" />
                        </button>
                        <span className="text-[10px] text-muted-foreground/50">
                          {moment(item.created_date).format("h:mm A")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
