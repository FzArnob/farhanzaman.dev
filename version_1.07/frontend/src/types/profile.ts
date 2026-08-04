/** Shapes of /data/profile.json — identical to what the old profile_data.js exposed as `result`. */

export interface ProfileInfo {
  profile_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  designations: string[];
  intro_text: string;
  about_text: string;
  intro_image_url: string;
  resume_url: string;
  expertise_preference_details: string;
  website_base_url: string;
  website_domain_name: string;
  contact_preference_details: string;
  address: string;
  phone: string;
  secondary_phone: string;
  email: string;
  alternative_email: string;
  facebook_url: string;
  github_url: string;
  linkedin_url: string;
  whatsapp_url: string;
}

export interface Education {
  education_id: string;
  institute_name: string;
  institute_std: string | null;
  institute_url: string;
  start_date: string;
  end_date: string | null;
  is_present: string;
  subject: string;
  activity: string;
}

export interface Experience {
  experience_id: string;
  institute_name: string;
  institute_std: string | null;
  institute_url: string;
  start_date: string;
  end_date: string | null;
  is_present: string;
  position: string;
  project_details: string;
  project_text_1: string | null;
  project_text_2: string | null;
  project_text_3: string | null;
  project_url_1: string | null;
  project_url_2: string | null;
  project_url_3: string | null;
}

export interface Expertise {
  expertise_id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
}

export interface Skill {
  skill_id: string;
  name: string;
  description: string;
  duration: string;
  percentage: string;
}

export interface Achievement {
  achievement_id: string;
  name: string;
  description: string;
  certification_date: string;
  certification_url: string;
  certification_logo: string;
  duration: string;
  level: string;
}

export interface ProjectMedia {
  media_id: string;
  project_id: string;
  media_type: 'Image' | 'Vimeo' | string;
  media_link: string;
}

export interface Project {
  project_id: string;
  name: string;
  work_role: string;
  logo_image: string;
  type: string;
  stack: string;
  details: string;
  live_text: string | null;
  live_url: string | null;
  scope_of_work: string;
  source_url: string | null;
  start_date: string;
  current_status: string;
  methodology: string;
  last_contribution_date: string;
  tech_stack: string;
  challenges: string;
  future_scope: string | null;
  media: ProjectMedia[];
}

export interface GalleryItem {
  gallery_item_id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  thumb_url: string;
}

export interface Profile {
  info: ProfileInfo;
  educations: Education[];
  experiences: Experience[];
  expertises: Expertise[];
  skills: Skill[];
  achievements: Achievement[];
  projects: Project[];
  gallery: GalleryItem[];
}

export interface ProfileData {
  profile: Profile;
}

/** Education and Experience merged for the About page timeline. */
export type Qualification =
  | (Education & { type: 'education' })
  | (Experience & { type: 'experience' });
