"use client";
import { useState } from "react";
import KeywordForm from "@/components/KeywordForm";
import RankLogs from "@/components/RankLogs";
import type { SearchResult } from "@/types";

export default function HomePage() {
  const [result, setResult] = useState<SearchResult | null>(null);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Google検索順位チェックツール</h1>

        <p className="text-gray-600">
          登録したキーワードとドメインの検索順位を取得し、Supabaseに保存します。
        </p>

        <KeywordForm onResult={(r) => setResult(r)} />

        {result && !result.error && (
          <div className="bg-white p-4 rounded shadow mt-4">
            <h2 className="font-semibold mb-2">検索結果</h2>
            <p>
              順位:{" "}
              <span className="font-bold text-blue-600">
                {result.rank ? `${result.rank}位` : "圏外"}
              </span>
            </p>
            {result.positionUrl && (
              <p className="text-sm text-gray-600 mt-2">
                URL: <a href={result.positionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.positionUrl}</a>
              </p>
            )}
          </div>
        )}

        <RankLogs />
      </div>
    </main>
  );
}
