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
INSERT INTO profile_info (profile_id, full_name, name_subtitle, name_subtitle_highlight, nick_name, designation, intro_text, intro_image_url, resume_url, expertise_preference_title, expertise_preference_details, website_base_url, website_domain_name, contact_preference_details, address, phone, secondary_phone, email, alternative_email, facebook_url, github_url, linkedin_url, whatsapp_url, created_date, updated_date, delete_flag) VALUES ('farhan', 'Farhan Zaman', 'A curious', 'S O U L', 'Farhan', 'Software Engineer', 'A tech enthusiast, always ready for new challenges and
            quick learner. To know more about my works and interests check out my details.', 'https://farhanzaman.dev/view/static/intro.png', 'https://farhanzaman.dev/view/static/resume.pdf', 'Backend Development', 'Drawing upon a wide range of skills and technical proficiencies, I excel in
                problem solving, critical thinking, and effective teamwork. My expertise extends to encompass business
                communication, interpersonal skills, and adaptability in dynamic environments. Additionally, I possess
                leadership qualities, polished presentation skills, and a keen sense of creativity. Proficient in Java,
                PHP, JavaScript, Python, and other languages, I am well-versed in leveraging frameworks such as
                SpringBoot, ReactJS, NodeJS, and more. With a self-motivated and organized approach, I consistently
                demonstrate exceptional time management and the ability to excel in various projects.', 'https://farhanzaman.dev', 'farhanzaman.dev', 'For any professional inquiries or opportunities, or if you simply want to get in touch, please feel free to contact me using the provided contact details. I am readily available to discuss potential alliance, projects, or career prospects. Your interest is greatly appreciated, and I look forward to the possibility of working together.', '35, LAKECIRCUS, KALABAGAN, Dhaka, Bangladesh -1205', '(+880) 1521581368', '9876543210', 'fz.arnob@gmail.com', 'farhanzamanarnob@gmail.com', 'https://www.facebook.com/farhanzamanarnob/', 'https://github.com/FzArnob', 'https://www.linkedin.com/in/md-farhan-zaman/', 'https://wa.me/8801521581368', '2023-06-11 15:29:12', '2023-06-26 00:00:59', 0);
-- Insert data into the education_items table
INSERT INTO education_items (education_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, subject, activity, created_date, updated_date, delete_flag) VALUES (1, 'BRAC University', null, 'https://www.bracu.ac.bd/', '2022-05-29', null, 1, 'Studies MBA - Master in Business Administration', 'Specialization in Operation Management', '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);
INSERT INTO education_items (education_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, subject, activity, created_date, updated_date, delete_flag) VALUES (2, 'BRAC University', null, 'https://www.bracu.ac.bd/', null, '2022', 0, 'Studied Bachelor of Science in Computer Science and Engineering (CSE)', 'Former Senior Executive at BRAC University Community Service Club (BUCSC)', '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);
INSERT INTO education_items (education_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, subject, activity, created_date, updated_date, delete_flag) VALUES (3, 'Dhaka College', null, 'https://dhakacollege.edu.bd/', null, '2016', 0, 'Studied Science: High School (12th Grade)', 'Former General Secretary at Dhaka College Science Club (DCSC)', '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);
INSERT INTO education_items (education_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, subject, activity, created_date, updated_date, delete_flag) VALUES (4, 'Ideal School & College', null, 'https://iscm.edu.bd/', null, '2014', 0, 'Studied Science: Secondary School (10th Grade)', 'Received JSC Government Scholarship 2011', '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);

-- Insert data into the experience_items table
INSERT INTO experience_items (experience_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, position, project_details, project_text_1, project_text_2, project_text_3, project_url_1, project_url_2, project_url_3, created_date, updated_date, delete_flag) VALUES (1, 'BJIT Group', null, 'https://bjitgroup.com/', '2022-03-29', null, 1, 'Software Engineer', 'Core Backend Engineer', 'Pocketalk', null, null, 'https://www.pocketalk.com/', null, null, '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);
INSERT INTO experience_items (experience_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, position, project_details, project_text_1, project_text_2, project_text_3, project_url_1, project_url_2, project_url_3, created_date, updated_date, delete_flag) VALUES (2, 'Doodle Inc.', null, 'https://www.thedoodleinc.com/', '2021-09-01', '2022-02-28', 0, 'Former Full Stack Software Engineer and Developer', 'Serverless System Architect', 'Tribel (Social Platform)', null, null, 'https://www.tribel.com/', null, null, '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);
INSERT INTO experience_items (experience_id, institute_name, institute_std, institute_url, start_date, end_date, is_present, position, project_details, project_text_1, project_text_2, project_text_3, project_url_1, project_url_2, project_url_3, created_date, updated_date, delete_flag) VALUES (3, 'Forecast', null, 'https://www.facebook.com/forecast.org/', '2018-04-15', '2021-03-31', 0, 'Former Lecturer', 'Higher Mathematics Instructor and Physics Coordinator', null, null, null, null, null, null, '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);

-- Insert data into the expertise_items table
INSERT INTO expertise_items (name, description, duration, level)
VALUES ('Backend Development', 'Expertise in developing scalable and efficient backend systems.', 5, 'Expert');

-- Insert data into the skill_items table
INSERT INTO skill_items (name, description, duration, percentage)
VALUES ('Java', 'Proficient in Java programming language.', 5, 90);

-- Insert data into the achievement_items table
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (1, 'Java Selenium', 'TestDome is a provider of high-quality, online skills tests that use work-sample testing methodology to screen knowledge workers. Candidates are evaluated through small samples of actual work that show how they solve problems in the real world.', '2022-02-21', 'https://www.testdome.com/certificates/550c055c41aa429a88d9ea52f93f2228', 1, 'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://farhanzaman.dev/view/static/svg/selenium.svg');
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (2, 'IELTS', 'IELTS is the world’s most popular English language test.', '2022-02-21', 'https://www.britishcouncil.org.bd/en/exam/ielts', 1, 'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://farhanzaman.dev/view/static/svg/ielts.svg');
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (3, 'BeeCrowd: Competitive Programming', 'BeeCrowd is a global community of developers committed to keep evolving as students and professionals.', '2023-06-25', 'https://www.beecrowd.com.br/judge/en/profile/151481', 1, 'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://farhanzaman.dev/view/static/svg/beecrowd.svg');
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (4, 'Python', 'Python (Basic): It covers topics like Scalar Types, Operators and Control Flow, Strings, Collections and Iteration, Modularity, Objects and Types and Classes', '2021-12-02', 'https://www.hackerrank.com/certificates/3859fe77dc98', 1, 'Basic', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://farhanzaman.dev/view/static/svg/python.svg');
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (5, 'CSS', 'CSS: It covers topics like exploring Cascading and Inheritance, exploring text styling fundamentals, understanding the use of layouts in CSS, understand the boxing of elements in CSS, among others.', '2021-07-28', 'https://www.hackerrank.com/certificates/62b3d263cda5', 1, 'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://farhanzaman.dev/view/static/svg/css.svg');
INSERT INTO achievement_items (achievement_id, name, description, certification_date, certification_url, duration, level, created_date, updated_date, delete_flag, certification_logo) VALUES (6, 'JavaScript (Intermediate)', 'JavaScript (Intermediate): It covers topics like Design Patterns, Memory management, concurrency model, and event loops, among others.', '2022-02-15', 'https://www.hackerrank.com/certificates/ed1793e0e97a', 1, 'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'https://www.hackerrank.com/certificates/ed1793e0e97a');
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
INSERT INTO profile_education (fk_profile_id, fk_education_id) VALUES ('farhan', 1);
INSERT INTO profile_education (fk_profile_id, fk_education_id) VALUES ('farhan', 2);
INSERT INTO profile_education (fk_profile_id, fk_education_id) VALUES ('farhan', 3);
INSERT INTO profile_education (fk_profile_id, fk_education_id) VALUES ('farhan', 4);

-- Insert data into the profile_experience table
INSERT INTO profile_experience (fk_profile_id, fk_experience_id) VALUES ('farhan', 1);
INSERT INTO profile_experience (fk_profile_id, fk_experience_id) VALUES ('farhan', 2);
INSERT INTO profile_experience (fk_profile_id, fk_experience_id) VALUES ('farhan', 3);


-- Insert data into the profile_expertise table
INSERT INTO profile_expertise (fk_profile_id, fk_expertise_id)
VALUES ('farhan', 1);

-- Insert data into the profile_skill table
INSERT INTO profile_skill (fk_profile_id, fk_skill_id)
VALUES ('farhan', 1);

-- Insert data into the profile_achievement table
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 1);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 2);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 3);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 4);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 5);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id) VALUES ('farhan', 6);

-- Insert data into the profile_projects table
INSERT INTO profile_projects (fk_profile_id, fk_project_id)
VALUES ('farhan', 1);

-- Insert data into the profile_gallery_items table
INSERT INTO profile_gallery_items (fk_profile_id, fk_item_id)
VALUES ('farhan', 1);

-- Insert data into the profile_direct_messages table
INSERT INTO profile_direct_messages (fk_profile_id, fk_message_id)
VALUES ('farhan', 1);
