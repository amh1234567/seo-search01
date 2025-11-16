import { createClient } from "@supabase/supabase-js";

// 環境変数の検証
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。\n` +
      `プロジェクトルートに .env.local ファイルを作成し、以下の環境変数を設定してください：\n` +
      `${name}=your_value_here\n\n` +
      `Supabaseの設定値は、Supabaseダッシュボードの Settings > API から取得できます。`
    );
  }
  return value;
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



