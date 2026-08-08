"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const data = [
  { name: "ม.ค.", total: 12 },
  { name: "ก.พ.", total: 19 },
  { name: "มี.ค.", total: 15 },
  { name: "เม.ย.", total: 22 },
  { name: "พ.ค.", total: 28 },
  { name: "มิ.ย.", total: 24 },
  { name: "ก.ค.", total: 35 },
];

export function OverviewChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--ci-blue, #2563eb)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--ci-blue, #2563eb)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "14px"
            }} 
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--ci-blue, #2563eb)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
            activeDot={{ r: 6, fill: "var(--ci-blue, #2563eb)", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
