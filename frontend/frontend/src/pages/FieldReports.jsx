import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Upload, X, CheckCircle2, ArrowRight } from "lucide-react";
import AIVerification from "@/components/AIVerification";
import { LOCATIONS } from "@/data/locations";
import { OBSERVATION_TYPES } from "@/data/reports";
import { useApp } from "@/context/AppContext";

export default function FieldReports() {
  const { addReport, updateReport } = useApp();
  const [location, setLocation] = useState("Dima Hasao, Assam");
  const [obsType, setObsType] = useState(OBSERVATION_TYPES[0]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [stage, setStage] = useState("form"); // form | verifying | done
  const [report, setReport] = useState(null);

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImages((p) => [...p, ...previews].slice(0, 6));
  };
  const removeImage = (i) => setImages((p) => p.filter((_, idx) => idx !== i));

  const submit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please add a description of the observation.");
      return;
    }
    const loc = LOCATIONS.find((l) => `${l.name}, ${l.state}` === location);
    const r = addReport({
      locationId: loc?.id || "dima-hasao",
      location,
      observation: obsType,
      description,
      submittedBy: "S. Sharma",
      date: "03 May 2025",
      photos: images.length,
    });
    setReport(r);
    setStage("verifying");
    toast.success(`Report submitted — ${r.id}`);
  };

  const onVerified = () => {
    if (report) updateReport(report.id, { aiStatus: "Verified", confidence: 82, riskImpact: "High → Very High", status: "Verified" });
    setStage("done");
  };

  const reset = () => {
    setStage("form"); setReport(null); setDescription(""); setImages([]);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
      {stage === "form" && (
        <form onSubmit={submit} className="glass rounded-2xl p-6 sm:p-8 animate-fade-up" data-testid="field-report-form">
          <h2 className="font-display text-2xl font-bold text-white mb-1">Report Unusual Activity</h2>
          <p className="text-slate-400 text-sm mb-6">Citizens and officers can report any unusual signs. Every report helps save lives.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Location</label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 py-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <select value={location} onChange={(e) => setLocation(e.target.value)} data-testid="field-report-location"
                  className="flex-1 bg-transparent outline-none text-white text-sm">
                  {LOCATIONS.map((l) => <option key={l.id} className="bg-slate-900" value={`${l.name}, ${l.state}`}>{`${l.name}, ${l.state}`}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Observation Type</label>
              <select value={obsType} onChange={(e) => setObsType(e.target.value)} data-testid="field-report-obstype"
                className="w-full glass rounded-xl px-4 py-3 bg-transparent outline-none text-white text-sm">
                {OBSERVATION_TYPES.map((t) => <option key={t} className="bg-slate-900" value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} data-testid="field-report-description"
                placeholder="Describe what you observed..." className="w-full glass rounded-xl px-4 py-3 bg-transparent outline-none text-white text-sm resize-none placeholder:text-slate-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Photos</label>
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5" data-testid={`field-report-remove-image-${i}`}>
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-20 rounded-xl border-2 border-dashed border-blue-900/50 grid place-items-center cursor-pointer hover:border-blue-500/60 transition" data-testid="field-report-upload">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" data-testid="field-report-submit-btn"
            className="mt-7 w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 transition flex items-center justify-center gap-2">
            Submit Report <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {stage !== "form" && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6 animate-fade-up" data-testid="report-submitted-card">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <div>
                <div className="font-display text-lg font-semibold text-white">Report Submitted</div>
                <div className="text-sm text-slate-400">Report ID: <span className="font-mono text-blue-300">#{report?.id}</span></div>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full text-xs bg-blue-500/15 text-blue-300">Submitted</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 text-sm">
              <div><div className="text-slate-400">Location</div><div className="text-white font-medium">{report?.location}</div></div>
              <div><div className="text-slate-400">Observation</div><div className="text-white font-medium">{report?.observation}</div></div>
              <div><div className="text-slate-400">Photos</div><div className="text-white font-medium">{report?.photos || 0}</div></div>
            </div>
          </div>

          <AIVerification report={report} onComplete={onVerified} />

          {stage === "done" && (
            <button onClick={reset} data-testid="field-report-new-btn"
              className="w-full rounded-xl glass text-white font-semibold py-3.5 hover:bg-white/5 transition">
              Submit Another Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
