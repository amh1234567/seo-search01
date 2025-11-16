"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Keyword } from "@/types";

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeywords();
  }, []);

  async function fetchKeywords() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("keywords")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(`データの取得に失敗しました: ${fetchError.message}`);
        setKeywords([]);
        return;
      }

      setKeywords(data || []);
    } catch (err) {
      setError("予期しないエラーが発生しました");
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">キーワード一覧</h1>
          <Link
            href="/keywords/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            新規追加
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && keywords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>キーワードが登録されていません</p>
            <Link
              href="/keywords/new"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              最初のキーワードを追加する
            </Link>
          </div>
        )}

        {!loading && !error && keywords.length > 0 && (
          <div className="bg-white rounded shadow overflow-hidden">
            <ul className="divide-y">
              {keywords.map((keyword) => (
                <li key={keyword.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">
                        {keyword.keyword}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {keyword.site}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        登録日: {new Date(keyword.created_at).toLocaleString("ja-JP")}
                      </div>
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
