import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { Footer } from '../../components/Footer/Footer';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { loadGamingVideos } from '../../data/loadProfile';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { sync, track } from '../../lib/sync';
import type { GamingVideo } from '../../types/gaming';
import gamingCss from './gaming.css?raw';

const PAGE_SIZE = 12;
const LOGO = '/view/static/runfzrun.png';

type SortType = 'all' | 'video' | 'short' | 'stream';

const SORT_BUTTONS: { type: SortType; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'video', label: 'Videos' },
  { type: 'short', label: 'Shorts' },
  { type: 'stream', label: 'Streams' },
];

/** "3 days ago" / "2 months ago" — same buckets as the original page. */
function relativeDate(publishTime: string): string {
  const publishDate = new Date(publishTime);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function SkeletonItem() {
  return (
    <div className="video-item skeleton-item">
      <div
        style={{
          width: '100%',
          height: '180px',
          background: 'linear-gradient(90deg, #222 25%, #333 50%, #222 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.2s infinite linear',
          borderRadius: '10px',
        }}
      ></div>
      <div className="video-info">
        <div
          style={{
            width: '70%',
            height: '18px',
            background: '#333',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'skeleton-loading 1.2s infinite linear',
          }}
        ></div>
        <div
          style={{
            width: '40%',
            height: '12px',
            background: '#333',
            borderRadius: '4px',
            marginBottom: '6px',
            animation: 'skeleton-loading 1.2s infinite linear',
          }}
        ></div>
        <div
          style={{
            width: '60%',
            height: '10px',
            background: '#333',
            borderRadius: '4px',
            animation: 'skeleton-loading 1.2s infinite linear',
          }}
        ></div>
      </div>
    </div>
  );
}

function VideoItem({ video }: { video: GamingVideo }) {
  const badge =
    video.video_type === 'short' ? (
      <span
        style={{
          background: '#ff4444',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          marginLeft: '5px',
        }}
      >
        SHORT
      </span>
    ) : video.video_type === 'stream' ? (
      <span
        style={{
          background: '#ff0000',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          marginLeft: '5px',
        }}
      >
        LIVE
      </span>
    ) : null;

  return (
    <div className="video-item">
      <a
        href={video.video_url}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none' }}
        onClick={() =>
          track(
            'gaming',
            sync.features.gaming_video_card,
            sync.activities.click,
            sync.actions.watch_gaming_video + ':' + video.video_title
          )
        }
      >
        <img src={video.video_thumbnail} alt={video.video_title} className="video-thumbnail" />
        <div className="video-info">
          <div className="video-title">
            {video.video_title}
            {badge}
          </div>
          <div className="video-date">{relativeDate(video.video_publishTime)}</div>
          <div style={{ color: '#aaa', fontSize: '11px', marginTop: '4px' }}>
            {video.video_view_count.toLocaleString()} views •{' '}
            {video.video_like_count.toLocaleString()} likes
          </div>
        </div>
      </a>
    </div>
  );
}

export function GamingPage() {
  const ready = usePageReveal('gaming');
  const [allVideos, setAllVideos] = useState<GamingVideo[]>([]);
  const [sortType, setSortType] = useState<SortType>('all');
  const [shown, setShown] = useState(0);
  const [skeletons, setSkeletons] = useState(8);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useDocumentTitle('Run Fz Run');

  // Page-scoped styles: the gaming look overrides global rules, so it is only mounted here.
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = gamingCss;
    const iconFont = document.createElement('link');
    iconFont.rel = 'stylesheet';
    iconFont.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.append(style, iconFont);
    return () => {
      style.remove();
      iconFont.remove();
    };
  }, []);

  useEffect(() => {
    loadGamingVideos()
      .then((data) => {
        const videos = data.pages.flatMap((page) => page.videos ?? []);
        videos.sort(
          (a, b) =>
            new Date(b.video_publishTime).getTime() - new Date(a.video_publishTime).getTime()
        );
        setAllVideos(videos);
      })
      .catch((error) => console.error('Failed to load gaming videos:', error));
  }, []);

  const filteredVideos = useMemo(() => {
    if (sortType === 'all') return allVideos;
    if (sortType === 'video')
      return allVideos.filter((v) => !v.video_type || v.video_type === 'video');
    return allVideos.filter((v) => v.video_type === sortType);
  }, [allVideos, sortType]);

  const isAtBottom = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return false;
    const rect = grid.getBoundingClientRect();
    return window.innerHeight + window.scrollY >= rect.top + window.scrollY + grid.offsetHeight - 300;
  }, []);

  /** Shows a page of skeletons, then swaps them for the next batch of videos. */
  const loadNextPage = useCallback(() => {
    if (loadingRef.current) return;
    setShown((currentShown) => {
      if (currentShown >= filteredVideos.length) return currentShown;

      loadingRef.current = true;
      const batch = Math.min(PAGE_SIZE, filteredVideos.length - currentShown);
      setSkeletons(batch);

      window.setTimeout(() => {
        setShown(currentShown + batch);
        setSkeletons(0);
        loadingRef.current = false;
        if (isAtBottom() && currentShown + batch < filteredVideos.length) loadNextPage();
      }, 600);

      return currentShown;
    });
  }, [filteredVideos.length, isAtBottom]);

  // First page arrives a second after the videos are ready, matching the original pacing.
  useEffect(() => {
    if (!ready || allVideos.length === 0) return;
    const timer = window.setTimeout(() => loadNextPage(), 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, allVideos.length]);

  useEffect(() => {
    const onScroll = () => {
      if (isAtBottom() && shown < filteredVideos.length && !loadingRef.current) loadNextPage();
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAtBottom, loadNextPage, shown, filteredVideos.length]);

  const onSort = (type: SortType) => {
    if (type === sortType) return;
    setSortType(type);
    setShown(0);
    setSkeletons(0);
    loadingRef.current = false;
    track(
      'gaming',
      sync.features.gaming_sort_filter,
      sync.activities.click,
      sync.actions.filter_gaming_videos + ':' + type.toUpperCase()
    );
    window.setTimeout(() => loadNextPage(), 0);
  };

  return (
    <PageShell ready={ready} loaderImage={LOGO} overlays={<BackToTop />}>
      <Navbar logo={LOGO} logoOnly />
      <div className="main-content">
        {/* First Row: Profile Info and Social Links */}
        <div className="row gaming-profile-row">
          <video className="background-video" autoPlay muted loop>
            <source src="/view/static/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="profile-left-section">
            {/* Image and Name side by side */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <img
                src="/view/static/runfzrun-dp.png"
                alt="Run Fz Run Profile"
                className="gaming-profile-img"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '2px solid #fcba03',
                  marginRight: '15px',
                }}
              />
              <h1 style={{ color: '#fcba03', margin: 0, WebkitTextFillColor: '#fff' }}>
                Run Fz Run
              </h1>
            </div>
            {/* Description below */}
            <p style={{ color: '#fff', margin: 0, lineHeight: 1.6 }}>
              Gaming content creator sharing epic gaming moments, tutorials, and entertainment.
              Subscribe for the latest gaming videos!
            </p>
          </div>

          <div className="profile-right-section">
            {/* Discord logo gif and animated text */}
            <div
              className="discord-section"
              style={{ textAlign: 'center', cursor: 'pointer', maxWidth: 'fit-content' }}
              onClick={() =>
                track(
                  'gaming',
                  sync.features.gaming_discord,
                  sync.activities.click,
                  sync.actions.join_discord
                )
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                <img
                  src="/view/static/discord.gif"
                  alt="Discord"
                  style={{ width: '80px', height: '80px', marginRight: '10px' }}
                />
                <span
                  className="wobble animate-infinite-tossing"
                  style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '24px' }}
                >
                  Join Now!
                </span>
              </div>
            </div>
            {/* 3 Platform logos */}
            <div className="platform-logos">
              <a
                href="https://www.youtube.com/@runfzrun?sub_confirmation=1"
                target="_blank"
                rel="noreferrer"
                className="platform-logo"
                style={{ display: 'inline-block', transition: 'transform 0.3s' }}
                onClick={() =>
                  track(
                    'gaming',
                    sync.features.gaming_platform_link,
                    sync.activities.click,
                    sync.actions.open_gaming_platform + ':YOUTUBE'
                  )
                }
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-icons" style={{ color: '#ff0000', fontSize: '70px' }}>
                    play_circle_filled
                  </span>
                </div>
              </a>
              <a
                href="https://www.facebook.com/runfzrun"
                target="_blank"
                rel="noreferrer"
                className="platform-logo"
                style={{ display: 'inline-block', transition: 'transform 0.3s' }}
                onClick={() =>
                  track(
                    'gaming',
                    sync.features.gaming_platform_link,
                    sync.activities.click,
                    sync.actions.open_gaming_platform + ':FACEBOOK'
                  )
                }
              >
                <div
                  style={{
                    width: '55px',
                    height: '55px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-icons" style={{ color: '#1877f2', fontSize: '70px' }}>
                    facebook
                  </span>
                </div>
              </a>
              <a
                href="https://www.tiktok.com/@runfzrun"
                target="_blank"
                rel="noreferrer"
                className="platform-logo"
                style={{ display: 'inline-block', transition: 'transform 0.3s' }}
                onClick={() =>
                  track(
                    'gaming',
                    sync.features.gaming_platform_link,
                    sync.activities.click,
                    sync.actions.open_gaming_platform + ':TIKTOK'
                  )
                }
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      background: 'linear-gradient(135deg, #ff0050 0%, #00f2ea 100%)',
                      color: '#fff',
                      padding: '7px',
                      borderRadius: '50%',
                      fontSize: '45px',
                      fontWeight: 300,
                    }}
                  >
                    tiktok
                  </span>
                </div>
              </a>
            </div>
          </div>
          <div
            style={{
              zIndex: 2,
              height: '200px',
              width: '100%',
              background:
                'linear-gradient(to bottom, rgba(37, 37, 37, 0) 0%, rgb(37, 37, 37) 100%)',
            }}
          ></div>
        </div>

        {/* Second Row: YouTube Videos Grid */}
        <div className="row gaming-videos-row">
          <div className="col-sm-12">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div
                id="video-sort-btns"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '30px',
                  padding: '6px 16px',
                  display: 'flex',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(252,186,3,0.08)',
                }}
              >
                {SORT_BUTTONS.map((button) => {
                  const active = sortType === button.type;
                  return (
                    <button
                      key={button.type}
                      className={active ? 'sort-btn active' : 'sort-btn'}
                      data-type={button.type}
                      onClick={() => onSort(button.type)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: active ? '#fcba03' : '#fff',
                        fontWeight: active ? 'bold' : undefined,
                        fontSize: '15px',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      {button.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              className="videos-grid"
              id="youtube-videos-grid"
              ref={gridRef}
              style={{
                paddingTop: '20px',
                paddingBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                borderRadius: '10px',
                minHeight: '400px',
              }}
            >
              {filteredVideos.slice(0, shown).map((video) => (
                <VideoItem key={video.video_url} video={video} />
              ))}
              {Array.from({ length: skeletons }, (_, index) => (
                <SkeletonItem key={'skeleton-' + index} />
              ))}
            </div>
          </div>
        </div>

        <Footer variant="gaming" />
      </div>
    </PageShell>
  );
}
