/** Shapes of /data/gaming_videos.json — identical to the old gamingYouTubeData object. */

export interface GamingVideo {
  video_title: string;
  video_thumbnail: string;
  video_publishTime: string;
  video_url: string;
  video_view_count: number;
  video_like_count: number;
  video_type?: 'video' | 'short' | 'stream' | string;
}

export interface GamingPage {
  prevPageToken: string | null;
  pageToken: string | null;
  nextPageToken: string | null;
  videos: GamingVideo[];
}

export interface GamingData {
  channel_name: string;
  channel_id: string;
  channel_handle: string;
  total_videos: number;
  total_video_pages: number;
  max_videos_per_page: number;
  last_page_total_videos: number;
  pages: GamingPage[];
}
