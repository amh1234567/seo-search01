import { createClient } from "@supabase/supabase-js";

// Next.jsでは、NEXT_PUBLIC_プレフィックスが付いた環境変数は
// クライアントサイドでも process.env.NEXT_PUBLIC_XXX でアクセス可能
// ビルド時に置き換えられるため、実行時に process が undefined でも問題ない

// 環境変数を安全に取得（エラーをスローしない）
// process.env が undefined の場合に備えて、オプショナルチェーンを使用
const supabaseUrl = 
  (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined) || "";

const supabaseAnonKey = 
  (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) || "";

// 環境変数が設定されている場合のみクライアントを作成
// 空文字の場合はダミークライアントを作成（エラーを防ぐため）
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key");



