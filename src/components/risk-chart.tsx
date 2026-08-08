"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

type RiskChartProps = {
  data: Record<string, number>;
};

const COLORS: Record<string, string> = {
  "เร่งด่วน": "#ef4444", // red-500
  "สูง": "#f97316", // orange-500
  "ปานกลาง": "#eab308", // yellow-500
  "ต่ำ": "#22c55e", // green-500
};

export function RiskChart({ data }: RiskChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#cbd5e1"} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "14px"
            }} 
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
