// APIレスポンスの型定義
export interface SearchResult {
  message?: string;
  rank?: number | null;
  positionUrl?: string | null;
  keyword_id?: number;
  error?: string;
  details?: string;
}

// キーワードの型定義
export interface Keyword {
  id: number;
  keyword: string;
  site: string;
  created_at: string;
}

// 順位ログの型定義
export interface RankLog {
  id: number;
  keyword_id: number;
  rank: number | null;
  position_url: string | null;
  created_at: string;
  keywords: Keyword;
}

// SerpApiの検索結果の型定義
export interface SerpApiResult {
  organic_results?: Array<{
    position: number;
    link: string;
    title: string;
    snippet: string;
  }>;
  error?: string;
}

// キーワード作成用の型
export interface KeywordInput {
  keyword: string;
  site: string;
}

