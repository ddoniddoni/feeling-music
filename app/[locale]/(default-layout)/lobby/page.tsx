"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface Track {
  name: string;
  artist: string;
  url: string;
}

export default function LobbyPage(props: never) {
  const t = useTranslations();
  const [feeling, setFeeling] = useState("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSentiment(null);
    setTracks([]);

    try {
      const res = await fetch("/api/feeling-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API 호출 실패");
      }

      setSentiment(data.sentiment);
      setTracks(data.tracks);
    } catch (err: any) {
      setError(err.message || "에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 32 }}>
      <h2>🎵 기분에 맞는 음악 추천</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder="지금 기분을 입력하세요 (예: 행복해, 우울해 등)"
          style={{ width: "70%", padding: 8, fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading || !feeling}
          style={{ marginLeft: 8, padding: "8px 16px", fontSize: 16 }}
        >
          추천받기
        </button>
      </form>
      {loading && <p>추천 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {sentiment && (
        <div>
          <p>
            감정 분석 결과: <b>{sentiment}</b>
          </p>
          <ul>
            {tracks.map((track, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <a href={track.url} target="_blank" rel="noopener noreferrer">
                  {track.name} - {track.artist}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
