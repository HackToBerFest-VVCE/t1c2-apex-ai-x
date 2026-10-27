import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.ok) navigate("/dashboard");
      else setError(res.error);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">
      <img src="/login-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#0a1020]/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1020]/45 via-transparent to-[#0a1020]/60" />

      {/* corner captions */}
      <div className="absolute top-6 left-6 text-slate-200/80 text-xs sm:text-sm border-l-2 border-amber-400/70 pl-3 leading-relaxed hidden sm:block">
        Monitor<br />Predict<br />Prevent<br /><span className="text-slate-400">For a Safer Northeast</span>
      </div>
      <div className="absolute top-6 right-6 text-right text-slate-200/80 text-xs sm:text-sm border-r-2 border-amber-400/70 pr-3 hidden sm:block">
        Safer Communities<br /><span className="text-slate-400">Stronger Tomorrow</span>
      </div>
      <div className="absolute bottom-6 right-6 text-right text-slate-300/80 text-xs border-r-2 border-amber-400/70 pr-3 hidden sm:block">
        A Safer Tomorrow<br /><span className="text-slate-400">Through Smarter Monitoring</span>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
            SignalMesh AI
          </h1>
        </div>
        <div className="text-slate-200 text-sm mb-1">AI-Powered Disaster Intelligence</div>
        <div className="text-slate-400 text-xs mb-7">by Apex-AI-X</div>

        <form onSubmit={submit} className="w-full bg-white rounded-2xl shadow-2xl p-7 sm:p-8" data-testid="login-card">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 text-center">Welcome Back!</h2>
          <p className="text-slate-500 text-center mb-6">Login to continue</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 transition">
              <User className="h-5 w-5 text-slate-400" />
              <input
                data-testid="login-username-input"
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 transition">
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                data-testid="login-password-input"
                type={show ? "text" : "password"}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-slate-400 hover:text-slate-700" data-testid="login-toggle-password">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-button"
            className="mt-5 w-full rounded-xl bg-[#0e1e3a] hover:bg-[#132a52] text-white font-semibold py-3.5 transition-colors disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button type="button" onClick={() => toast.info("Password reset link would be sent to your registered email.")} className="mt-4 w-full text-center text-blue-600 font-medium hover:underline" data-testid="login-forgot">
            Forgot Password?
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">Demo access — admin / admin123</p>
        </form>

        <div className="mt-6 flex items-center gap-5 text-slate-300/80 text-xs">
          <span>People</span><span className="text-slate-500">|</span>
          <span>Environment</span><span className="text-slate-500">|</span>
          <span>Resilient Northeast</span>
        </div>
      </div>
    </div>
  );
}
