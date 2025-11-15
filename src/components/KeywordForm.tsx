"use client";
import { useState } from "react";

export default function KeywordForm({ onResult }: { onResult: (r: any) => void }) {
  const [keyword, setKeyword] = useState("");
  const [site, setSite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, site }),
    });
    const data = await res.json();
    onResult(data);
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-bold mb-3">キーワード順位チェック</h2>
      <input
        placeholder="キーワード"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        placeholder="ドメイン（例: yoursite.com）"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded w-full"
      >
        {loading ? "検索中..." : "順位をチェック"}
      </button>
    </div>
  );
}


