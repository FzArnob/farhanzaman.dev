import { postVisitorAction } from './api';
import { getCookie } from './cookies';

/** Tag vocabulary sent to the tracking API. Values are stored verbatim in visitor_tracking. */
export const sync = {
  pages: {
    home: 'HOME',
    expertise: 'EXPERTISE',
    about: 'ABOUT',
    hobbies: 'HOBBIES',
    work_details: 'WORK_DETAILS',
    works: 'WORKS',
    gaming: 'GAMING',
    syncbot: 'SYNCBOT',
    not_found: 'NOT_FOUND',
    forbidden: 'FORBIDDEN',
    server_error: 'SERVER_ERROR',
  },
  features: {
    full_page: 'FULL_PAGE',
    resume_button: 'RESUME_BUTTON',
    contact_me_button: 'CONTACT_ME_BUTTON',
    theme_toggle: 'THEME_TOGGLE',
    nav_bar: 'NAV_BAR',
    back_to_top_button: 'BACK_TO_TOP_BUTTON',
    about_me_button: 'ABOUT_ME_BUTTON',
    expertise_more_button: 'EXPERTISE_MORE_BUTTON',
    view_projects_button: 'VIEW_PROJECTS_BUTTON',
    explore_hobbies_button: 'EXPLORE_HOBBIES_BUTTON',
    works_marquee: 'WORKS_MARQUEE',
    works_card: 'WORKS_CARD',
    gallery_container: 'GALLERY_CONTAINER',
    gallery_thumbnail: 'GALLERY_THUMBNAIL',
    photo_viewer: 'PHOTO_VIEWER',
    direct_message_form: 'DIRECT_MESSAGE_FORM',
    // Added in 1.09
    social_links: 'SOCIAL_LINKS',
    achievement_badge: 'ACHIEVEMENT_BADGE',
    footer: 'FOOTER',
    work_links: 'WORK_LINKS',
    work_media: 'WORK_MEDIA',
    expertise_card: 'EXPERTISE_CARD',
    skill_bars: 'SKILL_BARS',
    contact_details: 'CONTACT_DETAILS',
    mobile_menu: 'MOBILE_MENU',
    gaming_video_card: 'GAMING_VIDEO_CARD',
    gaming_sort_filter: 'GAMING_SORT_FILTER',
    gaming_discord: 'GAMING_DISCORD',
    gaming_platform_link: 'GAMING_PLATFORM_LINK',
    page_scroll: 'PAGE_SCROLL',
    page_session: 'PAGE_SESSION',
    syncbot_button: 'SYNCBOT_BUTTON',
    syncbot_console: 'SYNCBOT_CONSOLE',
  },
  activities: {
    page_view: 'PAGE_VIEW',
    click: 'CLICK',
    submit: 'SUBMIT',
    // Added in 1.09
    scroll: 'SCROLL',
    leave: 'LEAVE',
    copy: 'COPY',
  },
  actions: {
    visit: 'VISIT',
    download: 'DOWNLOAD',
    go_to_contact: 'GO_TO_CONTACT',
    view_work: 'VIEW_WORK',
    open_gallery_photo: 'OPEN_GALLERY_PHOTO',
    redirect_suffix: '_REDIRECT',
    nav_logo_redirect: 'LOGO_REDIRECT',
    logo_redirect: 'LOGO_REDIRECT',
    applied_dark_theme: 'APPLIED_DARK_THEME',
    applied_light_theme: 'APPLIED_LIGHT_THEME',
    scroll_to_top: 'SCROLL_TO_TOP',
    go_to_about_page: 'GO_TO_ABOUT_PAGE',
    go_to_expertise_page: 'GO_TO_EXPERTISE_PAGE',
    go_to_works_page: 'GO_TO_WORKS_PAGE',
    go_to_hobbies_page: 'GO_TO_HOBBIES_PAGE',
    send_direct_message: 'SEND_DIRECT_MESSAGE',
    expertise_more_click: 'EXPERTISE_MORE_CLICK',
    // Added in 1.09
    open_social_link: 'OPEN_SOCIAL_LINK',
    view_certificate: 'VIEW_CERTIFICATE',
    footer_credit_redirect: 'FOOTER_CREDIT_REDIRECT',
    open_live_url: 'OPEN_LIVE_URL',
    open_source_url: 'OPEN_SOURCE_URL',
    open_work_media: 'OPEN_WORK_MEDIA',
    view_expertise_card: 'VIEW_EXPERTISE_CARD',
    reveal_skill_bars: 'REVEAL_SKILL_BARS',
    copy_contact_detail: 'COPY_CONTACT_DETAIL',
    toggle_mobile_menu: 'TOGGLE_MOBILE_MENU',
    close_photo_viewer: 'CLOSE_PHOTO_VIEWER',
    zoom_in_photo: 'ZOOM_IN_PHOTO',
    zoom_out_photo: 'ZOOM_OUT_PHOTO',
    select_photo_thumbnail: 'SELECT_PHOTO_THUMBNAIL',
    watch_gaming_video: 'WATCH_GAMING_VIDEO',
    filter_gaming_videos: 'FILTER_GAMING_VIDEOS',
    join_discord: 'JOIN_DISCORD',
    open_gaming_platform: 'OPEN_GAMING_PLATFORM',
    scroll_depth: 'SCROLL_DEPTH',
    leave_page: 'LEAVE_PAGE',
    go_to_syncbot_page: 'GO_TO_SYNCBOT_PAGE',
    syncbot_ready: 'SYNCBOT_READY',
    syncbot_question: 'SYNCBOT_QUESTION',
    syncbot_reset: 'SYNCBOT_RESET',
    syncbot_unavailable: 'SYNCBOT_UNAVAILABLE',
    syncbot_voice_question: 'SYNCBOT_VOICE_QUESTION',
  },
} as const;

export type SyncPage = keyof typeof sync.pages;

/** Fire-and-forget: tracking must never break the page. */
export function synchronizeInfo(
  page_tag: string,
  feature_tag: string,
  activity_tag: string,
  action_tag: string,
  keepalive = false
): void {
  postVisitorAction({ page_tag, feature_tag, activity_tag, action_tag }, keepalive).catch(() => {
    /* tracking is best effort */
  });
}

/** Convenience wrapper for React event handlers on a known page. */
export function track(
  pageName: SyncPage,
  feature_tag: string,
  activity_tag: string,
  action_tag: string,
  keepalive = false
): void {
  synchronizeInfo(sync.pages[pageName], feature_tag, activity_tag, action_tag, keepalive);
}

function on(selector: string, handler: (el: Element) => void): void {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('click', () => handler(el));
  });
}

/**
 * Attaches the page-wide tracking listeners once a page has been revealed.
 * Returns a cleanup function that detaches the window-level listeners.
 */
export function synchronizePage(pageName: SyncPage, workTitle?: string): () => void {
  const page = sync.pages[pageName];

  // Page View Tracking
  let trackedActionName: string = sync.actions.visit;
  if (pageName === 'work_details') {
    trackedActionName = 'WORK:' + (workTitle || 'NO_TITLE');
  }
  synchronizeInfo(page, sync.features.full_page, sync.activities.page_view, trackedActionName);

  // Resume Download Tracking
  const resumeLink = document.getElementById('resume');
  if (resumeLink) {
    resumeLink.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.resume_button,
        sync.activities.click,
        sync.actions.download
      );
    });
  }

  // Contact Button Tracking
  const contactLink = document.getElementById('button-3');
  if (contactLink) {
    contactLink.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.contact_me_button,
        sync.activities.click,
        sync.actions.go_to_contact
      );
    });
  }

  // Navbar Navigation Tracking
  on('.nav-links', function (link) {
    const linkText = (link.textContent || '').trim().toUpperCase();
    synchronizeInfo(
      page,
      sync.features.nav_bar,
      sync.activities.click,
      linkText + sync.actions.redirect_suffix
    );
  });

  // Logo Navigation Tracking
  const logoLink = document.querySelector('.nav-logo');
  if (logoLink) {
    logoLink.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.nav_bar,
        sync.activities.click,
        sync.actions.logo_redirect
      );
    });
  }

  // Theme Toggle Tracking
  const themeToggleButton = document.getElementById('theme-toogle-button');
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', function () {
      // Determine the theme that will be applied after this click
      const currentTheme = getCookie('theme');
      const actionName =
        currentTheme === 'light'
          ? sync.actions.applied_light_theme
          : sync.actions.applied_dark_theme;
      synchronizeInfo(page, sync.features.theme_toggle, sync.activities.click, actionName);
    });
  }

  // Back-to-Top Button Tracking
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.back_to_top_button,
        sync.activities.click,
        sync.actions.scroll_to_top
      );
    });
  }

  // About Me Button Tracking
  const aboutMeBtn = document.getElementById('about-me-btn');
  if (aboutMeBtn) {
    aboutMeBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.about_me_button,
        sync.activities.click,
        sync.actions.go_to_about_page
      );
    });
  }

  // Expertise More Button Tracking
  const expertiseMoreBtn = document.getElementById('expertise-more-btn');
  if (expertiseMoreBtn) {
    expertiseMoreBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.expertise_more_button,
        sync.activities.click,
        sync.actions.expertise_more_click
      );
    });
  }

  // View Projects Button Tracking
  const viewProjectsBtn = document.getElementById('view-projects-btn');
  if (viewProjectsBtn) {
    viewProjectsBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.view_projects_button,
        sync.activities.click,
        sync.actions.go_to_works_page
      );
    });
  }

  // Explore Hobbies Button Tracking
  const exploreHobbiesBtn = document.getElementById('explore-hobbies-btn');
  if (exploreHobbiesBtn) {
    exploreHobbiesBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.explore_hobbies_button,
        sync.activities.click,
        sync.actions.go_to_hobbies_page
      );
    });
  }

  // SyncBot Button Tracking
  const syncbotBtn = document.getElementById('syncbot-btn');
  if (syncbotBtn) {
    syncbotBtn.addEventListener('click', function () {
      synchronizeInfo(
        page,
        sync.features.syncbot_button,
        sync.activities.click,
        sync.actions.go_to_syncbot_page
      );
    });
  }

  // Send Direct Message Form Submission Tracking
  const directMessageForm = document.getElementById('direct-message');
  if (directMessageForm) {
    directMessageForm.addEventListener('submit', function () {
      synchronizeInfo(
        page,
        sync.features.direct_message_form,
        sync.activities.submit,
        sync.actions.send_direct_message
      );
    });
  }

  // WORKS: track clicks on work cards
  on('.work-card', function (card) {
    const titleEl =
      card.querySelector('.work-card-title') || card.querySelector('.work-card-title-full');
    const title = titleEl ? (titleEl.textContent || '').trim() : 'UNKNOWN_WORK';
    synchronizeInfo(
      page,
      sync.features.works_card,
      sync.activities.click,
      sync.actions.view_work + ':' + title
    );
  });

  // GALLERY: track clicks on gallery thumbnails
  on('.image-container', function (imgEl) {
    const title = imgEl.getAttribute('data-name') || 'UNKNOWN_PHOTO';
    synchronizeInfo(
      page,
      sync.features.gallery_thumbnail,
      sync.activities.click,
      sync.actions.open_gallery_photo + ':' + title
    );
  });

  // ---- Added in 1.09 ----

  // Social profile links
  on('#social-contact a', function (link) {
    const href = link.getAttribute('href') || '';
    let platform = 'UNKNOWN';
    if (href.includes('facebook')) platform = 'FACEBOOK';
    else if (href.includes('github')) platform = 'GITHUB';
    else if (href.includes('linkedin')) platform = 'LINKEDIN';
    else if (href.includes('wa.me') || href.includes('whatsapp')) platform = 'WHATSAPP';
    synchronizeInfo(
      page,
      sync.features.social_links,
      sync.activities.click,
      sync.actions.open_social_link + ':' + platform
    );
  });

  // Certification badges
  on('.achievement-node', function (node) {
    const img = node.querySelector('img');
    const name = img?.getAttribute('data-tooltip') || 'UNKNOWN_CERTIFICATE';
    synchronizeInfo(
      page,
      sync.features.achievement_badge,
      sync.activities.click,
      sync.actions.view_certificate + ':' + name
    );
  });

  // Footer credit link
  on('#footer_name', function () {
    synchronizeInfo(
      page,
      sync.features.footer,
      sync.activities.click,
      sync.actions.footer_credit_redirect
    );
  });

  // Mobile navigation toggle
  on('#nav-menu-button', function () {
    synchronizeInfo(
      page,
      sync.features.mobile_menu,
      sync.activities.click,
      sync.actions.toggle_mobile_menu
    );
  });

  // Photo viewer controls
  on('#closeButton', function () {
    synchronizeInfo(
      page,
      sync.features.photo_viewer,
      sync.activities.click,
      sync.actions.close_photo_viewer
    );
  });
  on('#zoomInButton', function () {
    synchronizeInfo(
      page,
      sync.features.photo_viewer,
      sync.activities.click,
      sync.actions.zoom_in_photo
    );
  });
  on('#zoomOutButton', function () {
    synchronizeInfo(
      page,
      sync.features.photo_viewer,
      sync.activities.click,
      sync.actions.zoom_out_photo
    );
  });
  on('.thumbnail-g', function (thumb) {
    const title = thumb.getAttribute('data-name') || 'UNKNOWN_PHOTO';
    synchronizeInfo(
      page,
      sync.features.photo_viewer,
      sync.activities.click,
      sync.actions.select_photo_thumbnail + ':' + title
    );
  });

  // Work detail page links
  on('.work-link-view', function (link) {
    const label = (link.textContent || '').trim().toUpperCase();
    const action =
      label === 'SOURCE' ? sync.actions.open_source_url : sync.actions.open_live_url;
    synchronizeInfo(page, sync.features.work_links, sync.activities.click, action);
  });
  on('.work-media-link', function (link) {
    synchronizeInfo(
      page,
      sync.features.work_media,
      sync.activities.click,
      sync.actions.open_work_media + ':' + (link.getAttribute('href') || '')
    );
  });

  // Copying a contact detail (address / phone / email)
  const infoList = document.querySelector('#info .list-ico');
  const onCopy = () => {
    synchronizeInfo(
      page,
      sync.features.contact_details,
      sync.activities.copy,
      sync.actions.copy_contact_detail
    );
  };
  infoList?.addEventListener('copy', onCopy);

  // Scroll depth milestones, reported once each
  const reached = new Set<number>();
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const percent = Math.round((window.scrollY / scrollable) * 100);
    for (const milestone of [25, 50, 75, 100]) {
      if (percent >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        synchronizeInfo(
          page,
          sync.features.page_scroll,
          sync.activities.scroll,
          sync.actions.scroll_depth + ':' + milestone
        );
      }
    }
  };
  window.addEventListener('scroll', onScroll);

  // Time spent on the page, reported when the tab is hidden or closed
  const openedAt = Date.now();
  let reportedLeave = false;
  const onLeave = () => {
    if (reportedLeave || document.visibilityState !== 'hidden') return;
    reportedLeave = true;
    const seconds = Math.round((Date.now() - openedAt) / 1000);
    synchronizeInfo(
      page,
      sync.features.page_session,
      sync.activities.leave,
      sync.actions.leave_page + ':' + seconds + 'S',
      true
    );
  };
  document.addEventListener('visibilitychange', onLeave);

  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onLeave);
    infoList?.removeEventListener('copy', onCopy);
  };
}
