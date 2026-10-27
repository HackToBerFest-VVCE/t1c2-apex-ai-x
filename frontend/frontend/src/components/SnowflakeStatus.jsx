/**
 * SnowflakeStatus — Display Snowflake connection status
 * Shows whether backend is connected to Snowflake database
 */

import { useQuery } from "@tanstack/react-query";
import { Database, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { snowflakeAPI } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SnowflakeStatus({ compact = false }) {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['snowflake-health'],
    queryFn: snowflakeAPI.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  if (isLoading) {
    return compact ? (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Database className="h-3.5 w-3.5 animate-pulse" />
        Checking...
      </span>
    ) : null;
  }

  if (error) {
    return compact ? (
      <span className="flex items-center gap-1.5 text-xs text-red-400" title={error.message}>
        <XCircle className="h-3.5 w-3.5" />
        Backend Offline
      </span>
    ) : (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Backend server not responding.</strong> 
          {' '}Ensure backend is running on port 5000.
        </AlertDescription>
      </Alert>
    );
  }

  const { snowflake } = health;

  // Backend running, Snowflake connected
  if (snowflake.connected) {
    return compact ? (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Snowflake Connected
      </span>
    ) : (
      <Alert className="bg-emerald-500/10 border-emerald-500/30">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <AlertDescription className="text-sm text-emerald-300">
          <strong>Snowflake database connected.</strong>
          {' '}Nation-level risk data available from SIGNALMESH_AI.DISASTER_RISK schema.
        </AlertDescription>
      </Alert>
    );
  }

  // Backend running, Snowflake NOT connected (missing credentials or connection error)
  return compact ? (
    <span className="flex items-center gap-1.5 text-xs text-amber-400" title={snowflake.error}>
      <AlertCircle className="h-3.5 w-3.5" />
      Snowflake Offline
    </span>
  ) : (
    <Alert className="bg-amber-500/10 border-amber-500/30">
      <AlertCircle className="h-4 w-4 text-amber-400" />
      <AlertDescription className="text-sm text-amber-300">
        <strong>Snowflake integration disabled.</strong>
        {' '}{snowflake.configured ? 'Connection failed.' : 'Missing credentials in backend .env file.'}
        {' '}District data shown is demonstration only.
        {snowflake.error && (
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Error: {snowflake.error}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Simple connection indicator dot
 */
export function SnowflakeConnectionDot() {
  const { data: health } = useQuery({
    queryKey: ['snowflake-health'],
    queryFn: snowflakeAPI.getHealth,
    refetchInterval: 30000,
    retry: 1,
  });

  const connected = health?.snowflake?.connected;

  return (
    <span 
      className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 pulse-dot' : 'bg-amber-400'}`}
      title={connected ? 'Snowflake Connected' : 'Snowflake Offline'}
    />
  );
}
