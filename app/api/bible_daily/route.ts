import { getBibleDaily, getTeamForUser } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    const date = new URL(request.url).searchParams.get('date')

    if(!date) {
        return new NextResponse("Date parameter is required, payload example: '3月2日'", { status: 400 });
    }
    
    const bibleDaily = await getBibleDaily(date);
  return Response.json(bibleDaily);

    // return new NextResponse(bibleDaily, { status: 200 });
}
