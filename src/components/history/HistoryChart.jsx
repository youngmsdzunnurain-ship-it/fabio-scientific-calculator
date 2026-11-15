import React, { useMemo } from "react";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import moment from "moment";
import { TrendingUp } from "lucide-react";

export default function HistoryChart({ items }) {
  const { lang } = useAppContext();

  // Group by day, count calculations
  const chartData = useMemo(() => {
    if (!items.length) return [];

    const byDay = {};
    items.forEach((item) => {
      if (!item.created_date) return;
      const key = moment(item.created_date).format("MM/DD");
      byDay[key] = (byDay[key] || 0) + 1;
    });

    // Build last 7 days including days with zero
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const m = moment().subtract(i, "days");
      const key = m.format("MM/DD");
      days.push({
        day: key,
        count: byDay[key] || 0,
      });
    }
    return days;
  }, [items]);

  if (items.length === 0) return null;

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-primary" />
        <h2 className="text-sm font-heading font-semibold">
          {t("calculationHistory", lang)}
        </h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {total}{" "}
          {t("today", lang).toLowerCase() === "today" ? "this week" : ""}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(var(--popover-foreground))",
            }}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
