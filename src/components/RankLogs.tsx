"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RankLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("rank_logs")
      .select("*, keywords(keyword, site)")
      .order("created_at", { ascending: false })
      .limit(10);
    setLogs(data || []);
  }

  return (
    <div className="mt-6">
      <h2 className="font-bold mb-3 text-lg">最新の順位ログ</h2>
      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="border-b pb-2">
            🔍 {log.keywords.keyword} — {log.rank ? `${log.rank}位` : "圏外"}
            <div className="text-gray-500 text-xs">
              {new Date(log.created_at).toLocaleString()} / {log.keywords.site}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
