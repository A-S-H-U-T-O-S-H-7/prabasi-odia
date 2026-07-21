"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface AgeDistributionChartProps {
  data: { name: string; value: number }[];
}

const CHART_COLORS = [
  '#6B1E5B', // Royal Purple
  '#8A2E72', // Warm Magenta
  '#D9772B', // Saffron Orange
  '#E6A11C', // Temple Gold
  '#059669', // Emerald Green
  '#0EA5E9', // Sky Blue
  '#7C3AED', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.total || 0;
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#E7D7E8] p-3 shadow-lg">
        <p className="text-sm font-semibold text-[#2A1636]">{data.name}</p>
        <p className="text-sm text-[#6B5E5A]">{data.value} users</p>
        <p className="text-xs text-[#6B5E5A]/60">{percent}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (props: any) => {
  const { name, percent } = props;
  if (percent === undefined || percent < 0.05) return null;
  const percentage = Math.round(percent * 100);
  return `${name} ${percentage}%`;
};

export default function AgeDistributionChart({ data }: AgeDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    total,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B5E5A]">No age data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="white"
                strokeWidth={2}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: '12px', color: '#6B5E5A', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}