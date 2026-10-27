import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { RISK } from "@/lib/risk";

export default function DonutChart({ data, total }) {
  return (
    <div className="relative h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={104}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive
          >
            {data.map((d) => (
              <Cell key={d.name} fill={RISK[d.name]?.color || "#42D321"} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="font-display text-4xl font-extrabold text-white">{total}</div>
        <div className="text-xs text-slate-400 mt-1">Total Areas</div>
      </div>
    </div>
  );
}
