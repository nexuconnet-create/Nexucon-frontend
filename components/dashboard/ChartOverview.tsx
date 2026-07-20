"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { progress: 10, pink: 3, purple: 4 },
  { progress: 20, pink: 2, purple: 3 },
  { progress: 30, pink: 1, purple: 2 },
  { progress: 40, pink: 4, purple: 3 },
  { progress: 50, pink: 3, purple: 1 },
  { progress: 60, pink: 2, purple: 2 },
  { progress: 70, pink: 4, purple: 4 },
  { progress: 80, pink: 3, purple: 2 },
  { progress: 90, pink: 2, purple: 1 },
  { progress: 100, pink: 3, purple: 2 },
];

const yAxisLabels = [
  "0",
  "Green Valley\nApartments",
  "Victoria Heights\nEstate",
  "Lekki Commercial\nPlaza",
  "National Road Project"
];

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const label = yAxisLabels[payload.value] || "";
  const lines = label.split("\n");

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text 
          key={index}
          x={0} 
          y={index === 0 && lines.length > 1 ? -6 : (index * 12)} 
          dy={4} 
          textAnchor="end" 
          fill="#6B7280" 
          fontSize={8}
          fontWeight={700}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export default function ChartOverview() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#022C4F] h-full min-h-[400px] sm:min-h-[340px] flex flex-col shadow-sm">
      <h3 className="text-[#0F181F] font-extrabold text-sm mb-6">Design Project Progress Overview</h3>
      <div className="flex-1 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
            <XAxis 
              dataKey="progress" 
              axisLine={{ stroke: '#9CA3AF' }}
              tickLine={true}
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={[0, 4]} 
              ticks={[0, 1, 2, 3, 4]} 
              axisLine={{ stroke: '#9CA3AF' }}
              tickLine={true}
              tick={<CustomYAxisTick />}
              width={65}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}
              formatter={(value, name) => [yAxisLabels[value as number]?.replace('\n', ' '), name === 'pink' ? 'Line 1' : 'Line 2']}
              labelFormatter={(label) => `Progress: ${label}%`}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line 
              name="Structural Design"
              type="monotone" 
              dataKey="pink" 
              stroke="#D946EF" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "white", stroke: "#D946EF", strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              name="Architectural Design"
              type="monotone" 
              dataKey="purple" 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "white", stroke: "#8B5CF6", strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
