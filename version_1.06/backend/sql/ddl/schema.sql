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
create table visitors (
  visitor_id int auto_increment primary key,
  visitor_ip varchar(45) unique,
  is_tracked boolean,
  continent varchar(255),
  country_iso_code varchar(2),
  country_phone_code varchar(5),
  country_name varchar(255),
  country_currency varchar(3),
  location_latitude decimal(10, 8),
  location_longitude decimal(11, 8),
  subdivisions_name varchar(255),
  state_name varchar(255),
  city_name varchar(255),
  created_date timestamp default current_timestamp not null,
  updated_date timestamp null on update current_timestamp,
  fk_profile_id varchar(20) not null,
  foreign key (fk_profile_id) references profile_info (profile_id)
);
create table visitor_sessions (
  session_id varchar(30) primary key,
  created_date timestamp default current_timestamp not null,
  last_active_date timestamp null,
  action_points int default 1 not null,
  end_date timestamp null,
  fk_visitor_id int not null,
  foreign key (fk_visitor_id) references visitors (visitor_id)
);
create table visitor_actions (
  action_id int auto_increment primary key,
  browser_name varchar(255),
  browser_version varchar(50),
  operating_system varchar(255),
  device_type varchar(255),
  device_details varchar(255),
  rendering_engine varchar(255),
  mobile_specific_info boolean default 0,
  created_date timestamp default current_timestamp not null,
  page_tag varchar(255),
  activity_tag varchar(255),
  action_tag varchar(255),
  fk_session_id varchar(30) not null,
  foreign key (fk_session_id) references visitor_sessions (session_id)
);