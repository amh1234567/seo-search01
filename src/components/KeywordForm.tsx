"use client";
import { useState } from "react";
import type { SearchResult } from "@/types";

export default function KeywordForm({ 
  onResult 
}: { 
  onResult: (r: SearchResult | null) => void 
}) {
  const [keyword, setKeyword] = useState("");
  const [site, setSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // バリデーション
  const validate = (): boolean => {
    if (!keyword.trim()) {
      setError("キーワードを入力してください");
      return false;
    }
    if (!site.trim()) {
      setError("ドメインを入力してください");
      return false;
    }
    // ドメイン形式の簡易チェック
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*\.[a-zA-Z]{2,}$/;
    if (!domainPattern.test(site.trim())) {
      setError("有効なドメイン形式を入力してください（例: example.com）");
      return false;
    }
    setError(null);
    return true;
  };

  const handleCheck = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), site: site.trim() }),
      });

      const data: SearchResult = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || `エラーが発生しました（ステータス: ${res.status}）`);
        onResult(null);
        return;
      }

      onResult(data);
    } catch (err) {
      setError("ネットワークエラーが発生しました。もう一度お試しください。");
      onResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-bold mb-3">キーワード順位チェック</h2>
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      <input
        placeholder="キーワード"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setError(null);
        }}
        className="border p-2 rounded w-full mb-2"
        disabled={loading}
      />
      <input
        placeholder="ドメイン（例: yoursite.com）"
        value={site}
        onChange={(e) => {
          setSite(e.target.value);
          setError(null);
        }}
        className="border p-2 rounded w-full mb-4"
        disabled={loading}
      />
      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "検索中..." : "順位をチェック"}
      </button>
    </div>
  );
}


