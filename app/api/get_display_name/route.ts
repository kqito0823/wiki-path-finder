// app/api/get_display_name/route.ts
import { NextResponse } from 'next/server'
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const node = searchParams.get("node");
  const fNode = searchParams.get("foreNode");

  if (!node || !fNode) {
    return NextResponse.json(
      { error: "node と foreNode は必須です" },
      { status: 400 }
    );
  }
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/wiki/${encodeURIComponent(fNode.replace(/_/g, ' '))}`,
      { method: "GET" ,headers: { "User-Agent": process.env.USER_AGENT ?? "wiki-path-finder/1.0" }}
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `記事の取得に失敗しました: ${res.status}` },
        { status: res.status }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const target = $(`a[title="${node.replace(/_/g, ' ')}"]`).first();
    return NextResponse.json({text:target.text() ? target.text() : node});
  } catch (err) {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}