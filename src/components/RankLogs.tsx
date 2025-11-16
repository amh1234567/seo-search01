"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RankLog } from "@/types";

export default function RankLogs() {
  const [logs, setLogs] = useState<RankLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("rank_logs")
        .select("*, keywords(keyword, site)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (fetchError) {
        setError(`データの取得に失敗しました: ${fetchError.message}`);
        setLogs([]);
        return;
      }

      setLogs(data || []);
    } catch (err) {
      setError("予期しないエラーが発生しました");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">最新の順位ログ</h2>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {loading ? "更新中..." : "更新"}
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4 text-gray-500">読み込み中...</div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {!loading && !error && logs.length === 0 && (
        <div className="text-center py-4 text-gray-500">ログがありません</div>
      )}
      
      {!loading && !error && logs.length > 0 && (
        <ul className="space-y-2 text-sm">
          {logs.map((log) => (
            <li key={log.id} className="border-b pb-2">
              🔍 {log.keywords?.keyword || "不明"} — {log.rank ? `${log.rank}位` : "圏外"}
              <div className="text-gray-500 text-xs">
                {new Date(log.created_at).toLocaleString("ja-JP")} / {log.keywords?.site || "不明"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
