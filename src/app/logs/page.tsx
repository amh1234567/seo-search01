"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RankLog } from "@/types";

export default function LogsPage() {
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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">順位ログ一覧</h1>
        
        {loading && (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-4">
            {error}
          </div>
        )}
        
        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">ログがありません</div>
        )}
        
        {!loading && !error && logs.length > 0 && (
          <div className="bg-white rounded shadow overflow-hidden">
            <ul className="divide-y">
              {logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        🔍 {log.keywords?.keyword || "不明"} — {log.rank ? `${log.rank}位` : "圏外"}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {new Date(log.created_at).toLocaleString("ja-JP")} / {log.keywords?.site || "不明"}
                      </div>
                      {log.position_url && (
                        <div className="text-xs text-blue-600 mt-1">
                          <a href={log.position_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {log.position_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

