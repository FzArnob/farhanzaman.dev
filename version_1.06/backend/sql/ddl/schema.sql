# Active: 1757309206526@@127.0.0.1@3306@portfolio
create table profile_info (
  profile_id varchar(20) not null primary key, 
  full_name varchar(255) null, 
  first_name varchar(255) null, 
  last_name varchar(255) null, 
  nick_name varchar(50) null, 
  designations text null, 
  intro_text text null, 
  about_text text null, 
  intro_image_url varchar(255) null, 
  resume_url varchar(255) null, 
  expertise_preference_details text null, 
  website_base_url varchar(255) null, 
  website_domain_name varchar(255) null, 
  contact_preference_details text null, 
  address varchar(255) null, 
  phone varchar(20) null, 
  secondary_phone varchar(20) null, 
  email varchar(255) not null, 
  alternative_email varchar(255) null, 
  facebook_url varchar(255) null, 
  github_url varchar(255) null, 
  linkedin_url varchar(255) null, 
  whatsapp_url varchar(255) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  constraint email unique (email), 
  constraint profile_id unique (profile_id)
);
create table education_items (
  education_id int auto_increment primary key, 
  institute_name varchar(255) null, 
  institute_std varchar(50) null, 
  institute_url varchar(255) null, 
  start_date varchar(50) null, 
  end_date varchar(50) null, 
  is_present tinyint (1) null, 
  subject varchar(255) null, 
  activity varchar(255) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table experience_items (
  experience_id int auto_increment primary key, 
  institute_name varchar(255) null, 
  institute_std varchar(50) null, 
  institute_url varchar(255) null, 
  start_date date null, 
  end_date date null, 
  is_present tinyint (1) null, 
  position varchar(255) null, 
  project_details text null, 
  project_text_1 varchar(255) null, 
  project_text_2 varchar(255) null, 
  project_text_3 varchar(255) null, 
  project_url_1 varchar(255) null, 
  project_url_2 varchar(255) null, 
  project_url_3 varchar(255) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table achievement_items (
  achievement_id int auto_increment primary key, 
  name varchar(255) null, 
  description text null, 
  certification_date date null, 
  certification_url varchar(255) null, 
  certification_logo varchar(255) null, 
  duration int null, 
  level varchar(50) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table expertise_items (
  expertise_id int auto_increment primary key, 
  name varchar(255) null, 
  description text null, 
  duration int null, 
  level varchar(50) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table gallery_items (
  gallery_item_id int auto_increment primary key, 
  name varchar(255) null, 
  description text null, 
  category varchar(100) null, 
  image_url varchar(255) null, 
  thumb_url varchar(255) null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table projects (
  project_id int auto_increment primary key,
  name varchar(255) null,
  work_role varchar(255) null,
  logo_image varchar(255) null,
  type varchar(100) null,
  stack varchar(100) null,
  details text null,
  live_text varchar(255) null,
  live_url varchar(255) null,
  scope_of_work text null,
  source_url varchar(255) null,
  start_date date null,
  current_status varchar(100) null,
  methodology varchar(100) null,
  last_contribution_date varchar(30) null,
  tech_stack text null,
  challenges text null,
  future_scope text null,
  created_date timestamp default current_timestamp() not null,
  updated_date timestamp default current_timestamp() not null on update current_timestamp(),
  delete_flag tinyint(1) default 0 null,
  fk_profile_id varchar(20) not null,
  foreign key (fk_profile_id) references profile_info (profile_id)
);
CREATE TABLE project_media (
  media_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  media_link VARCHAR(255) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
create table skill_items (
  skill_id int auto_increment primary key, 
  name varchar(255) null, 
  description text null, 
  duration int null, 
  percentage int null, 
  created_date timestamp default current_timestamp() not null, 
  updated_date timestamp default current_timestamp() not null on update current_timestamp(), 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table direct_messages (
  message_id int auto_increment primary key, 
  name varchar(255) not null, 
  email varchar(255) not null, 
  subject varchar(255) not null, 
  message text not null, 
  created timestamp default current_timestamp() not null, 
  delete_flag tinyint (1) default 0 null, 
  fk_profile_id varchar(20) not null, 
  foreign key (fk_profile_id) references profile_info (profile_id)
);
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
  # Device and browser information (use exact logic as in ProfileModel, recieve anything from frontend that can not be got from user agent)
  browser_name varchar(255),
  browser_version varchar(50),
  operating_system varchar(255),
  device_type varchar(255),
  screen_resolution varchar(20),
  color_depth int,
  timezone_offset int,
  language varchar(10),
  rendering_engine varchar(255),
  # Activity tracking (recieving these details from frontend)
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
  foreign key (fk_visitor_ip) references visitor_locations (visitor_ip),
  foreign key (fk_profile_id) references profile_info (profile_id)
);