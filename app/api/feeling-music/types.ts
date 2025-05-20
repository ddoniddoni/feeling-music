export interface FeelingMusicRequest {
  feeling: string;
}

export interface Track {
  name: string;
  artist: string;
  url: string;
}

export interface FeelingMusicResponse {
  sentiment: string;
  tracks: Track[];
}
