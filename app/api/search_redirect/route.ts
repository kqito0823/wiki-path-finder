// /api/seach_redirect/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const res = await fetch(
        `${process.env.FASTAPI_URL}/search_redirect?id=${encodeURIComponent(id!)}`
    );
    const data = await res.json();
    return NextResponse.json(data);
}