/**
 * DataSourceBadge — Visual indicator for data source
 * Clearly distinguishes between DEMO mock data and LIVE Snowflake data
 */

import { Database, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DataSourceBadge({ source = "demo", className = "" }) {
  if (source === "live" || source === "snowflake") {
    return (
      <Badge 
        variant="outline" 
        className={`bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 ${className}`}
        data-testid="data-badge-live"
      >
        <Database className="h-3.5 w-3.5" />
        <span className="font-semibold">SNOWFLAKE LIVE</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 ${className}`}
      data-testid="data-badge-demo"
    >
      <FlaskConical className="h-3.5 w-3.5" />
      <span className="font-semibold">DEMO DATA</span>
    </Badge>
  );
}

/**
 * Inline text indicator for data source
 */
export function DataSourceText({ source = "demo", className = "" }) {
  if (source === "live" || source === "snowflake") {
    return (
      <span className={`text-xs text-emerald-400 ${className}`}>
        ✅ Live data from Snowflake
      </span>
    );
  }

  return (
    <span className={`text-xs text-amber-400 ${className}`}>
      🎭 Demonstration data for prototype
    </span>
  );
}
