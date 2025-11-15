import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // リクエストBodyの取得
    const { keyword_id, keyword, site } = await req.json();

    if (!keyword_id || !keyword || !site) {
      return NextResponse.json(
        { error: "keyword_id, keyword, site は必須です。" },
        { status: 400 }
      );
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
      keyword
    )}&engine=google&hl=ja&gl=jp&api_key=${serpApiKey}`;

    const serpRes = await fetch(url);
    const serpData = await serpRes.json();

    // Google検索の順位を抽出
    const organicResults = serpData.organic_results || [];
    const found = organicResults.find((item: any) =>
      item.link.includes(site)
    );

    const rank = found ? found.position : null;
    const positionUrl = found ? found.link : null;

    // --- Supabase に保存（rank_logs に insert）---
    const { error } = await supabase.from("rank_logs").insert({
      keyword_id,
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
      data: {
        keyword,
        site,
        rank,
        positionUrl,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "サーバーエラー", details: String(err) },
      { status: 500 }
    );
  }
}
