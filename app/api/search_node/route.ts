// app/api/search_node/route
import { NextResponse } from 'next/server'
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const SG = searchParams.get("sg")
    const res = await fetch(
        `${process.env.FASTAPI_URL}/search_node?name=${encodeURIComponent(name!)}&sg=${encodeURIComponent(SG!)}`
    );
    const data = await res.json();
    return NextResponse.json(data);
}