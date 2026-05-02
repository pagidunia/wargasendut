'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface IuranRadialChartProps {
  terbayar: number;
  tertunggak: number;
  total: number;
}

export default function IuranRadialChart({ terbayar, tertunggak, total }: IuranRadialChartProps) {
  const data = [
    {
      name: 'Sudah Bayar',
      value: terbayar,
      percentage: Math.round((terbayar / total) * 100),
      fill: '#059669',
    },
    {
      name: 'Belum Bayar',
      value: tertunggak,
      percentage: Math.round((tertunggak / total) * 100),
      fill: '#dc2626',
    },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, total]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            label={{ position: 'insideStart', fill: '#fff' }}
            angleAxisId={0}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry) => `${value}: ${entry.payload.percentage}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'value') {
                const entry = data.find(d => d.value === value);
                return [`${value} KK (${entry?.percentage}%)`, 'Status'];
              }
              return [value, name];
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
