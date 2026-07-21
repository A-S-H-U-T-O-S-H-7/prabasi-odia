"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface StateDistributionChartProps {
  data: { state: string; count: number }[];
}

const CHART_COLORS = [
  '#6B1E5B', // Royal Purple
  '#D9772B', // Saffron Orange
  '#E6A11C', // Temple Gold
  '#059669', // Emerald Green
  '#0EA5E9', // Sky Blue
  '#7C3AED', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#8A2E72', // Warm Magenta
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#E7D7E8] p-3 shadow-lg">
        <p className="text-sm font-semibold text-[#2A1636]">{payload[0].payload.state}</p>
        <p className="text-sm text-[#6B5E5A]">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
};

export default function StateDistributionChart({ data }: StateDistributionChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B5E5A]">No state data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E7D7E8" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#6B5E5A" }} />
          <YAxis 
            type="category" 
            dataKey="state" 
            tick={{ fontSize: 11, fill: "#6B5E5A" }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}