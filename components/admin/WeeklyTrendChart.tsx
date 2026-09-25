"use client";

import { useId, useMemo, useState } from "react";
import type { WeeklyTrendPoint } from "@/types/admin";

type WeeklyTrendChartProps = {
  data: WeeklyTrendPoint[];
};

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_X = 24;
const PADDING_Y = 20;

function buildLinePath(values: number[], max: number) {
  if (values.length === 0) return "";

  const stepX = (WIDTH - PADDING_X * 2) / Math.max(1, values.length - 1);
  const usableHeight = HEIGHT - PADDING_Y * 2;

  return values
    .map((value, index) => {
      const x = PADDING_X + index * stepX;
      const ratio = max === 0 ? 0 : value / max;
      const y = HEIGHT - PADDING_Y - ratio * usableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { max, consultationsPath, followUpsPath, points } = useMemo(() => {
    const consultations = data.map((d) => d.consultations);
    const followUps = data.map((d) => d.followUps);
    const maxValue = Math.max(1, ...consultations, ...followUps);

    const stepX = (WIDTH - PADDING_X * 2) / Math.max(1, data.length - 1);
    const usableHeight = HEIGHT - PADDING_Y * 2;

    const pts = data.map((d, index) => {
      const x = PADDING_X + index * stepX;
      return {
        x,
        consultationsY:
          HEIGHT - PADDING_Y - (d.consultations / maxValue) * usableHeight,
        followUpsY: HEIGHT - PADDING_Y - (d.followUps / maxValue) * usableHeight,
      };
    });

    return {
      max: maxValue,
      consultationsPath: buildLinePath(consultations, maxValue),
      followUpsPath: buildLinePath(followUps, maxValue),
      points: pts,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No appointment activity this week yet.
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Consultations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          Follow-ups
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Weekly consultations and follow-ups trend"
      >
        <defs>
          <linearGradient id={`${gradientId}-primary`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008081" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#008081" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={HEIGHT - PADDING_Y - fraction * (HEIGHT - PADDING_Y * 2)}
            y2={HEIGHT - PADDING_Y - fraction * (HEIGHT - PADDING_Y * 2)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {consultationsPath && (
          <path
            d={`${consultationsPath} L${points[points.length - 1]?.x},${HEIGHT - PADDING_Y} L${PADDING_X},${HEIGHT - PADDING_Y} Z`}
            fill={`url(#${gradientId}-primary)`}
            stroke="none"
          />
        )}

        <path d={consultationsPath} fill="none" stroke="#008081" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={followUpsPath} fill="none" stroke="#81B641" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />

        {points.map((point, index) => (
          <g key={index}>
            <rect
              x={point.x - (WIDTH - PADDING_X * 2) / data.length / 2}
              y={0}
              width={(WIDTH - PADDING_X * 2) / data.length}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex((prev) => (prev === index ? null : prev))}
            />
            <circle cx={point.x} cy={point.consultationsY} r={3.5} fill="#008081" />
            <circle cx={point.x} cy={point.followUpsY} r={3.5} fill="#81B641" />
            {hoverIndex === index && (
              <line
                x1={point.x}
                x2={point.x}
                y1={PADDING_Y}
                y2={HEIGHT - PADDING_Y}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}
          </g>
        ))}
      </svg>

      <div className="mt-1 flex justify-between px-1 text-[11px] font-medium text-slate-400">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>

      {hovered && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
          <p className="font-bold text-slate-800">{hovered.day}</p>
          <p className="text-primary">Consultations: {hovered.consultations}</p>
          <p className="text-secondary">Follow-ups: {hovered.followUps}</p>
        </div>
      )}

      <p className="sr-only">Max value in chart: {max}</p>
    </div>
  );
}
