"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface CountryDistributionChartProps {
  data: { country: string; count: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#E7D7E8] p-3 shadow-lg">
        <p className="text-sm font-semibold text-[#2A1636]">{payload[0].payload.country}</p>
        <p className="text-sm text-[#6B5E5A]">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
};

export default function CountryDistributionChart({ data }: CountryDistributionChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: ["#6B1E5B", "#8A2E72", "#D9772B", "#E6A11C", "#34D399", "#059669", "#0EA5E9", "#7C3AED", "#EC4899", "#14B8A6"][index % 10],
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B5E5A]">No country data available</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7D7E8" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#6B5E5A" }} />
          <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: "#6B5E5A" }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`country-cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
