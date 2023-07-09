INSERT INTO profile_info (profile_id, full_name, name_subtitle, name_subtitle_highlight, nick_name, designation,
                          intro_text, intro_image_url, resume_url, expertise_preference_title,
                          expertise_preference_details, website_base_url, website_domain_name,
                          contact_preference_details, address, phone, secondary_phone, email, alternative_email,
                          facebook_url, github_url, linkedin_url, whatsapp_url, created_date, updated_date, delete_flag)
VALUES ('farhan', 'Farhan Zaman', 'A curious', 'S O U L', 'Farhan', 'Software Engineer', 'A tech enthusiast, always ready for new challenges and
            quick learner. To know more about my works and interests check out my details.',
        'view/static/intro.png', 'view/static/resume.pdf',
        'Backend Development', 'Drawing upon a wide range of skills and technical proficiencies, I excel in
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
                             activity, created_date, updated_date, delete_flag)
VALUES ('BRAC University', null, 'https://www.bracu.ac.bd/', '2022-05-29', null, 1,
        'Studies MBA - Master in Business Administration', 'Specialization in Operation Management',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag)
VALUES ('BRAC University', null, 'https://www.bracu.ac.bd/', null, '2022', 0,
        'Studied Bachelor of Science in Computer Science and Engineering (CSE)',
        'Former Senior Executive at BRAC University Community Service Club (BUCSC)', '2023-06-26 01:02:30',
        '2023-06-26 01:02:30', 0);
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag)
VALUES ('Dhaka College', null, 'https://dhakacollege.edu.bd/', null, '2016', 0,
        'Studied Science: High School (12th Grade)', 'Former General Secretary at Dhaka College Science Club (DCSC)',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag)
VALUES ('Ideal School & College', null, 'https://iscm.edu.bd/', null, '2014', 0,
        'Studied Science: Secondary School (10th Grade)', 'Received JSC Government Scholarship 2011',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0);

INSERT INTO profile_education (fk_profile_id, fk_education_id)
VALUES ('farhan', 1);
INSERT INTO profile_education (fk_profile_id, fk_education_id)
VALUES ('farhan', 2);
INSERT INTO profile_education (fk_profile_id, fk_education_id)
VALUES ('farhan', 3);
INSERT INTO profile_education (fk_profile_id, fk_education_id)
VALUES ('farhan', 4);

INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag)
VALUES ('BJIT Group', null, 'https://bjitgroup.com/', '2022-03-29', null, 1, 'Software Engineer',
        'Core Backend Engineer', 'Pocketalk', null, null, 'https://www.pocketalk.com/', null, null,
        '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag)
VALUES ('Doodle Inc.', null, 'https://www.thedoodleinc.com/', '2021-09-01', '2022-02-28', 0,
        'Former Full Stack Software Engineer and Developer', 'Serverless System Architect', 'Tribel',
        null, null, 'https://www.tribel.com/', null, null, '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);
INSERT INTO experience_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, position,
                              project_details, project_text_1, project_text_2, project_text_3, project_url_1,
                              project_url_2, project_url_3, created_date, updated_date, delete_flag)
VALUES ('Forecast', null, 'https://www.facebook.com/forecast.org/', '2018-04-15', '2021-03-31', 0, 'Former Lecturer',
        'Higher Mathematics Instructor and Physics Coordinator', null, null, null, null, null, null,
        '2023-06-26 01:23:40', '2023-06-26 01:23:40', 0);

INSERT INTO profile_experience (fk_profile_id, fk_experience_id)
VALUES ('farhan', 1);
INSERT INTO profile_experience (fk_profile_id, fk_experience_id)
VALUES ('farhan', 2);
INSERT INTO profile_experience (fk_profile_id, fk_experience_id)
VALUES ('farhan', 3);

INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('Java Selenium',
        'TestDome is a provider of high-quality, online skills tests that use work-sample testing methodology to screen knowledge workers. Candidates are evaluated through small samples of actual work that show how they solve problems in the real world.',
        '2022-02-21', 'https://www.testdome.com/certificates/550c055c41aa429a88d9ea52f93f2228',
        'view/static/svg/selenium.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('IELTS', 'IELTS Score: 7.0 - Strong proficiency in English language demonstrated.', '2022-02-21',
        'https://www.britishcouncil.org.bd/en/exam/ielts', 'view/static/svg/ielts.svg', 1,
        'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('BeeCrowd: Competitive Programming',
        'BeeCrowd is a global community of developers committed to keep evolving as students and professionals.',
        '2023-06-25', 'https://www.beecrowd.com.br/judge/en/profile/151481',
        'view/static/svg/beecrowd.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('Python',
        'Python (Basic): It covers topics like Scalar Types, Operators and Control Flow, Strings, Collections and Iteration, Modularity, Objects and Types and Classes',
        '2021-12-02', 'https://www.hackerrank.com/certificates/3859fe77dc98',
        'view/static/svg/python.svg', 1, 'Basic', '2023-06-26 15:29:13', '2023-06-26 00:14:18',
        0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('CSS',
        'CSS: It covers topics like exploring Cascading and Inheritance, exploring text styling fundamentals, understanding the use of layouts in CSS, understand the boxing of elements in CSS, among others.',
        '2021-07-28', 'https://www.hackerrank.com/certificates/62b3d263cda5',
        'view/static/svg/css.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('JavaScript (Intermediate)',
        'JavaScript (Intermediate): It covers topics like Design Patterns, Memory management, concurrency model, and event loops, among others.',
        '2022-02-15', 'https://www.hackerrank.com/certificates/ed1793e0e97a',
        'view/static/svg/js.svg', 1, 'Intermediate', '2023-06-26 15:29:13',
        '2023-06-26 00:14:18', 0);
INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag)
VALUES ('Git', 'Efficiently manage Git projects, ensuring collaboration, version control, and seamless workflow for enhanced productivity.', '2022-02-21',
        'https://github.com/FzArnob?tab=achievements', 'view/static/svg/git.svg', 1,
        'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0);

INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 1);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 2);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 3);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 4);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 5);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 6);
INSERT INTO profile_achievement (fk_profile_id, fk_achievement_id)
VALUES ('farhan', 7);

INSERT INTO skill_items (name, description, duration, percentage)
VALUES ('Problem Solving', 'Proficient in identifying and analyzing problems, and developing effective solutions.', 12,
        92),
       ('Critical thinking', 'Skilled at evaluating situations objectively and making reasoned judgments.', 8, 80),
       ('Teamwork', 'Demonstrates strong collaboration and cooperation skills within a team setting.', 24, 78),
       ('Leadership', 'Experienced in leading teams and guiding them towards achieving common goals.', 36, 82),
       ('Interpersonal skills', 'Capable of building and maintaining positive relationships with others.', 18, 75),
       ('Adaptability', 'Quickly adapts to new environments and can adjust strategies as needed.', 10, 68),
       ('Business Communication', 'Effective communication skills for conveying information in a professional setting.',
        16, 85),
       ('Presentation skills', 'Skilled in delivering engaging and informative presentations to diverse audiences.', 14,
        88),
       ('Creativity', 'Displays innovative thinking and generates unique ideas for problem-solving.', 20, 72),
       ('Self-motivated', 'Highly self-driven and takes initiative to accomplish tasks and achieve goals.', 30, 78),
       ('Organizational skills', 'Efficiently manages time, resources, and tasks to meet objectives.', 12, 65),
       ('Time management', 'Adept at prioritizing tasks and meeting deadlines effectively.', 22, 82);

INSERT INTO profile_skill (fk_profile_id, fk_skill_id)
VALUES ('farhan', 1),
       ('farhan', 2),
       ('farhan', 3),
       ('farhan', 4),
       ('farhan', 5),
       ('farhan', 6),
       ('farhan', 7),
       ('farhan', 8),
       ('farhan', 9),
       ('farhan', 10),
       ('farhan', 11),
       ('farhan', 12);

INSERT INTO expertise_items (name, description, duration, level)
VALUES ('HTML', 'Hypertext Markup Language', 60, 'Beginner'),
       ('CSS', 'Cascading Style Sheets', 60, 'Beginner'),
       ('JavaScript', 'Client-side scripting language', 90, 'Intermediate'),
       ('TypeScript', 'Typed superset of JavaScript', 60, 'Intermediate'),
       ('Python', 'General-purpose programming language', 120, 'Intermediate'),
       ('Java', 'Object-oriented programming language', 120, 'Intermediate'),
       ('C++', 'General-purpose programming language', 90, 'Intermediate'),
       ('PHP', 'Server-side scripting language', 90, 'Intermediate'),
       ('SpringBoot', 'Java-based framework', 90, 'Intermediate'),
       ('ReactJS', 'JavaScript library for building UIs', 120, 'Advanced'),
       ('MongoDB', 'NoSQL database program', 90, 'Intermediate'),
       ('NodeJS', 'JavaScript runtime environment', 90, 'Intermediate'),
       ('MySQL', 'Relational database management system', 90, 'Intermediate'),
       ('NoSQL', 'Database management system', 60, 'Intermediate'),
       ('GraphQL', 'Query language for APIs', 60, 'Beginner'),
       ('Selenium', 'Web browser automation tool', 60, 'Beginner'),
       ('OOD', 'Object-oriented design', 90, 'Intermediate'),
       ('Redux', 'Predictable state container for JavaScript apps', 60, 'Intermediate'),
       ('jQuery', 'Fast, small, and feature-rich JavaScript library', 60, 'Beginner'),
       ('Photoshop', 'Raster graphics editor', 90, 'Intermediate'),
       ('Illustrator', 'Vector graphics editor', 90, 'Intermediate'),
       ('Excel', 'Spreadsheet program', 60, 'Beginner'),
       ('PowerPoint', 'Presentation software', 60, 'Beginner');

INSERT INTO profile_expertise (fk_profile_id, fk_expertise_id)
VALUES ('farhan', 1),
       ('farhan', 2),
       ('farhan', 3),
       ('farhan', 4),
       ('farhan', 5),
       ('farhan', 6),
       ('farhan', 7),
       ('farhan', 8),
       ('farhan', 9),
       ('farhan', 10),
       ('farhan', 11),
       ('farhan', 12),
       ('farhan', 13),
       ('farhan', 14),
       ('farhan', 15),
       ('farhan', 16),
       ('farhan', 17),
       ('farhan', 18),
       ('farhan', 19),
       ('farhan', 20),
       ('farhan', 21),
       ('farhan', 22),
       ('farhan', 23);


INSERT INTO gallery_items (name, description, category, image_url, thumb_url)
VALUES ('Sunset between the hills', 'A breathtaking view of the sunset amidst the hills.', 'Digital Arts',
        'https://live.staticflickr.com/65535/53008240645_415d39e51a_o.jpg',
        'https://live.staticflickr.com/65535/53008240645_9158c57f5a_w.jpg'),
       ('Bodhu', 'A beautiful oil painting depicting a serene scene.', 'Oil Paint',
        'https://live.staticflickr.com/65535/53008298725_e566d5d2bd_o.jpg',
        'https://live.staticflickr.com/65535/53008298725_55f592dc2b_w.jpg'),
       ('Reflection', 'A mesmerizing photograph capturing the reflection in still water.', 'Photography',
        'https://live.staticflickr.com/65535/53007845157_4f9c0e5b07_o.jpg',
        'https://live.staticflickr.com/65535/53007845157_087c478dfe_w.jpg'),
       ('Kumira Beach', 'A stunning photograph showcasing the beauty of Kumira Beach.', 'Photography',
        'https://live.staticflickr.com/65535/53008602744_b8fc8345d2_o.jpg',
        'https://live.staticflickr.com/65535/53008602744_2dd7d72b84_w.jpg'),
       ('Oh deer', 'A digital artwork featuring a majestic deer.', 'Digital Arts',
        'https://live.staticflickr.com/65535/53007855741_a3824f5385_o.jpg',
        'https://live.staticflickr.com/65535/53007855741_9a20ae7d07_c.jpg'),
       ('Womens Day', 'A captivating poster design celebrating Womens Day.', 'Poster',
        'https://live.staticflickr.com/65535/53007855606_7531027907_o.jpg',
        'https://live.staticflickr.com/65535/53007855606_2a5fba0a92_w.jpg'),
       ('BTF Blood Camp', 'A poster promoting a blood donation camp organized by BTF.', 'Poster',
        'https://live.staticflickr.com/65535/53008240370_039e88e8d0_o.jpg',
        'https://live.staticflickr.com/65535/53008240370_22496355a5_w.jpg'),
       ('Vegeta - Sketch', 'A charcoal art sketch depicting the character Vegeta.', 'Char Coal Art',
        'https://live.staticflickr.com/65535/53008024124_7531027907_o.jpg',
        'https://live.staticflickr.com/65535/53008024124_da44254ede.jpg'),
       ('Go Green', 'A social poster advocating for environmental conservation.', 'Social Poster',
        'https://live.staticflickr.com/65535/53008240395_18c302b598_o.jpg',
        'https://live.staticflickr.com/65535/53008240395_6467dbd81a_z.jpg'),
       ('Like A Begining', 'An oil painting capturing the essence of a new beginning.', 'Oil Paint',
        'https://live.staticflickr.com/65535/53007262607_ecc6d77e77_o.jpg',
        'https://live.staticflickr.com/65535/53007262607_0d46100c32_w.jpg'),
       ('Bottom Line', 'A striking photograph with a profound message.', 'Photography',
        'https://live.staticflickr.com/65535/53008414076_7bbb6a96f7_o.jpg',
        'https://live.staticflickr.com/65535/53008414076_6fbbfa1b05_z.jpg');

INSERT INTO profile_gallery_items (fk_profile_id, fk_item_id)
VALUES ('farhan', 1),
       ('farhan', 2),
       ('farhan', 3),
       ('farhan', 4),
       ('farhan', 5),
       ('farhan', 6),
       ('farhan', 7),
       ('farhan', 8),
       ('farhan', 9),
       ('farhan', 10),
       ('farhan', 11);

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('Pocketalk Console / Backend Engineer', 'Enterprise', 'Java Spring Boot',
        'Pocketalk is translation device and Console is a new administration panel that allows for fleet management and confirmation of intended use for major business users.',
        'https://bjitgroup.com/software-development-case-studies/pocketalk', null,
        'https://live.staticflickr.com/65535/53020376333_2b5719fc2e.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('Tribel / Full Stack', 'Cross', 'React & Node',
        'Tribel is the SMARTER social network where your posts immediately reach the right audience, you finally get the recognition you deserve for making great posts.',
        'https://www.tribel.com/', null,
        'https://live.staticflickr.com/65535/53020285535_915ef0dc8d.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('Moviease / Developer', 'Cross', 'React Native',
        'Moviease is a platform for online movie and TV show streaming. Students can create an account to participate in exams, where scores are recorded to prevent cheating. It is a cross-platform app under development science January 2022.',
        'https://fzs-lab.com/Moviease/', null,
        'https://live.staticflickr.com/65535/53011645857_38cec70212.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1KNuuqWz09Le1deRa1u68WGF5RbSnvQua',
        'https://drive.google.com/uc?export=view&id=1H4NNhZ5oy1Zsyw46HIgKgDzqsViuv-V4',
        'https://drive.google.com/uc?export=view&id=1x6nK6sp3nq-D3e1krNo7zfRHmOxjOmV_');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1)
VALUES ('Simba Chatbot / Developer', 'Machine Learning', 'Python',
        'Simba Chatbot is an automated response generating chatbot developed using the DialoGPT-large model. It interacts like a human and involves refining and preprocessing custom datasets. The project has been active since December 2021 for a duration of 2 months.',
        null, 'https://github.com/FzArnob/Chatbot-Simba',
        'https://live.staticflickr.com/65535/53012612530_3747ce77e1.jpg', 2,
        'https://drive.google.com/uc?export=view&id=1W6A_W5DwVDd5W2BLc71XzvpfeY764uRS');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('NinjaHopper / Developer', 'Web', 'JavaScript',
        'NinjaHopper is a simple and fun 2D arcade game suitable for both kids and adults. The game is built using HTML, CSS, JavaScript, and 2D SVG images. A future version is planned to include a multiplayer mode. Development of NinjaHopper took place in June 2021 over a duration of 1 month.',
        'https://fzs-lab.com/NinjaHopper/', null,
        'https://live.staticflickr.com/65535/53012233046_5d91731867.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1_PTfDoBEHdu8y98lEWSYtlBx_BRc55ef',
        'https://drive.google.com/uc?export=view&id=1kfSq8xkbCOSYi4-Bu7Rc94He4nkDqDpj',
        'https://drive.google.com/uc?export=view&id=1ydWkIb765cOpWJrOOIGXRc8Zbh5G82Sw');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2)
VALUES ('CovidEase / Team Leader', 'Mobile', 'React Native',
        'CovidEase is a mobile app developed as part of the ICT Innovation Fest. It provides Corona Virus related service information to the people of Bangladesh, collecting and presenting data from private and government health service institutions. The project utilizes Java Script, React, Firebase Real-Time Database, React Animation Add-ons, and Google Maps API. It was developed over a period of 2 months starting from June 2020.',
        null, 'https://www.youtube.com/watch?v=eRuBO6WmqV4',
        'https://live.staticflickr.com/65535/53012710548_c1b97d9f48.jpg', 2,
        'https://drive.google.com/uc?export=view&id=1NsCr0yluaM8v1cRbuLRnOcGMmqpdB8-Z',
        'https://drive.google.com/uc?export=view&id=1pT8j25YT7jIoCOQ474JGZUbjFDCdcdnB');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('Examiner / Developer', 'Web', 'PHP',
        'Examiner is a real-time virtual platform for taking MCQ-based exams. It is designed for ease of use by both teachers and students. The project, developed using PHP, CSS, HTML, and JavaScript, follows the MVC pattern and incorporates object-oriented programming principles. Features include account creation, submission of answers, automated completion, live score assessment, and more. Development spanned 3 months, starting from September 2020.',
        'https://fzs-lab.com/Examiner', null,
        'https://live.staticflickr.com/65535/53012612545_7553f6762f.jpg', 3,
        'https://drive.google.com/uc?export=view&id=1MAAcQfNVrd47__RVlxbFmFLnuHddVtc-',
        'https://drive.google.com/uc?export=view&id=1hSDKx2ZbTrK6RgQmKralNkHZSJC_POWC',
        'https://drive.google.com/uc?export=view&id=1gL-TsOFhWO4AB-34xUkI3WaIw5I9x2rD');

INSERT INTO projects (name, type, stack, details, live_url, demo_url, logo_image, duration, additional_image_1,
                      additional_image_2, additional_image_3)
VALUES ('QR Queen / Developer', 'Mobile', 'Kodular',
        'QR Queen is a versatile app for creating QR codes with customizable colors and sizes. It allows saving results in various image formats, including vector art formats. The app records all scanned codes and offers scan history. Other features include code encryption, sharing, barcode conversion, and offline scan storage. QR Queen is a mobile app developed over a month, starting from May 2020.',
        'https://play.google.com/store/apps/details?id=com.sunny.qr', null,
        'https://live.staticflickr.com/65535/53012396049_ce14507917.jpg', 1,
        'https://drive.google.com/uc?export=view&id=1zmu8elNALUGMcYZWIOEJ3EUT7SlG7llL',
        'https://drive.google.com/uc?export=view&id=17HJa1we3_E0QGEUyQXz03OH2tXO9fw2o',
        'https://drive.google.com/uc?export=view&id=1n9LrciBVdCf_aEpFcT-A8ybBW7qpTrTG');


INSERT INTO profile_projects (fk_profile_id, fk_project_id)
VALUES ('farhan', 1),
       ('farhan', 2),
       ('farhan', 3),
       ('farhan', 4),
       ('farhan', 5),
       ('farhan', 6),
       ('farhan', 7),
       ('farhan', 8);