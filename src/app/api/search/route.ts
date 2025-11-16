import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SerpApiResult } from "@/types";

// ドメインを正規化して比較する関数
function normalizeDomain(domain: string): string {
  return domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// ドメインマッチングを改善（部分一致ではなく、正確なドメインマッチ）
function matchesDomain(url: string, targetDomain: string): boolean {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const normalizedTarget = normalizeDomain(targetDomain);
    const urlDomain = normalizeDomain(urlObj.hostname);
    
    // 完全一致またはサブドメインの場合
    return urlDomain === normalizedTarget || urlDomain.endsWith(`.${normalizedTarget}`);
  } catch {
    // URL解析に失敗した場合は、includesでフォールバック
    const normalizedUrl = normalizeDomain(url);
    const normalizedTarget = normalizeDomain(targetDomain);
    return normalizedUrl.includes(normalizedTarget);
  }
}

export async function POST(req: Request) {
  try {
    // リクエストBodyの取得
    const { keyword_id, keyword, site } = await req.json();

    if (!keyword || !site) {
      return NextResponse.json(
        { error: "keyword, site は必須です。" },
        { status: 400 }
      );
    }

    // keyword_idがない場合は、keywordとsiteからキーワードを検索または作成
    let finalKeywordId = keyword_id;
    if (!finalKeywordId) {
      // 既存のキーワードを検索
      const { data: existingKeyword, error: searchError } = await supabase
        .from("keywords")
        .select("id")
        .eq("keyword", keyword.trim())
        .eq("site", site.trim())
        .single();

      if (searchError && searchError.code !== "PGRST116") {
        // PGRST116は「結果が見つからない」エラーなので無視
        return NextResponse.json(
          { error: "キーワードの検索に失敗しました", details: searchError.message },
          { status: 500 }
        );
      }

      if (existingKeyword) {
        finalKeywordId = existingKeyword.id;
      } else {
        // キーワードが存在しない場合は作成
        const { data: newKeyword, error: insertError } = await supabase
          .from("keywords")
          .insert({ keyword: keyword.trim(), site: site.trim() })
          .select("id")
          .single();

        if (insertError || !newKeyword) {
          return NextResponse.json(
            { error: "キーワードの作成に失敗しました", details: insertError?.message },
            { status: 500 }
          );
        }
        finalKeywordId = newKeyword.id;
      }
    }

    // --- SerpApi にリクエスト送る ---
    const serpApiKey = process.env.SERP_API_KEY;
    if (!serpApiKey) {
      return NextResponse.json(
        { error: "SERP_API_KEY が環境変数にありません。" },
        { status: 500 }
      );
    }

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      keyword.trim()
    )}&engine=google&hl=ja&gl=jp&api_key=${serpApiKey}`;

    const serpRes = await fetch(url);
    
    if (!serpRes.ok) {
      return NextResponse.json(
        { error: `SerpApi リクエストに失敗しました（ステータス: ${serpRes.status}）` },
        { status: 500 }
      );
    }

    const serpData: SerpApiResult = await serpRes.json();

    // SerpApiのエラーチェック
    if (serpData.error) {
      return NextResponse.json(
        { error: `SerpApi エラー: ${serpData.error}` },
        { status: 500 }
      );
    }

    // Google検索の順位を抽出
    const organicResults = serpData.organic_results || [];
    const normalizedSite = normalizeDomain(site.trim());
    const found = organicResults.find((item) =>
      matchesDomain(item.link, normalizedSite)
    );

    const rank = found ? found.position : null;
    const positionUrl = found ? found.link : null;

    // --- Supabase に保存（rank_logs に insert）---
    const { error } = await supabase.from("rank_logs").insert({
      keyword_id: finalKeywordId,
      rank,
      position_url: positionUrl,
    });

    if (error) {
      return NextResponse.json(
        { error: "Supabase への保存に失敗", details: error.message },
        { status: 500 }
      );
    }

    // 成功レスポンス
    return NextResponse.json({
      message: "検索順位を取得し、ログに保存しました。",
      rank: rank,
      positionUrl: positionUrl,
      keyword_id: finalKeywordId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "サーバーエラー", details: String(err) },
      { status: 500 }
    );
  }
}
