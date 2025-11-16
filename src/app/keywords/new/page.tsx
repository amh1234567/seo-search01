"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewKeywordPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("keywords")
        .insert({ keyword: keyword.trim(), site: site.trim() })
        .select()
        .single();

      if (insertError) {
        setError(`キーワードの登録に失敗しました: ${insertError.message}`);
        return;
      }

      // 成功したら一覧ページにリダイレクト
      router.push("/keywords");
    } catch (err) {
      setError("予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/keywords"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← キーワード一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold">キーワード追加</h1>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                キーワード
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="例: Next.js"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setError(null);
                }}
                className="border p-2 rounded w-full"
                disabled={loading}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-2">
                ドメイン
              </label>
              <input
                id="site"
                type="text"
                placeholder="例: example.com"
                value={site}
                onChange={(e) => {
                  setSite(e.target.value);
                  setError(null);
                }}
                className="border p-2 rounded w-full"
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "登録中..." : "登録"}
              </button>
              <Link
                href="/keywords"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
