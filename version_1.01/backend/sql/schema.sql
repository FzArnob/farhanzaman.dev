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

