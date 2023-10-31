INSERT INTO profile_info (profile_id, full_name, first_name, last_name, nick_name, designations,
                          intro_text, intro_image_url, resume_url, expertise_preference_details, website_base_url, website_domain_name,
                          contact_preference_details, address, phone, secondary_phone, email, alternative_email,
                          facebook_url, github_url, linkedin_url, whatsapp_url, created_date, updated_date, delete_flag)
VALUES ('farhan', 'Farhan Zaman', 'Farhan', 'Zaman', 'Arnob', 'Software Engineer,Researcher,Programmer,System Architect,Designer', 'A tech enthusiast, always ready for new challenges and
            quick learner. To know more about my works and interests check out my details.',
        'view/static/intro.png', 'view/static/resume.pdf', 'Drawing upon a wide range of skills and technical proficiencies, I excel in
                problem solving, critical thinking, and effective teamwork. My expertise extends to encompass business
                communication, interpersonal skills, and adaptability in dynamic environments. Additionally, I possess
                leadership qualities, polished presentation skills, and a keen sense of creativity. Proficient in Java,
                PHP, JavaScript, Python, and other languages, I am well-versed in leveraging frameworks such as
                SpringBoot, ReactJS, NodeJS, and more. With a self-motivated and organized approach, I consistently
                demonstrate exceptional time management and the ability to excel in various projects.',
        'https://farhanzaman.dev', 'farhanzaman.dev',
        'For any professional inquiries or opportunities, or if you simply want to get in touch, please feel free to contact me using the provided contact details. I am readily available to discuss potential alliance, projects, or career prospects. Your interest is greatly appreciated, and I look forward to the possibility of working together.',
        '35, LAKECIRCUS, KALABAGAN, Dhaka, Bangladesh -1205', '(+880) 1521581368', '9876543210', 'fz.arnob@gmail.com',
        'farhanzamanarnob@gmail.com', 'https://www.facebook.com/farhanzamanarnob/', 'https://github.com/FzArnob',
        'https://www.linkedin.com/in/md-farhan-zaman/', 'https://wa.me/8801521581368', '2023-06-11 15:29:12',
        '2023-06-26 00:00:59', 0);

INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('BRAC University', null, 'https://www.bracu.ac.bd/', '2022-05-29', null, 1,
        'Studies MBA - Master in Business Administration', 'Specialization in Operation Management',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0, 'farhan');
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('BRAC University', null, 'https://www.bracu.ac.bd/', null, '2022', 0,
        'Studied Bachelor of Science in Computer Science and Engineering (CSE)',
        'Former Senior Executive at BRAC University Community Service Club (BUCSC)', '2023-06-26 01:02:30',
        '2023-06-26 01:02:30', 0, 'farhan');
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Dhaka College', null, 'https://dhakacollege.edu.bd/', null, '2016', 0,
        'Studied Science: High School (12th Grade)', 'Former General Secretary at Dhaka College Science Club (DCSC)',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0, 'farhan');
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Ideal School & College', null, 'https://iscm.edu.bd/', null, '2014', 0,
        'Studied Science: Secondary School (10th Grade)', 'Received JSC Government Scholarship 2011',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0, 'farhan');


-- Corrected inserts for experience_items table
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('BJIT Group', null, 'https://bjitgroup.com/', '2022-03-29', null, 1, 'Software Engineer',
        'Core Backend Engineer', 'Pocketalk', null, null, 'https://www.pocketalk.com/', null, null,
        '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0, 'farhan');
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Doodle Inc.', null, 'https://www.thedoodleinc.com/', '2021-09-01', '2022-02-28', 0,
        'Former Full Stack Software Engineer and Developer', 'Serverless System Architect', 'Tribel',
        null, null, 'https://www.tribel.com/', null, null, '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0, 'farhan');
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Forecast', null, 'https://www.facebook.com/forecast.org/', '2018-04-15', '2021-03-31', 0, 'Former Lecturer',
        'Higher Mathematics Instructor and Physics Coordinator', null, null, null, null, null, null,
        '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0, 'farhan');


-- Corrected inserts for achievement_items table
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Java Selenium',
        'TestDome is a provider of high-quality, online skills tests that use work-sample testing methodology to screen knowledge workers. Candidates are evaluated through small samples of actual work that show how they solve problems in the real world.',
        '2022-02-21', 'https://www.testdome.com/certificates/550c055c41aa429a88d9ea52f93f2228',
        'view/static/svg/selenium.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('IELTS', 'IELTS Score: 7.0 - Strong proficiency in English language demonstrated.', '2022-02-21',
        'https://www.britishcouncil.org.bd/en/exam/ielts', 'view/static/svg/ielts.svg', 1,
        'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('BeeCrowd: Competitive Programming',
        'BeeCrowd is a global community of developers committed to keep evolving as students and professionals.',
        '2023-06-25', 'https://www.beecrowd.com.br/judge/en/profile/151481',
        'view/static/svg/beecrowd.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Python',
        'Python (Basic): It covers topics like Scalar Types, Operators and Control Flow, Strings, Collections and Iteration, Modularity, Objects and Types and Classes',
        '2021-12-02', 'https://www.hackerrank.com/certificates/3859fe77dc98',
        'view/static/svg/python.svg', 1, 'Basic', '2023-06-26 15:29:13', '2023-06-26 00:14:18',
        0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('CSS',
        'CSS: It covers topics like exploring Cascading and Inheritance, exploring text styling fundamentals, understanding the use of layouts in CSS, understand the boxing of elements in CSS, among others.',
        '2021-07-28', 'https://www.hackerrank.com/certificates/62b3d263cda5',
        'view/static/svg/css.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('JavaScript (Intermediate)',
        'JavaScript (Intermediate): It covers topics like Design Patterns, Memory management, concurrency model, and event loops, among others.',
        '2022-02-15', 'https://www.hackerrank.com/certificates/ed1793e0e97a',
        'view/static/svg/js.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0, 'farhan');
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Git', 'Efficiently manage Git projects, ensuring collaboration, version control, and seamless workflow for enhanced productivity.', '2022-02-21',
        'https://github.com/FzArnob?tab=achievements', 'view/static/svg/git.svg', 1,
        'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'farhan');


INSERT INTO skill_items (name, description, duration, percentage, fk_profile_id)
VALUES ('Problem Solving', 'Proficient in identifying and analyzing problems, and developing effective solutions.', 12, 92, 'farhan'),
       ('Critical thinking', 'Skilled at evaluating situations objectively and making reasoned judgments.', 8, 80, 'farhan'),
       ('Teamwork', 'Demonstrates strong collaboration and cooperation skills within a team setting.', 24, 78, 'farhan'),
       ('Leadership', 'Experienced in leading teams and guiding them towards achieving common goals.', 36, 82, 'farhan'),
       ('Interpersonal skills', 'Capable of building and maintaining positive relationships with others.', 18, 75, 'farhan'),
       ('Adaptability', 'Quickly adapts to new environments and can adjust strategies as needed.', 10, 68, 'farhan'),
       ('Business Communication', 'Effective communication skills for conveying information in a professional setting.', 16, 85, 'farhan'),
       ('Presentation skills', 'Skilled in delivering engaging and informative presentations to diverse audiences.', 14, 88, 'farhan'),
       ('Creativity', 'Displays innovative thinking and generates unique ideas for problem-solving.', 20, 72, 'farhan'),
       ('Self-motivated', 'Highly self-driven and takes initiative to accomplish tasks and achieve goals.', 30, 78, 'farhan'),
       ('Organizational skills', 'Efficiently manages time, resources, and tasks to meet objectives.', 12, 65, 'farhan'),
       ('Time management', 'Adept at prioritizing tasks and meeting deadlines effectively.', 22, 82, 'farhan');


INSERT INTO expertise_items (name, description, duration, level, fk_profile_id)
VALUES ('HTML', 'Hypertext Markup Language', 60, 'Beginner', 'farhan'),
       ('CSS', 'Cascading Style Sheets', 60, 'Beginner', 'farhan'),
       ('JavaScript', 'Client-side scripting language', 90, 'Intermediate', 'farhan'),
       ('TypeScript', 'Typed superset of JavaScript', 60, 'Intermediate', 'farhan'),
       ('Python', 'General-purpose programming language', 120, 'Intermediate', 'farhan'),
       ('Java', 'Object-oriented programming language', 120, 'Intermediate', 'farhan'),
       ('C++', 'General-purpose programming language', 90, 'Intermediate', 'farhan'),
       ('PHP', 'Server-side scripting language', 90, 'Intermediate', 'farhan'),
       ('SpringBoot', 'Java-based framework', 90, 'Intermediate', 'farhan'),
       ('ReactJS', 'JavaScript library for building UIs', 120, 'Advanced', 'farhan'),
       ('MongoDB', 'NoSQL database program', 90, 'Intermediate', 'farhan'),
       ('NodeJS', 'JavaScript runtime environment', 90, 'Intermediate', 'farhan'),
       ('MySQL', 'Relational database management system', 90, 'Intermediate', 'farhan'),
       ('NoSQL', 'Database management system', 60, 'Intermediate', 'farhan'),
       ('GraphQL', 'Query language for APIs', 60, 'Beginner', 'farhan'),
       ('Selenium', 'Web browser automation tool', 60, 'Beginner', 'farhan'),
       ('OOD', 'Object-oriented design', 90, 'Intermediate', 'farhan'),
       ('Redux', 'Predictable state container for JavaScript apps', 60, 'Intermediate', 'farhan'),
       ('jQuery', 'Fast, small, and feature-rich JavaScript library', 60, 'Beginner', 'farhan'),
       ('Photoshop', 'Raster graphics editor', 90, 'Intermediate', 'farhan'),
       ('Illustrator', 'Vector graphics editor', 90, 'Intermediate', 'farhan'),
       ('Excel', 'Spreadsheet program', 60, 'Beginner', 'farhan'),
       ('PowerPoint', 'Presentation software', 60, 'Beginner', 'farhan');


INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Sunset between the hills', 'A breathtaking view of the sunset amidst the hills.', 'Digital Arts',
        'https://live.staticflickr.com/65535/53008240645_415d39e51a_o.jpg',
        'https://live.staticflickr.com/65535/53008240645_9158c57f5a_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Bodhu', 'A beautiful oil painting depicting a serene scene.', 'Oil Paint',
        'https://live.staticflickr.com/65535/53008298725_e566d5d2bd_o.jpg',
        'https://live.staticflickr.com/65535/53008298725_55f592dc2b_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Reflection', 'A mesmerizing photograph capturing the reflection in still water.', 'Photography',
        'https://live.staticflickr.com/65535/53007845157_4f9c0e5b07_o.jpg',
        'https://live.staticflickr.com/65535/53007845157_087c478dfe_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Kumira Beach', 'A stunning photograph showcasing the beauty of Kumira Beach.', 'Photography',
        'https://live.staticflickr.com/65535/53008602744_b8fc8345d2_o.jpg',
        'https://live.staticflickr.com/65535/53008602744_2dd7d72b84_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Oh deer', 'A digital artwork featuring a majestic deer.', 'Digital Arts',
        'https://live.staticflickr.com/65535/53007855741_a3824f5385_o.jpg',
        'https://live.staticflickr.com/65535/53007855741_9a20ae7d07_c.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Womens Day', 'A captivating poster design celebrating Womens Day.', 'Poster',
        'https://live.staticflickr.com/65535/53007855606_7531027907_o.jpg',
        'https://live.staticflickr.com/65535/53007855606_2a5fba0a92_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('BTF Blood Camp', 'A poster promoting a blood donation camp organized by BTF.', 'Poster',
        'https://live.staticflickr.com/65535/53008240370_039e88e8d0_o.jpg',
        'https://live.staticflickr.com/65535/53008240370_22496355a5_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Vegeta - Sketch', 'A charcoal art sketch depicting the character Vegeta.', 'Char Coal Art',
        'https://live.staticflickr.com/65535/53008024124_7531027907_o.jpg',
        'https://live.staticflickr.com/65535/53008024124_da44254ede.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Go Green', 'A social poster advocating for environmental conservation.', 'Social Poster',
        'https://live.staticflickr.com/65535/53008240395_18c302b598_o.jpg',
        'https://live.staticflickr.com/65535/53008240395_6467dbd81a_z.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Like A Begining', 'An oil painting capturing the essence of a new beginning.', 'Oil Paint',
        'https://live.staticflickr.com/65535/53007262607_ecc6d77e77_o.jpg',
        'https://live.staticflickr.com/65535/53007262607_0d46100c32_w.jpg', 'farhan');
INSERT INTO gallery_items (name, description, category, image_url, thumb_url, fk_profile_id)
VALUES ('Bottom Line', 'A striking photograph with a profound message.', 'Photography',
        'https://live.staticflickr.com/65535/53008414076_7bbb6a96f7_o.jpg',
        'https://live.staticflickr.com/65535/53008414076_6fbbfa1b05_z.jpg', 'farhan');




INSERT INTO projects (name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, work_plan, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ('Pocketalk Ventana', 
        'Backend Engineer', 
        'https://live.staticflickr.com/65535/53020376333_2b5719fc2e.jpg', 
        'Enterprise', 
        'Web', 
        'The Pocketalk Ventana project represents a significant endeavor in the realm of web applications, tailored to meet the specific needs of corporate users seeking enhanced business communication and cost reduction through the management of Pocketalk translation devices. Developed in collaboration with Sourcenext, a prominent software publisher in Japan, this application stands as a pivotal tool in streamlining the management and control of Pocketalk devices.<br /> At its core, Pocketalk Ventana offers an array of essential features that empower users to maximize their Pocketalk device investments. The application boasts an aesthetically pleasing and informative dashboard that serves as a focal point for users, presenting a wealth of statistics crucial for effective device management. In addition, the Device Manager provides a comprehensive device information panel along with a translation history section, enabling users to delve deep into the performance of their devices.<br /> The Group Manager feature simplifies the task of organizing Pocketalk devices by offering a user-friendly group list and a group creation panel. This bulk management capability ensures that corporate users can efficiently configure and control multiple devices simultaneously, saving both time and effort. Furthermore, the Group Remote Settings feature enables remote configuration of group settings, adding to the convenience of managing large fleets of devices.<br /> For in-depth insights, the application offers a Report Section encompassing a variety of data frequency reports, including Times Translated, Translation From, Translation To, and Export Log Data. These reports provide essential information for businesses to make informed decisions and assess the return on investment from using Pocketalk devices.<br /> User profile management and the presence of both individual and corporate profiles within the application emphasize personalization and usability, as users can tailor the application to their specific needs. Moreover, the notification features, consisting of both bell and email notifications, serve as a vital component for keeping users informed about critical events and updates within the application.<br /> Ensuring the highest level of data security, the implementation of a dynamic role-based security system offers administrators the ability to control feature-wise access limits, protecting sensitive information and safeguarding the integrity of the application.<br /> All these features are underpinned by a robust technological infrastructure that includes Java, Spring Boot, JWT, OAuth, GCP (Google Cloud Platform), CloudSQL, BigQuery, Firestore, PubSub, AWS (Amazon Web Services), SES (Simple Email Service), SQS (Simple Queue Service), and S3 (Simple Storage Service). This amalgamation of cutting-edge technologies and versatile features culminates in the creation of the Pocketalk Ventana application, a powerful solution that equips corporate users to harness the full potential of Pocketalk devices, optimizing their business communications and driving significant cost savings.', 
        'Goto App', 
        'https://console.pocketalk.com/login', 
        'Scope of Work', 
        'Work Plan', 
        '2022-10-03', 
        'In Deployment', 
        'Scrum (2 weeks/sprint)', 
        '2023-10-30', 
        'Java,Spring Boot,JWT,OAuth,CSRF,GCP,CloudSQL,BigQuery,Firestore,PubSub,AWS SES,AWS SQS,AWS S3,Kubernetes', 
        'Scalability,Dynamic Security Implementation', 
        'Voice and Speech Recognition,Accessibility Features,Global Localization', 
        'farhan');
SET @project_id = LAST_INSERT_ID();
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_hero.webp'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_device_setup_v2.webp'),
(@project_id, 'Vimeo', 'https://player.vimeo.com/video/846133318?dnt=1&app_id=122963&controls=1&hd=1&autohide=1'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_reports.webp'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_transcript_history.webp');


INSERT INTO projects (name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, work_plan, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ('Tribel', 
        'Full Stack Engineer', 
        'https://live.staticflickr.com/65535/53020285535_915ef0dc8d.jpg', 
        'Social', 
        'Cross-Platform', 
        'The Pocketalk Ventana project represents a significant endeavor in the realm of web applications, tailored to meet the specific needs of corporate users seeking enhanced business communication and cost reduction through the management of Pocketalk translation devices. Developed in collaboration with Sourcenext, a prominent software publisher in Japan, this application stands as a pivotal tool in streamlining the management and control of Pocketalk devices.<br /> At its core, Pocketalk Ventana offers an array of essential features that empower users to maximize their Pocketalk device investments. The application boasts an aesthetically pleasing and informative dashboard that serves as a focal point for users, presenting a wealth of statistics crucial for effective device management. In addition, the Device Manager provides a comprehensive device information panel along with a translation history section, enabling users to delve deep into the performance of their devices.<br /> The Group Manager feature simplifies the task of organizing Pocketalk devices by offering a user-friendly group list and a group creation panel. This bulk management capability ensures that corporate users can efficiently configure and control multiple devices simultaneously, saving both time and effort. Furthermore, the Group Remote Settings feature enables remote configuration of group settings, adding to the convenience of managing large fleets of devices.<br /> For in-depth insights, the application offers a Report Section encompassing a variety of data frequency reports, including Times Translated, Translation From, Translation To, and Export Log Data. These reports provide essential information for businesses to make informed decisions and assess the return on investment from using Pocketalk devices.<br /> User profile management and the presence of both individual and corporate profiles within the application emphasize personalization and usability, as users can tailor the application to their specific needs. Moreover, the notification features, consisting of both bell and email notifications, serve as a vital component for keeping users informed about critical events and updates within the application.<br /> Ensuring the highest level of data security, the implementation of a dynamic role-based security system offers administrators the ability to control feature-wise access limits, protecting sensitive information and safeguarding the integrity of the application.<br /> All these features are underpinned by a robust technological infrastructure that includes Java, Spring Boot, JWT, OAuth, GCP (Google Cloud Platform), CloudSQL, BigQuery, Firestore, PubSub, AWS (Amazon Web Services), SES (Simple Email Service), SQS (Simple Queue Service), and S3 (Simple Storage Service). This amalgamation of cutting-edge technologies and versatile features culminates in the creation of the Pocketalk Ventana application, a powerful solution that equips corporate users to harness the full potential of Pocketalk devices, optimizing their business communications and driving significant cost savings.', 
        'Visit Web', 
        'https://console.pocketalk.com/login', 
        'Scope of Work', 
        'Work Plan', 
        '2022-10-03', 
        'In Deployment', 
        'Scrum (2 weeks/sprint)', 
        '2023-10-30', 
        'Java,Spring Boot,JWT,OAuth,CSRF,GCP,CloudSQL,BigQuery,Firestore,PubSub,AWS SES,AWS SQS,AWS S3,Kubernetes', 
        'Scalability,Dynamic Security Implementation', 
        'Voice and Speech Recognition,Accessibility Features,Global Localization', 
        'farhan');
SET @project_id = LAST_INSERT_ID();
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_hero.webp'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_device_setup_v2.webp'),
(@project_id, 'Vimeo', 'https://player.vimeo.com/video/846133318?dnt=1&app_id=122963&controls=1&hd=1&autohide=1'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_reports.webp'),
(@project_id, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_transcript_history.webp');


















INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3, fk_profile_id)
VALUES ('Pocketalk Console / Backend Engineer', 'Enterprise', 'Java Spring Boot',
        'Pocketalk is translation device and ventana is a new administration panel that allows for fleet management and confirmation of intended use for major business users.',
        'https://bjitgroup.com/software-development-case-studies/pocketalk', null,
        'https://live.staticflickr.com/65535/53020376333_2b5719fc2e.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3, fk_profile_id)
VALUES ('Tribel / Full Stack', 'Cross', 'React & Node',
        'Tribel is the SMARTER social network where your posts immediately reach the right audience, you finally get the recognition you deserve for making great posts.',
        'https://www.tribel.com/', null,
        'https://live.staticflickr.com/65535/53020285535_915ef0dc8d.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3, fk_profile_id)
VALUES ('Moviease / Developer', 'Cross', 'React Native',
        'Moviease is a platform for online movie and TV show streaming. Students can create an account to participate in exams, where scores are recorded to prevent cheating. It is a cross-platform app under development science January 2022.',
        'https://fzs-lab.com/Moviease/', null,
        'https://live.staticflickr.com/65535/53011645857_38cec70212.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1, fk_profile_id)
VALUES ('Simba Chatbot / Developer', 'Machine Learning', 'Python',
        'Simba Chatbot is an automated response generating chatbot developed using the DialoGPT-large model. It interacts like a human and involves refining and preprocessing custom datasets. The project has been active since December 2021 for a duration of 2 months.',
        null, 'https://github.com/FzArnob/Chatbot-Simba',
        'https://live.staticflickr.com/65535/53012612530_3747ce77e1.jpg', 2,
        'https://drive.google.com/uc?export=view&id=1W6A_W5DwVDd5W2BLc71XzvpfeY764uRS', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, fk_profile_id)
VALUES ('NinjaHopper / Developer', 'Web', 'JavaScript',
        'NinjaHopper is a simple and fun 2D arcade game suitable for both kids and adults. The game is built using HTML, CSS, JavaScript, and 2D SVG images. A future version is planned to include a multiplayer mode. Development of NinjaHopper took place in June 2021 over a duration of 1 month.',
        'https://fzs-lab.com/NinjaHopper/', null,
        'https://live.staticflickr.com/65535/53012233046_5d91731867.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1_PTfDoBEHdu8y98lEWSYtlBx_BRc55ef',
        'https://drive.google.com/uc?export=view&id=1kfSq8xkbCOSYi4-Bu7Rc94He4nkDqDpj', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, fk_profile_id)
VALUES ('CovidEase / Team Leader', 'Mobile', 'React Native',
        'CovidEase is a mobile app developed as part of the ICT Innovation Fest. It provides Corona Virus related service information to the people of Bangladesh, collecting and presenting data from private and government health service institutions. The project utilizes Java Script, React, Firebase Real-Time Database, React Animation Add-ons, and Google Maps API. It was developed over a period of 2 months starting from June 2020.',
        null, 'https://www.youtube.com/watch?v=eRuBO6WmqV4',
        'https://live.staticflickr.com/65535/53012710548_c1b97d9f48.jpg', 2,
        'https://drive.google.com/uc?export=view&id=1NsCr0yluaM8v1cRbuLRnOcGMmqpdB8-Z',
        'https://drive.google.com/uc?export=view&id=1pT8j25YT7jIoCOQ474JGZUbjFDCdcdnB', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3, fk_profile_id)
VALUES ('Examiner / Developer', 'Web', 'PHP',
        'Examiner is a real-time virtual platform for taking MCQ-based exams. It is designed for ease of use by both teachers and students. The project, developed using PHP, CSS, HTML, and JavaScript, follows the MVC pattern and incorporates object-oriented programming principles. Features include account creation, submission of answers, automated completion, live score assessment, and more. Development spanned 3 months, starting from September 2020.',
        'https://fzs-lab.com/Examiner', null,
        'https://live.staticflickr.com/65535/53012612545_7553f6762f.jpg', 3,
        'https://drive.google.com/uc?export=view&id=1MAAcQfNVrd47__RVlxbFmFLnuHddVtc-',
        'https://drive.google.com/uc?export=view&id=1hSDKx2ZbTrK6RgQmKralNkHZSJC_POWC',
        'https://drive.google.com/uc?export=view&id=1gL-TsOFhWO4AB-34xUkI3WaIw5I9x2rD', 'farhan');
INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3, fk_profile_id)
VALUES ('QR Queen / Developer', 'Mobile', 'Kodular',
        'QR Queen is a versatile app for creating QR codes with customizable colors and sizes. It allows saving results in various image formats, including vector art formats. The app records all scanned codes and offers scan history. Other features include code encryption, sharing, barcode conversion, and offline scan storage. QR Queen is a mobile app developed over a month, starting from May 2020.',
        'https://play.google.com/store/apps/details?id=com.sunny.qr', null,
        'https://live.staticflickr.com/65535/53012396049_ce14507917.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1zmu8elNALUGMcYZWIOEJ3EUT7SlG7llL',
        'https://drive.google.com/uc?export=view&id=17HJa1we3_E0QGEUyQXz03OH2tXO9fw2o',
        'https://drive.google.com/uc?export=view&id=1n9LrciBVdCf_aEpFcT-A8ybBW7qpTrTG', 'farhan');