import { NextRequest, NextResponse } from "next/server";
import { FeelingMusicRequest, FeelingMusicResponse, Track } from "./types";
import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.HF_TOKEN!;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const hf = new InferenceClient(HF_TOKEN);

// 감정 분석 함수
async function getSentiment(text: string): Promise<string> {
  // Inference API 지원 모델 (영어 예시)
  const model = "distilbert-base-uncased-finetuned-sst-2-english";
  const result = await hf.textClassification({
    model,
    inputs: text,
  });
  // 예: [{ label: "POSITIVE", score: ... }]
  return result[0]?.label || "neutral";
}

// Spotify 토큰 발급
async function getSpotifyToken(): Promise<string> {
  const auth = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spotify Token Error:", errorText);
    throw new Error(`Spotify Token Error: ${response.status}`);
  }
  const data = await response.json();
  return data.access_token;
}

// Spotify에서 곡 검색
async function searchTracks(query: string, token: string): Promise<Track[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spotify Search Error:", errorText);
    throw new Error(`Spotify Search Error: ${response.status}`);
  }
  const data = await response.json();
  return (data.tracks.items ?? []).map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
  }));
}

// API Route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feeling } = body as FeelingMusicRequest;

    if (!feeling || typeof feeling !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 1. 감정 분석
    const sentiment = await getSentiment(feeling);

    // 2. 감정에 따라 음악 추천 키워드 결정
    let keyword: string;
    if (sentiment === "POSITIVE") keyword = "happy";
    else if (sentiment === "NEGATIVE") keyword = "sad";
    else keyword = "calm";

    // 3. Spotify에서 곡 추천
    const token = await getSpotifyToken();
    const tracks = await searchTracks(keyword, token);

    return NextResponse.json({
      sentiment,
      tracks,
    } as FeelingMusicResponse);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
