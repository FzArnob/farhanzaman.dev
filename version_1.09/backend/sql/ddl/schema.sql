-- Portfolio 1.09 schema.
-- Profile content now lives in data/profile.json, so only visitor tracking and
-- contact messages are stored in the database. The visitor_locations and
-- visitor_tracking structures are carried over unchanged; the only difference is
-- that fk_profile_id is a plain column now that profile_info no longer exists.

create database if not exists portfolio;
use portfolio;

create table visitor_locations (
  visitor_ip varchar(45) not null primary key,
  is_tracked tinyint(1) default 0,
  continent varchar(255),
  country_name varchar(255),
  location_latitude decimal(10, 8),
  location_longitude decimal(11, 8),
  state_name varchar(255),
  city_name varchar(255),
  created_date timestamp default current_timestamp not null,
  # Timestamp of the most recent geolocation attempt, successful or not.
  # A failed lookup is retried on a later visit instead of by a cron job.
  tracked_date timestamp null,
  # Indexes for better performance
  index idx_country_state_city (country_name, state_name, city_name)
);

create table visitor_tracking (
  tracking_id int auto_increment primary key,
  # Unique device fingerprint based on cookie handled from server side
  device_fingerprint varchar(64) not null,
  visit_timestamp timestamp default current_timestamp not null,
  # Network and location data reference (first check if IP exists in visitor_locations, If not then add it and use https://api.geoapify.com to get location data for the new IP. if getting location data fails, still store the IP with null location data and tracked to false)
  fk_visitor_ip varchar(45) not null,
  # Device and browser information (parsed from the user agent; anything the server cannot derive is sent by the frontend)
  browser_name varchar(255),
  browser_version varchar(50),
  operating_system varchar(255),
  device_type varchar(255),
  screen_resolution varchar(20),
  color_depth int,
  timezone_offset int,
  language varchar(10),
  rendering_engine varchar(255),
  # Activity tracking (receiving these details from frontend, see the tag vocabulary below)
  page_tag varchar(255),
  feature_tag varchar(255),
  activity_tag varchar(255),
  action_tag varchar(255),
  referrer_url varchar(500),
  # Profile reference
  fk_profile_id varchar(20) not null,
  # Indexes for better performance
  index idx_device_fingerprint (device_fingerprint),
  index idx_visitor_ip (fk_visitor_ip),
  index idx_visit_timestamp (visit_timestamp),
  index idx_profile_date (fk_profile_id, visit_timestamp),
  index idx_feature_activity (feature_tag, activity_tag),
  foreign key (fk_visitor_ip) references visitor_locations (visitor_ip)
);

create table direct_messages (
  message_id int auto_increment primary key,
  name varchar(255) not null,
  email varchar(255) not null,
  subject varchar(255) not null,
  message text not null,
  created timestamp default current_timestamp not null,
  delete_flag tinyint (1) default 0 null,
  fk_profile_id varchar(20) not null
);

-- ---------------------------------------------------------------------------
-- Tag vocabulary written into visitor_tracking. Kept as documentation only so
-- new actions can be added without a migration.
--
-- page_tag      HOME, ABOUT, EXPERTISE, WORKS, WORK_DETAILS, HOBBIES, GAMING,
--               NOT_FOUND, FORBIDDEN, SERVER_ERROR
--
-- activity_tag  PAGE_VIEW, CLICK, SUBMIT, SCROLL, LEAVE, COPY
--
-- feature_tag   Carried over from 1.06:
--               FULL_PAGE, RESUME_BUTTON, CONTACT_ME_BUTTON, THEME_TOGGLE,
--               NAV_BAR, BACK_TO_TOP_BUTTON, ABOUT_ME_BUTTON,
--               EXPERTISE_MORE_BUTTON, VIEW_PROJECTS_BUTTON,
--               EXPLORE_HOBBIES_BUTTON, WORKS_MARQUEE, WORKS_CARD,
--               GALLERY_CONTAINER, GALLERY_THUMBNAIL, PHOTO_VIEWER,
--               DIRECT_MESSAGE_FORM
--               Added in 1.09:
--               SOCIAL_LINKS, ACHIEVEMENT_BADGE, FOOTER, WORK_LINKS, WORK_MEDIA,
--               EXPERTISE_CARD, SKILL_BARS, CONTACT_DETAILS, MOBILE_MENU,
--               GAMING_VIDEO_CARD, GAMING_SORT_FILTER, GAMING_DISCORD,
--               GAMING_PLATFORM_LINK, PAGE_SCROLL, PAGE_SESSION
--
-- action_tag    Carried over from 1.06:
--               VISIT, DOWNLOAD, GO_TO_CONTACT, VIEW_WORK:<title>,
--               OPEN_GALLERY_PHOTO:<title>, <PAGE>_REDIRECT, LOGO_REDIRECT,
--               APPLIED_DARK_THEME, APPLIED_LIGHT_THEME, SCROLL_TO_TOP,
--               GO_TO_ABOUT_PAGE, GO_TO_EXPERTISE_PAGE, GO_TO_WORKS_PAGE,
--               GO_TO_HOBBIES_PAGE, SEND_DIRECT_MESSAGE, EXPERTISE_MORE_CLICK,
--               WORK:<title>
--               Added in 1.09:
--               OPEN_SOCIAL_LINK:<platform>, VIEW_CERTIFICATE:<name>,
--               FOOTER_CREDIT_REDIRECT, OPEN_LIVE_URL, OPEN_SOURCE_URL,
--               OPEN_WORK_MEDIA:<url>, VIEW_EXPERTISE_CARD, REVEAL_SKILL_BARS,
--               COPY_CONTACT_DETAIL, TOGGLE_MOBILE_MENU, CLOSE_PHOTO_VIEWER,
--               ZOOM_IN_PHOTO, ZOOM_OUT_PHOTO, SELECT_PHOTO_THUMBNAIL:<title>,
--               WATCH_GAMING_VIDEO:<title>, FILTER_GAMING_VIDEOS:<type>,
--               JOIN_DISCORD, OPEN_GAMING_PLATFORM:<platform>,
--               SCROLL_DEPTH:<percent>, LEAVE_PAGE:<seconds>S
-- ---------------------------------------------------------------------------
