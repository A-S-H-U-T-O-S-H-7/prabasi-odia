"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface GrowthChartProps {
  data: { date: string; count: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#E7D7E8] p-3 shadow-lg">
        <p className="text-sm font-semibold text-[#2A1636]">
          {new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-sm text-[#6B5E5A]">{payload[0].value} total users</p>
      </div>
    );
  }
  return null;
};

export default function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-[#6B5E5A]">No growth data available</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="w-full h-48"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B1E5B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6B1E5B" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7D7E8" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: "#6B5E5A" }}
            interval={Math.floor(data.length / 10)}
          />
          <YAxis tick={{ fontSize: 10, fill: "#6B5E5A" }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6B1E5B"
            strokeWidth={2}
            fill="url(#colorCount)"
            className="transition-all duration-300"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}