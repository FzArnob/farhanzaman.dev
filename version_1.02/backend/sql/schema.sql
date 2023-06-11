-- Schema basic tables

CREATE TABLE profile_info
(
    profile_id                   VARCHAR(20) PRIMARY KEY,
    full_name                    VARCHAR(255),
    name_subtitle                VARCHAR(255),
    name_subtitle_highlight      VARCHAR(255),
    nick_name                    VARCHAR(50),
    designation                  VARCHAR(255),
    intro_text                   TEXT,
    intro_image_url              VARCHAR(255),
    resume_url                   VARCHAR(255),
    expertise_preference_title   VARCHAR(255),
    expertise_preference_details TEXT,
    website_base_url             VARCHAR(255),
    website_domain_name          VARCHAR(255),
    contact_preference_details   TEXT,
    address                      VARCHAR(255),
    phone                        VARCHAR(20),
    secondary_phone              VARCHAR(20),
    email                        VARCHAR(255) NOT NULL UNIQUE,
    alternative_email            VARCHAR(255),
    facebook_url                 VARCHAR(255),
    github_url                   VARCHAR(255),
    linkedin_url                 VARCHAR(255),
    whatsapp_url                 VARCHAR(255),
    created_date                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag                  BOOLEAN   DEFAULT FALSE
);


CREATE TABLE education_items
(
    education_id   INT PRIMARY KEY AUTO_INCREMENT,
    institute_name VARCHAR(255),
    institute_std  VARCHAR(50),
    institute_url  VARCHAR(255),
    start_date     DATE,
    end_date       DATE,
    is_present     BOOLEAN,
    subject        VARCHAR(255),
    activity       VARCHAR(255),
    created_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag    BOOLEAN   DEFAULT FALSE
);

CREATE TABLE experience_items
(
    experience_id   INT PRIMARY KEY AUTO_INCREMENT,
    institute_name  VARCHAR(255),
    institute_std   VARCHAR(50),
    institute_url   VARCHAR(255),
    start_date      DATE,
    end_date        DATE,
    is_present      BOOLEAN,
    position        VARCHAR(255),
    project_details TEXT,
    project_text_1  VARCHAR(255),
    project_text_2  VARCHAR(255),
    project_text_3  VARCHAR(255),
    project_url_1   VARCHAR(255),
    project_url_2   VARCHAR(255),
    project_url_3   VARCHAR(255),
    created_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag     BOOLEAN   DEFAULT FALSE
);

CREATE TABLE expertise_items
(
    expertise_id INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255),
    description  TEXT,
    duration     INT,
    level        VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag  BOOLEAN   DEFAULT FALSE
);

CREATE TABLE skill_items
(
    skill_id     INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255),
    description  TEXT,
    duration     INT,
    percentage   INT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag  BOOLEAN   DEFAULT FALSE
);

CREATE TABLE achievement_items
(
    achievement_id     INT PRIMARY KEY AUTO_INCREMENT,
    name               VARCHAR(255),
    description        TEXT,
    certification_date DATE,
    certification_url  VARCHAR(255),
    duration           INT,
    level              VARCHAR(50),
    created_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag        BOOLEAN   DEFAULT FALSE
);

CREATE TABLE projects
(
    project_id         INT PRIMARY KEY AUTO_INCREMENT,
    name               VARCHAR(255),
    type               VARCHAR(100),
    stack              VARCHAR(255),
    details            TEXT,
    live_url           VARCHAR(255),
    demo_url           VARCHAR(255),
    logo_image         VARCHAR(255),
    duration           INT,
    additional_image_1 VARCHAR(255),
    additional_image_2 VARCHAR(255),
    additional_image_3 VARCHAR(255),
    additional_image_4 VARCHAR(255),
    additional_image_5 VARCHAR(255),
    created_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag        BOOLEAN   DEFAULT FALSE
);

CREATE TABLE gallery_items
(
    item_id      INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255),
    description  TEXT,
    category     VARCHAR(100),
    image_url    VARCHAR(255),
    thumb_url    VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag  BOOLEAN   DEFAULT FALSE
);

CREATE TABLE direct_messages
(
    message_id  INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delete_flag BOOLEAN   DEFAULT FALSE
);

-- Relational Mapping

CREATE TABLE profile_education
(
    fk_profile_id   VARCHAR(20),
    fk_education_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_education_id) REFERENCES education_items (education_id)
);

CREATE TABLE profile_experience
(
    fk_profile_id    VARCHAR(20),
    fk_experience_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_experience_id) REFERENCES experience_items (experience_id)
);

CREATE TABLE profile_expertise
(
    fk_profile_id   VARCHAR(20),
    fk_expertise_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_expertise_id) REFERENCES expertise_items (expertise_id)
);

CREATE TABLE profile_skill
(
    fk_profile_id VARCHAR(20),
    fk_skill_id   INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_skill_id) REFERENCES skill_items (skill_id)
);

CREATE TABLE profile_achievement
(
    fk_profile_id   VARCHAR(20),
    fk_achievement_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_achievement_id) REFERENCES achievement_items (achievement_id)
);

CREATE TABLE profile_projects
(
    fk_profile_id VARCHAR(20),
    fk_project_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_project_id) REFERENCES projects (project_id)
);

CREATE TABLE profile_gallery_items
(
    fk_profile_id VARCHAR(20),
    fk_item_id    INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_item_id) REFERENCES gallery_items (item_id)
);

CREATE TABLE profile_direct_messages
(
    fk_profile_id VARCHAR(20),
    fk_message_id INT,
    FOREIGN KEY (fk_profile_id) REFERENCES profile_info (profile_id),
    FOREIGN KEY (fk_message_id) REFERENCES direct_messages (message_id)
);

-- Insert data into the profile_info table
INSERT INTO profile_info (profile_id, full_name, name_subtitle, name_subtitle_highlight, nick_name, designation, intro_text, intro_image_url, resume_url, expertise_preference_title, expertise_preference_details, website_base_url, website_domain_name, contact_preference_details, address, phone, secondary_phone, email, alternative_email, facebook_url, github_url, linkedin_url, whatsapp_url)
VALUES ('farhan', 'Farhan Zaman', 'A curious ', 'S O U L', 'Farhan', 'Software Engineer', 'A tech enthusiast, always ready for new challenges and quick learner. To know more about my works and interests check out my details.', 'https://example.com/intro_image.jpg', 'https://example.com/resume.pdf', 'Backend Development', 'I have 5 years of experience in building scalable and efficient backend systems.', 'https://example.com', 'example.com', 'Preferred contact via email or phone.', '123 Main St, City, Country', '1234567890', '9876543210', 'john.doe@example.com', 'johndoe@gmail.com', 'https://www.facebook.com/johndoe', 'https://github.com/johndoe', 'https://www.linkedin.com/in/johndoe', 'https://wa.me/1234567890');

-- Insert data into the education_items table
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject, activity)
VALUES ('University of ABC', 'Bachelor of Science', 'https://example.com/university', '2015-09-01', '2019-06-30', false, 'Computer Science', 'Participated in various programming competitions.');

-- Insert data into the experience_items table
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position, project_details, project_text_1, project_text_2, project_text_3, project_url_1, project_url_2, project_url_3)
VALUES ('XYZ Company', 'Senior Software Engineer', 'https://example.com/company', '2019-07-01', '2022-12-31', false, 'Senior Software Engineer', 'Worked on developing a high-performance backend system.', 'Implemented data caching', 'Optimized database queries', 'Implemented RESTful APIs', 'https://example.com/project1', 'https://example.com/project2', 'https://example.com/project3');

-- Insert data into the expertise_items table
INSERT INTO expertise_items (name, description, duration, level)
VALUES ('Backend Development', 'Expertise in developing scalable and efficient backend systems.', 5, 'Expert');

-- Insert data into the skill_items table
INSERT INTO skill_items (name, description, duration, percentage)
VALUES ('Java', 'Proficient in Java programming language.', 5, 90);

-- Insert data into the achievement_items table
INSERT INTO achievement_items (name, description, certification_date, certification_url, duration, level)
VALUES ('Certification XYZ', 'Received certification for completing XYZ course.', '2020-05-15', 'https://example.com/certification', 1, 'Intermediate');

-- Insert data into the projects table
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1, additional_image_2, additional_image_3, additional_image_4, additional_image_5)
VALUES ('Project XYZ', 'Web Application', 'Node.js, Express, MongoDB', 'A web application for managing tasks and projects.', 'https://example.com/live', 'https://example.com/demo', 'https://example.com/logo.jpg', 6, 'https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg', 'https://example.com/image4.jpg', 'https://example.com/image5.jpg');

-- Insert data into the gallery_items table
INSERT INTO gallery_items (name, description, category, image_url, thumb_url)
VALUES ('Image 1', 'Description of image 1', 'Nature', 'https://example.com/image1.jpg', 'https://example.com/thumb1.jpg');

-- Insert data into the direct_messages table
INSERT INTO direct_messages (name, email, subject, message)
VALUES ('Jane Smith', 'jane.smith@example.com', 'Regarding Project Inquiry', 'I am interested in discussing a potential project with you.');

-- Insert data into the relational tables

-- Insert data into the profile_education table
INSERT INTO profile_education (fk_profile_id, fk_education_id)
VALUES ('farhan', 1);

-- Insert data into the profile_experience table
INSERT INTO profile_experience (fk_profile_id, fk_experience_id)
VALUES ('farhan', 1);

-- Insert data into the profile_expertise table
INSERT INTO profile_expertise (fk_profile_id, fk_expertise_id)
VALUES ('farhan', 1);

-- Insert data into the profile_skill table
INSERT INTO profile_skill (fk_profile_id, fk_skill_id)
VALUES ('farhan', 1);

-- Insert data into the profile_achievement table
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 1);

-- Insert data into the profile_projects table
INSERT INTO profile_projects (fk_profile_id, fk_project_id)
VALUES ('farhan', 1);

-- Insert data into the profile_gallery_items table
INSERT INTO profile_gallery_items (fk_profile_id, fk_item_id)
VALUES ('farhan', 1);

-- Insert data into the profile_direct_messages table
INSERT INTO profile_direct_messages (fk_profile_id, fk_message_id)
VALUES ('farhan', 1);
