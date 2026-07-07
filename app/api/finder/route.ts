// app/api/finder/route
import { NextResponse } from 'next/server'
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const goal = searchParams.get("goal")
    const res = await fetch(
        `${process.env.FASTAPI_URL}/get_path?s=${encodeURIComponent(start!)}&g=${encodeURIComponent(goal!)}`
    );
    const data = await res.json();
    return NextResponse.json(data);
}