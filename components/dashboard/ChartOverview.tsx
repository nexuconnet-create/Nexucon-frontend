"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { getProjects, Project } from "@/services/projects";

const getProgress = (project: Project): number | null => {
  if (typeof project.progress === "number") return project.progress;
  const raw = (project as any).progress_percentage;
  return typeof raw === "number" ? raw : null;
};

// Only projects with a real recorded progress percentage are charted — the
// rest are left out rather than assigned a fabricated value.
const buildChartData = (projects: Project[]) =>
  projects
    .map((project) => ({
      name: project.name,
      progress: getProgress(project),
      status: project.status,
    }))
    .filter((item): item is { name: string; progress: number; status: string } => item.progress !== null);

const truncateLabel = (label: string, max = 12) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

export default function ChartOverview() {
  const [chartData, setChartData] = useState<{ name: string; progress: number; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => {
        if (!cancelled) setChartData(buildChartData(Array.isArray(data) ? data : []));
      })
      .catch(() => {
        if (!cancelled) setChartData([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#022C4F] h-full min-h-[400px] sm:min-h-[340px] flex flex-col shadow-sm">
      <h3 className="text-[#0F181F] font-extrabold text-sm mb-6">Design Project Progress Overview</h3>
      <div className="flex-1 w-full relative min-h-0">
        {isLoading ? (
          <div className="h-full min-h-[240px] flex items-center justify-center text-[11px] font-semibold text-gray-400 animate-pulse">
            Loading project progress…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full min-h-[240px] flex items-center justify-center text-[11px] font-medium text-gray-500 text-center px-6">
            No project progress has been recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={true}
                tick={{ fill: '#6B7280', fontSize: 8, fontWeight: 700 }}
                tickFormatter={(value: string) => truncateLabel(value)}
                interval={0}
                angle={chartData.length > 4 ? -20 : 0}
                textAnchor={chartData.length > 4 ? 'end' : 'middle'}
                height={chartData.length > 4 ? 40 : 30}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={true}
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value: number) => `${value}%`}
                width={65}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#0F181F' }}
                labelStyle={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 700 }}
                formatter={(value) => [`${value}%`, 'Progress']}
              />
              <Bar
                dataKey="progress"
                fill="#6A994E"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
