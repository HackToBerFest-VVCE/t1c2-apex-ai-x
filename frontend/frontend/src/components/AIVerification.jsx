import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ImageIcon, ScanSearch, Satellite, ShieldAlert, ArrowUp, BellRing } from "lucide-react";

const STEPS = [
  { key: "quality", label: "Image Quality Check", icon: ImageIcon },
  { key: "features", label: "Feature Detection (Cracks / Deformation)", icon: ScanSearch },
  { key: "crosscheck", label: "Cross-check with satellite & sensor data", icon: Satellite },
  { key: "impact", label: "Risk Impact Assessment", icon: ShieldAlert },
];

export default function AIVerification({ report, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current < STEPS.length) {
      const t = setTimeout(() => setCurrent((c) => c + 1), 1100);
      return () => clearTimeout(t);
    }
    if (!done) {
      const t = setTimeout(() => {
        setDone(true);
        onComplete && onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [current]); // eslint-disable-line

  return (
    <div className="glass rounded-2xl p-6" data-testid="ai-verification-panel">
      <div className="flex items-center gap-2 mb-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/15">
          {done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Loader2 className="h-5 w-5 text-blue-400 spin-slow" />}
        </div>
        <div>
          <div className="font-display text-lg font-semibold text-white">
            {done ? "Verification Result" : "AI Verification in Progress"}
          </div>
          <div className="text-xs text-slate-400">Analyzing report against environmental & sensor data</div>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const stepDone = i < current;
          const active = i === current && !done;
          return (
            <div key={s.key} className="flex items-center gap-3" data-testid={`ai-step-${s.key}`}>
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${stepDone ? "bg-emerald-500/15" : active ? "bg-blue-500/15" : "bg-slate-700/40"}`}>
                {stepDone ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : active ? <Loader2 className="h-4 w-4 text-blue-400 spin-slow" /> : <Icon className="h-4 w-4 text-slate-500" />}
              </div>
              <span className={`text-sm ${stepDone ? "text-slate-200" : active ? "text-white font-medium" : "text-slate-500"}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-6 animate-fade-up">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="font-semibold text-emerald-300">Verified</div>
              <div className="text-sm text-slate-300">Cracks detected on slope. Report matches environmental conditions.</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-400">Confidence Score</span>
              <span className="font-semibold text-white">82%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 grow-bar" style={{ width: "82%" }} />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-800/40 border border-blue-900/30 p-4">
            <div className="text-sm font-semibold text-slate-200 mb-3">Risk Update</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Previous Risk</div>
                <div className="font-semibold" style={{ color: "#FF8A00" }}>High (72/100)</div>
              </div>
              <ArrowUp className="h-5 w-5 text-red-400" />
              <div className="text-right">
                <div className="text-xs text-slate-400">Updated Risk</div>
                <div className="font-semibold" style={{ color: "#FF2020" }}>Very High (88/100)</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-200">
              <ShieldAlert className="h-4 w-4" /> Risk level increased based on verified field report.
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
              <BellRing className="h-4 w-4" /> Authorities Notified
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
