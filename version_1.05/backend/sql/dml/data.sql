INSERT INTO profile_info (profile_id, full_name, first_name, last_name, nick_name, designations,
                          intro_text, about_text, intro_image_url, resume_url, expertise_preference_details, website_base_url, website_domain_name,
                          contact_preference_details, address, phone, secondary_phone, email, alternative_email,
                          facebook_url, github_url, linkedin_url, whatsapp_url, created_date, updated_date, delete_flag)
VALUES ('farhan', 'Farhan Zaman', 'Farhan', 'Zaman', 'Arnob', 'Software Engineer,Researcher,Programmer,Art Enthusiast', 'A passionate problemm solver, always eager to take on complex challenges and consistently demonstrating a proactive approach to learning.', 'From a young age, my curiosity for technology and mathematics has been the driving force that led me tothe world of programming and problem-solving, where challenges fuel my passion. Programming is my forte,and I have delved into the realms of Machine Learning and Artificial intelligence, contributing toresearch in Human Posture Classification. As a software engineer, I aspire to fuse AI and Computer Visioninto the software industry, anticipating a future where AI revolutionizes software solutions. Beyond tech,I indulge in arts, digital arts, and photography. In college, I took on the role of General Secretary forthe Dhaka College Science Club (DCSC), organizing science fairs, while in university, I passionatelycontributed to impactful social initiatives as a Sr. Executive of the Brac University Community ServiceClub (BUCSC).',
        'view/static/intro.png', 'view/static/farhanzaman_resume.pdf', 'Drawing upon a wide range of skills and technical proficiencies, I excel in
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
VALUES ('BRAC University', null, 'https://www.bracu.ac.bd/', '2017-01-04', '2022-01-19', 0,
        'Studied Bachelor of Science in Computer Science and Engineering (CSE)',
        'Former Senior Executive at BRAC University Community Service Club (BUCSC)', '2023-06-26 01:02:30',
        '2023-06-26 01:02:30', 0, 'farhan');
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Dhaka College', null, 'https://dhakacollege.edu.bd/', '2014', '2016', 0,
        'Studied Science: High School (12th Grade)', 'Former General Secretary at Dhaka College Science Club (DCSC)',
        '2023-06-26 01:02:30', '2023-06-26 01:02:30', 0, 'farhan');
INSERT INTO education_items (institute_name, institute_std, institute_url, start_date, end_date, is_present, subject,
                             activity, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Ideal School & College', null, 'https://iscm.edu.bd/', '2009', '2014', 0,
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

INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('Codeforces', 'Regularly participated in competitive problem solving contest.', '2023-11-20',
        'https://codeforces.com/profile/farhanzamanarnob', 'view/static/svg/codeforces.svg', 1,
        'Intermediate', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'farhan');

INSERT INTO achievement_items (name, description, certification_date, certification_url, certification_logo, duration,
                               level, created_date, updated_date, delete_flag, fk_profile_id)
VALUES ('SQL', 'It covers topics like query optimization, data modeling, Indexing, window functions, and pivots in SQL.', '2023-08-14',
        'https://www.hackerrank.com/certificates/46b43016daff', 'view/static/svg/sql.svg', 1,
        'Advanced', '2023-06-26 15:29:13', '2023-06-26 00:14:18', 0, 'farhan');


INSERT INTO skill_items (name, description, duration, percentage, fk_profile_id)
VALUES ('Problem Solving', 'Proficient in identifying and analyzing problems, and developing effective solutions.', 12, 72, 'farhan'),
       ('Critical thinking', 'Skilled at evaluating situations objectively and making reasoned judgments.', 8, 60, 'farhan'),
       ('Teamwork', 'Demonstrates strong collaboration and cooperation skills within a team setting.', 24, 68, 'farhan'),
       ('Leadership', 'Experienced in leading teams and guiding them towards achieving common goals.', 36, 70, 'farhan'),
       ('Interpersonal skills', 'Capable of building and maintaining positive relationships with others.', 18, 75, 'farhan'),
       ('Adaptability', 'Quickly adapts to new environments and can adjust strategies as needed.', 10, 68, 'farhan'),
       ('Business Communication', 'Effective communication skills for conveying information in a professional setting.', 16, 50, 'farhan'),
       ('Presentation skills', 'Skilled in delivering engaging and informative presentations to diverse audiences.', 14, 88, 'farhan'),
       ('Creativity', 'Displays innovative thinking and generates unique ideas for problem-solving.', 20, 72, 'farhan'),
       ('Self-motivated', 'Highly self-driven and takes initiative to accomplish tasks and achieve goals.', 30, 60, 'farhan'),
       ('Organizational skills', 'Efficiently manages time, resources, and tasks to meet objectives.', 12, 65, 'farhan'),
       ('Time management', 'Adept at prioritizing tasks and meeting deadlines effectively.', 22, 60, 'farhan');


INSERT INTO expertise_items (name, description, duration, level, fk_profile_id)
VALUES 
('HTML', 'Fundamental for web structuring and layouts. Used in CovidEase and Tribel.', 36, 'Beginner', 'farhan'),
('CSS', 'Defines web document presentation. Implemented in Tribel and CovidEase.', 36, 'Beginner', 'farhan'),
('JavaScript', 'Essential for dynamic client-side functionalities. Used in Space Ninja and Tribel.', 30, 'Intermediate', 'farhan'),
('TypeScript', 'Typed superset of JavaScript for code reliability. Complements JavaScript.', 6, 'Intermediate', 'farhan'),
('Python', 'Versatile language used in Simba (CSA) for AI models and data tasks.', 26, 'Intermediate', 'farhan'),
('Java', 'Crucial for robust backend systems. Integral in Pocketalk Ventana, CovidEase, and C Academy TMS.', 48, 'Intermediate', 'farhan'),
('Java EE', 'Enterprise-grade Java applications. Employed in Pocketalk Ventana.', 20, 'Intermediate', 'farhan'),
('PHP', 'Pivotal for backend operations in CovidEase and Examiner.', 36, 'Intermediate', 'farhan'),
('SpringBoot', 'Enables rapid development of production-ready apps. Deployed in Pocketalk Ventana.', 24, 'Intermediate', 'farhan'),
('ReactJS', 'Builds UI in Tribel and C Academy TMS for responsiveness.', 24, 'Advanced', 'farhan'),
('MongoDB', 'Flexible data storage in multiple projects.', 3, 'Intermediate', 'farhan'),
('NodeJS', 'Enables server-side execution in Tribel.', 6, 'Intermediate', 'farhan'),
('MySQL', 'Efficient data storage in Pocketalk Ventana, Examiner and Tribel.', 30, 'Intermediate', 'farhan'),
('NoSQL', 'Flexible data handling in Pocketalk Ventana.', 6, 'Intermediate', 'farhan'),
('GraphQL', 'Facilitates efficient data retrieval in Tribel.', 6, 'Beginner', 'farhan'),
('Selenium', 'Automation tool for web browser testing.', 3, 'Beginner', 'farhan'),
('OOP', 'Foundation for scalable code architectures.', 48, 'Intermediate', 'farhan'),
('Redux', 'Manages app state and data flow in Tribel.', 20, 'Intermediate', 'farhan'),
('jQuery', 'Simplifies HTML document manipulation in Space Ninja.', 6, 'Beginner', 'farhan'),
('Photoshop', 'Crafts visuals for CovidEase ensuring pixel-perfect designs.', 48, 'Intermediate', 'farhan'),
('Illustrator', 'Contributes to scalable visuals in Space Ninja.', 36, 'Intermediate', 'farhan'),
('Excel', 'Harmonizes and organizes data sets in various projects.', 48, 'Beginner', 'farhan'),
('PowerPoint', 'Crafts impactful narratives in project presentations.', 32, 'Beginner', 'farhan');



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




INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 1, 'Pocketalk Ventana', 
        'Backend Engineer', 
        'https://live.staticflickr.com/65535/53020376333_2b5719fc2e.jpg', 
        'Enterprise', 
        'Web', 
        'The Pocketalk Ventana project represents a significant endeavor in the realm of web applications, tailored to meet the specific needs of corporate users seeking enhanced business communication and cost reduction through the management of Pocketalk translation devices. Developed in collaboration with Sourcenext, a prominent software publisher in Japan, this application stands as a pivotal tool in streamlining the management and control of Pocketalk devices.<br /> At its core, Pocketalk Ventana offers an array of essential features that empower users to maximize their Pocketalk device investments. The application boasts an aesthetically pleasing and informative dashboard that serves as a focal point for users, presenting a wealth of statistics crucial for effective device management. In addition, the Device Manager provides a comprehensive device information panel along with a translation history section, enabling users to delve deep into the performance of their devices.<br /> The Group Manager feature simplifies the task of organizing Pocketalk devices by offering a user-friendly group list and a group creation panel. This bulk management capability ensures that corporate users can efficiently configure and control multiple devices simultaneously, saving both time and effort. Furthermore, the Group Remote Settings feature enables remote configuration of group settings, adding to the convenience of managing large fleets of devices.<br /> For in-depth insights, the application offers a Report Section encompassing a variety of data frequency reports, including Times Translated, Translation From, Translation To, and Export Log Data. These reports provide essential information for businesses to make informed decisions and assess the return on investment from using Pocketalk devices.<br /> User profile management and the presence of both individual and corporate profiles within the application emphasize personalization and usability, as users can tailor the application to their specific needs. Moreover, the notification features, consisting of both bell and email notifications, serve as a vital component for keeping users informed about critical events and updates within the application.<br /> Ensuring the highest level of data security, the implementation of a dynamic role-based security system offers administrators the ability to control feature-wise access limits, protecting sensitive information and safeguarding the integrity of the application.<br /> All these features are underpinned by a robust technological infrastructure that includes Java, Spring Boot, JWT, OAuth, GCP (Google Cloud Platform), CloudSQL, BigQuery, Firestore, PubSub, AWS (Amazon Web Services), SES (Simple Email Service), SQS (Simple Queue Service), and S3 (Simple Storage Service). This amalgamation of cutting-edge technologies and versatile features culminates in the creation of the Pocketalk Ventana application, a powerful solution that equips corporate users to harness the full potential of Pocketalk devices, optimizing their business communications and driving significant cost savings.', 
        'Goto App', 
        'https://console.pocketalk.com/login', 
        'Develop a common enterprize management system for large scale corporations to provide remote control and monitor all pocketalk devices.', 
        null, 
        '2022-10-03', 
        'In Deployment', 
        'Scrum (2 weeks/sprint)', 
        'Present', 
        'Java,Spring Boot,AOP,Spring Security,JPA,SQL,JWT,OAuth,CSRF,GCP CloudSQL,GCP BigQuery,GCP Firestore,GCP PubSub,AWS S3,AWS SES,AWS SQS,AWS S3,Kubernetes', 
        'Pubsub Integration,Dynamic Role Based Security Implementation', 
        'Voice and Speech Recognition,Accessibility Features,Global Localization', 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(1, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_hero.webp'),
(1, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/07/pocketalk_ventana_device_setup_v2.webp'),
(1, 'Vimeo', 'https://player.vimeo.com/video/846133318?dnt=1&app_id=122963&controls=1&hd=1&autohide=1'),
(1, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_reports.webp'),
(1, 'Image', 'https://www.pocketalk.com/wp-content/uploads/2023/06/pocketalk_ventana_transcript_history.webp');


INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 2, 'Tribel', 
        'Full Stack Engineer', 
        'https://live.staticflickr.com/65535/53020285535_915ef0dc8d.jpg', 
        'Social', 
        'Cross', 
        'Tribel is a groundbreaking social network that redefines the way users connect and share content. With a mission to provide immediate content reach to the right audience, Tribel empowers users to gain the recognition they deserve for their exceptional posts. The platform offers a dynamic experience with four distinct feed categories, facilitating personalized content discovery. Users can create, edit, and engage with their posts, manage their connections, and establish and administer groups.<br/><b>Contributions to the Project:</b><br/>Over a period of six months, I have actively contributed to the development of various features that have enriched the functionality, providing users with a unique and enhanced social networking experience.<br/>Multiple Feed Categories: I spearheaded the creation of a dynamic feed system that segments content into four distinct categories: Friends, Following, Breaking, and Trending. This categorization ensures that users can effortlessly engage with content that aligns with their interests.<br/>Category-wise Search Mechanism: To enhance user experience, I introduced a category-wise search mechanism that empowers users to quickly locate content relevant to their preferences.<br/>User Profile Wall Posts: I designed and implemented a comprehensive user profile management system, enabling users to create, edit, view, delete, like, and comment on their own posts. This feature empowers users to maintain control over their content and interactions.<br/>User Security with AWS Cognito: Security and user authentication are of paramount importance. I integrated AWS Cognito for robust user security and privacy protection.<br/>Group Management: I established a robust group management system that permits users to create, delete, and manage groups seamlessly. Users can add, remove, or block other members, fostering community building.<br/>User Relationship Management: My contributions extended to user relationship management, allowing users to efficiently manage their connections on the platform. Users can add friends, follow other users, or block individuals as per their preferences.<br/><b>Technologies Utilized:</b><br/>AWS Lambda and DynamoDB: I leveraged AWS Lambda for serverless backend development, ensuring scalability and cost-efficiency. DynamoDB served as the database for efficient data storage and management using GSI.<br/>AWS AppSync and GraphQL: The combination of AWS AppSync and GraphQL enabled real-time data synchronization, providing users with a seamless and responsive experience.<br/>Node.js: For serverless backend development, I utilized Node.js, capitalizing on its performance and developer-friendly environment.<br/>React.js and Redux: For the frontend, React.js is used and integrated Redux for state management, delivering a dynamic and interactive user interface.', 
        'Developer Profile', 
        'https://www.tribel.com/farhanzaman/wall', 
        'Create multi-category feed with extensive searching mechanism and migrating backend in a serverless architechture.', 
        null, 
        '2021-09-19', 
        'In Deployment', 
        'Agile', 
        '2022-02-26', 
        'Node JS,React JS,CSS,Redux,GraphQL,AWS Lambda,AWS AppSync,AWS DynamoDB,AWS Cognito,AWS S3', 
        'Scalability,Using GSI properly', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(2, 'Image', 'https://www.searchlogistics.com/wp-content/uploads/2023/05/tribel-social-app.png'),
(2, 'Image', 'https://a.fsdn.com/con/app/proj/tribel.s/screenshots/Screen%20Shot%202022-10-27%20at%2012.18.45%20PM.png/1000/auto/1'),
(2, 'Video', 'https://dcd73ta2suabk.cloudfront.net/rw2ykeh6e78t3t977cyljssrpbda'),
(2, 'Image', 'https://assets-global.website-files.com/6503827bcc02f7772d249bf0/650ac6c1b4c46618d7137faa_2.png'),
(2, 'Image', 'https://live.staticflickr.com/65535/53307126345_e4cd895199_c.jpg');

INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 3, 'Simba(CSA)', 
        'Researcher', 
        'https://live.staticflickr.com/65535/53012612530_3747ce77e1.jpg', 
        'NLP', 
        'Language Model', 
        'Simba (CSA) stands as a novel NLP venture, primarily centered on enhancing the performance of the microsoft/DialoGPT-large pretrained model. This endeavor aims to tailor the model for a specific niche: serving as a Consumer Support Agent (CSA) in the domain of e-commerce platforms. Its blueprint involves a meticulous sequence of stages to fine-tune the model using a bespoke dataset derived from authentic customer support conversations.<br/>The journey commences by loading the DialoGPT-large model alongside its tokenizer. Subsequently, the dataset, meticulously crafted from real-life e-commerce support dialogues, undergoes preprocessing. Each entry in the dataset encapsulates a conversation context and the corresponding response, ensuring it is structured suitably for training.<br/>Tokenization becomes the gateway to transforming the dataset into a format compatible with the model. Leveraging the tokenizer, the conversational data is tokenized, setting the stage for the subsequent fine-tuning phase.<br/>Fine-tuning, a pivotal stage in this development, unfolds through the application of the Trainer API from the transformers library. Here, the model delves into the intricacies of the custom dataset, adjusting its parameters and weights to better comprehend and generate responses aligned with e-commerce customer support nuances. Configurable training arguments such as batch size, learning rate, and epochs are fine-tuned themselves to optimize the adaptation of the model to specific support context.<br/>The culmination of this arduous process results in a fine-tuned model, now imbued with a specialized understanding of e-commerce customer support dialogues. Saving this refined model preserves its acquired knowledge for future utilization.<br/>Post-fine-tuning, a rigorous testing phase ensues. The saved model is loaded along with its tokenizer for inference testing. Simulating real-world scenarios, the model is put to the test with new information, gauging its proficiency in comprehending and generating appropriate responses in the e-commerce support landscape.<br/>In essence, Simba (CSA) represents an ambitious journey of customizing a powerful pretrained model, arming it with the adeptness to serve as a dedicated e-commerce Customer Support Agent through meticulous dataset curation, fine-tuning, and rigorous testing protocols.', 
        'Findings', 
        'https://github.com/FzArnob/Chatbot-Simba', 
        'Gather a effective data set for fine tuning and generate the CSA model with better accuracy.', 
        'https://github.com/FzArnob/Chatbot-Simba', 
        '2021-12-30', 
        'On Going', 
        'Research & Development', 
        'Present', 
        'Python,pandas,csv,torch,transformers lib', 
        'Data Variance', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(3, 'Image', 'https://live.staticflickr.com/65535/53012399104_3f8662c960_o.png'),
(3, 'Image', 'https://live.staticflickr.com/65535/53352915259_21828b6a56_o.jpg');

INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 4, 'CovidEase', 
        'Team Leader', 
        'https://live.staticflickr.com/65535/53012710548_c1b97d9f48.jpg', 
        'Health', 
        'Android', 
        'CovidEase stands as a mobile app born out of the ICT Innovation Fest, a testament to technological innovation aimed at addressing the challenges posed by the COVID-19 pandemic in Bangladesh. Developed with a keen focus on providing vital Coronavirus-related service information, CovidEase serves as a comprehensive resource, amalgamating data from both private and government health service institutions.<br/><b>Backend Technology Stack:</b><br/>I employed Java for Android development, ensuring a seamless and efficient mobile experience. For data scraping, PHP was utilized, enabling the app to collect and present information from various sources. The integration of Firebase Realtime Database facilitated real-time updates, crucial for delivering accurate and timely information to users. Additionally, Google Maps API was harnessed to provide a location-based and visually intuitive representation of medical service information.<br/><b>Frontend Technology Stack:</b><br/>On the frontend, I utilized HTML, Vanilla CSS Library, and JavaScript to craft an engaging user interface. The use of Kodular Creator, a visual programming platform, streamlined the development process, contributing to overall accessibility and ease of use.<br/><b>Key Features:</b><br/>CovidEase encompasses several key features designed to meet the diverse needs of its users:<br/>Map View with Filtered Medical Service Info: The app offers a map view with filters for various medical service statuses, including the availability of corona units, testing places, lockdown status, and more. This feature ensures users can access specific information tailored to their requirements.<br/>Emergency Contacts: Users can swiftly access all essential emergency contacts, providing a quick reference in critical situations.<br/>Visualizing Disease Status: The app provides a comprehensive visual representation of the overall status of the disease. This feature aids users in understanding the current situation at a glance.<br/>Latest News Updates: CovidEase keeps users informed with the latest news, fostering an environment of awareness and preparedness.<br/>Learnings:<br/>My journey with CovidEase not only allowed me to contribute to a socially impactful project but also provided valuable learning experiences. The integration of diverse technologies, from Java and PHP to Firebase and Google Maps API, enriched my technical skill set. Crafting the frontend with HTML, CSS, and JavaScript honed my abilities in creating intuitive user interfaces. The collaborative nature of the project within the ICT Innovation Fest further enhanced my teamwork and problem-solving skills. This experience solidified my belief in potential of technology to address real-world challenges and ignited a passion for contributing to projects with a societal impact.', 
        'Download App', 
        'https://github.com/FzArnob/Covidease/blob/main/release/CovidEaseV1_2107.apk', 
        'CovidEase project encompassed developing a comprehensive mobile app to provide vital COVID-19-related service information by amalgamating data from various health service institutions in Bangladesh.', 
        'https://github.com/FzArnob/Covidease', 
        '2021-06-15', 
        'V1.2107 Released', 
        'Agile', 
        '2021-08-30', 
        'Block Coding,Firebase,Java,HTML,CSS,PHP,Scraping', 
        'Real-Time Data Collection', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(4, 'Image', 'https://live.staticflickr.com/65535/53012615880_faf739ba72_h.jpg'),
(4, 'Image', 'https://live.staticflickr.com/65535/53012615835_d860723031_h.jpg'),
(4, 'Vimeo', 'https://player.vimeo.com/video/879670605'),
(4, 'Image', 'https://live.staticflickr.com/65535/53011648862_2b908e4f52_h.jpg'),
(4, 'Image', 'https://live.staticflickr.com/65535/53323030189_51ada478c3_h.jpg'),
(4, 'Image', 'https://live.staticflickr.com/65535/53323030179_0cc2065caf_h.jpg');


INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 5, 'C Academy TMS', 
        'Developer', 
        'https://live.staticflickr.com/65535/53324609719_205bc13f8b_w.jpg', 
        'Education', 
        'Web', 
        'The Training Management System (TMS) project was an innovative initiative aimed at revolutionizing the training industry by streamlining daily operations and delivering efficient training. The system was designed for a hypothetical corporation, C Academy, and was built using a robust technology stack.</br>The <b>backend</b> of the TMS was developed using Spring Boot, with Spring Security and JWT Tokens ensuring secure user authentication. The system followed a REST architecture, with JPA and Lombok simplifying database operations. Hibernate ORM was used for object-relational mapping, and Multipart Rest enabled handling of multipart/form-data requests.</br>The <b>frontend</b> was built using React JS, with the Vanilla CSS Library providing styling. React Router, React Hooks, React Events, and React Functional Components were used to create a dynamic and interactive user interface. Cookies and Redux were used for state management, while Axios handled HTTP requests. Regex validation ensured data integrity.</br><b>Key Features:</b></br>The TMS boasts several key features aimed at optimizing training operations:</br>Trainee Selection (Application): I played a crucial role in simplifying the trainee application process, streamlining onboarding for efficient and quick integration into the training program.</br>User Management: The system centralizes user data, providing administrators with a comprehensive tool for seamless control and organization.</br>Profile Management: I contributed to the development of personalized profiles, enabling trainees to track and manage their individual progress and information.</br>Course Management: The system allows for easy administration of courses, ensuring a structured and organized training curriculum.</br>Batch Management: I streamlined the handling of training batches, optimizing scheduling and coordination for enhanced efficiency.</br>Assignment and Performance Evaluation: My contributions extend to the development of effective tracking and evaluation tools for assignments and trainee performance.</br>Training Data Management: The TMS offers comprehensive management of both previous and upcoming training data, providing valuable insights for informed decision-making.</br>Working on this project was a significant learning experience. It provided me with hands-on experience in developing a full-stack application, and allowed me to gain a deep understanding of both frontend and backend technologies. I learned how to effectively manage and organize user data, and how to create a dynamic and interactive user interface. I also gained valuable insights into the importance of secure user authentication and data integrity. This project was a testament to the power of modern technology in transforming industries and driving efficiency. It was a challenging yet rewarding experience that has significantly contributed to my growth as a developer.', 
        'Download Bundle', 
        'https://farhanzaman.dev/tms/tms.zip', 
        'Developing a comprehensive platform to streamline training operations for C Academy through efficient user management, course administration, performance evaluation, and data organization.', 
        'https://github.com/FzArnob/Training-Management-System', 
        '2022-10-03', 
        'Open Source', 
        'Scrum', 
        '2023-10-30', 
        'Spring Boot,Spring Security,Jwt Token,Rest Architecture,JPA,Lombok,Hibernate ORM,Multipart,Java AOP,Selenium,React Js,Vanila CSS Library,React Router,React Hooks,React Events,React Functional Components,Cookies,Redux,Axios,Regex validation', 
        'Architecture Design', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(5, 'Image', 'https://live.staticflickr.com/65535/53348141401_0398b1eea0_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348590390_76746b2982_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348462934_ed083875df_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348462944_c6d87f262d_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265247_6ab0f068f9_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348141406_f5ee3ef84b_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265262_c7a7f25a53_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265287_698e6ee68a_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348371643_e87f02de81_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348371653_c568c87be4_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348141456_b75bc62227_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348590485_0184a1d27f_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348463024_b87afd60da_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348590475_f25e66456d_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265347_70d55dc7ab_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265342_dab057333a_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348371718_9024fa914c_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348590510_6aa9db24d9_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53348141506_c26ba73f56_o.png'),
(5, 'Image', 'https://live.staticflickr.com/65535/53347265372_63a94c2cdb_o.png');


INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 6, 'Examiner', 
        'Developer', 
        'https://live.staticflickr.com/65535/53012612545_7553f6762f.jpg', 
        'Education', 
        'Web', 
        'Examiner is a real-time, virtual platform tailored for Multiple-Choice Question (MCQ) based exams, I assumed a pivotal role as the primary developer. This dynamic solution caters specifically to the needs of educational institutions, furnishing students with a secure and streamlined environment for exam participation. Simultaneously, it equips administrators with robust tools for efficient exam management.</br>Contributions to the Project:</br>In this project, I utilized a combination of PHP, CSS, HTML, and JavaScript/jQuery to create a robust and user-friendly platform. The key features I worked on include:</br>User Account Creation and Exam Participation: I implemented a user account system, allowing students to create accounts for exam participation. This feature ensures a personalized experience, with exam scores recorded for future reference and analysis.</br>Anti-Cheating Measures: To maintain the integrity of exams, I developed a system to allow students to submit their answers only once, preventing any attempts to cheat. This ensures a fair and secure examination process.</br>Automatic Submission on Time Expiry: I implemented a time-bound automatic submission feature, ensuring that once the allocated time slot for an exam concludes, submissions are completed automatically. This not only streamlines the process but also prevents any discrepancies due to delayed submissions.</br>Live Score Assessment: The platform provides real-time score assessment, allowing students to track their performance instantly. This feature enhances the exam experience, providing immediate feedback to participants.</br>Question Attempts Recording: I integrated a system to record and track students attempts at each question. This feature serves as a valuable resource for both students and educators, offering insights into areas that may require further attention.</br>Admin Access for Exam Management: A special admin access system was developed to facilitate the scheduling and management of exams. Admins have the capability to oversee the entire exam process, ensuring smooth execution.</br>Score Viewing for Admins: Admins are equipped with a comprehensive feature that enables them to view scores for each student. This functionality streamlines the evaluation process and allows for efficient score monitoring.</br>Teacher-Uploaded Questions: Teachers can effortlessly upload questions by simply providing a photo. This feature simplifies the question-setting process, making it accessible and efficient for educators.</br>MCQ Standard Question Pattern: The question pattern follows the Multiple-Choice Question standard, ensuring familiarity for both students and educators. This standardization contributes to a streamlined and effective exam experience.</br>Responsive User-Friendly Design: I focused on creating a responsive and user-friendly design to ensure accessibility across various devices. This approach enhances the user experience, making the platform accessible to a broader audience.</br>Learnings:</br>Working on this project has significantly enhanced my proficiency in web development technologies, particularly PHP, HTML, CSS, and JavaScript/jQuery. Designing and implementing anti-cheating measures deepened my understanding of security considerations in virtual examination systems. The real-time aspects of the platform and features like automatic submission and live score assessment enriched my knowledge of creating dynamic and responsive web applications. Developing admin access functionalities enhanced my skills in building comprehensive systems for efficient exam management. Overall, this project not only contributed to my technical skill set but also provided valuable insights into the practical considerations of creating secure and user-friendly virtual exam platforms.', 
        'Goto App', 
        'https://farhanzaman.dev/examiner', 
        'Creating a real-time, virtual platform tailored for MCQ-based exams, encompassing user account management, anti-cheating measures, automatic submission, live score assessment, admin functionalities, and a responsive design for educational institutions.', 
        'https://github.com/FzArnob/Examiner', 
        '2022-10-03', 
        'Open Source', 
        'Prototyping', 
        '2023-10-30', 
        'PHP,CSS,HTML,Java Script,jQuery', 
        'Anti-Cheating System Integration', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(6, 'Image', 'https://live.staticflickr.com/65535/53348016786_b3316a30b8_o.jpg'),
(6, 'Image', 'https://live.staticflickr.com/65535/53348339129_f571100eeb_o.jpg'),
(6, 'Image', 'https://live.staticflickr.com/65535/53348246893_9fc4ec5c0c_o.jpg'),
(6, 'Image', 'https://live.staticflickr.com/65535/53348339099_8bf914415a_o.jpg'),
(6, 'Image', 'https://live.staticflickr.com/65535/53347140942_f121331f20_o.jpg'),
(6, 'Image', 'https://live.staticflickr.com/65535/53347140952_a469c8a4a2_o.jpg');


INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 7, 'Space Ninja', 
        'Developer', 
        'https://live.staticflickr.com/65535/53012233046_5d91731867.jpg', 
        'Game', 
        'Web', 
        'Space Ninja is an engaging 2D arcade game that brings the charm of classic arcade gaming to the modern era. Designed to be accessible and enjoyable for both children and adults, the game is built using HTML, CSS, JavaScript, and 2D SVG images. The development of Space Ninja is a testament to the timeless appeal of simple 2D arcade games, and its alignment with modern online multiplayer games showcases the evolution of the gaming industry.<br/>The design of the game is simple yet captivating, with the use of 2D SVG images adding a unique visual appeal. The gameplay mechanics are straightforward, making it easy for players of all ages to pick up and play. Despite its simplicity, the game offers a fun and challenging experience that keeps players engaged and entertained.<br/>One of the key features of Space Ninja is its planned multiplayer mode. This feature, which is currently under development, aims to bring the excitement and competitiveness of online multiplayer games to the simple 2D arcade format. This will not only enhance the gameplay experience but also broaden the games appeal to a wider audience.<br/>Working on Space Ninja has been a rewarding experience. It has provided me with valuable insights into game development and the use of web technologies in creating interactive experiences. I have gained hands-on experience in using HTML, CSS, and JavaScript in a practical project, and have learned how to create engaging visuals using 2D SVG images.<br/>Moreover, the development process has taught me the importance of planning and foresight in game design, particularly with regard to the implementation of the multiplayer mode. It has also highlighted the importance of aligning a game with current trends in the gaming industry to ensure its relevance and appeal.<br/>Overall, Space Ninja has been a significant project in my development journey, providing me with practical skills and knowledge that I will carry forward into future projects. It has been a testament to the power of simplicity in game design, and the potential of web technologies in creating engaging and enjoyable gaming experiences.', 
        'Launch Game', 
        'https://farhanzaman.dev/spaceninja', 
        'Designing and developing an accessible and engaging 2D arcade game using HTML, CSS, JavaScript, and 2D SVG images, with a planned multiplayer mode aimed at broadening its appeal and aligning with modern online gaming trends.', 
        'https://github.com/FzArnob/SpaceNinja', 
        '2022-03-01', 
        'In Progress', 
        'Prototype cycle', 
        'Present', 
        '2D svg,CSS,HTML,Java Script,jQuery', 
        'Multiplayer support', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(7, 'Image', 'https://live.staticflickr.com/65535/53361526621_67f11b5823_o.png'),
(7, 'Image', 'https://live.staticflickr.com/65535/53361848914_200a5c11d4_o.png'),
(7, 'Image', 'https://live.staticflickr.com/65535/53360644942_f6dd5b8984_o.png'),
(7, 'Image', 'https://live.staticflickr.com/65535/53361526626_dcc6ac814b_o.png');

INSERT INTO projects (project_id, name, work_role, logo_image, type, stack, details, live_text, live_url, scope_of_work, source_url, start_date, current_status, methodology, last_contribution_date, tech_stack, challenges, future_scope, fk_profile_id)
VALUES ( 8, 'QR Queen', 
        'Developer', 
        'https://live.staticflickr.com/65535/53012396049_ce14507917.jpg', 
        'Accessibility', 
        'Android', 
        'QR Queen is a versatile QR code solution offering an array of customization options. It not only allows you to create QR codes with personalized colors and sizes but also ensures secure storage and sharing of your scanned codes. With its seamless interface and reliable features, QR Queen simplifies code scanning, generation, and management.<br/><b>Key Features:</b><br/>- <b>Scan Recording:</b> Automatically stores all scanned results for convenient access in the scan history.<br/>- <b>Local Storage:</b> Save scanned QR images directly to your devices storage.<br/>- <b>Server Security:</b> Ensures the safety and security of your QR codes through server connectivity.<br/>- <b>Code Sharing:</b> Easily share QR codes with others at any time.<br/>- <b>Encryption:</b> Provides encrypted QR codes for enhanced security.<br/>- <b>Internet Connection:</b> Requires an internet connection for optimal functionality.<br/>- <b>Custom Color Design:</b> Customize QR codes with a range of colors for a personalized touch.<br/>- <b>Barcode Conversion:</b> Seamlessly convert barcodes to QR codes through scanning.<br/>- <b>Ad-Free Experience:</b> Enjoy using the app without any intrusive advertisements.<br/>- <b>Scan History:</b> Maintains a comprehensive history of all scanned items for reference.<br/><b>Contributions and Tech Learnings:</b><br/>My tenure at QR Queen has been an enriching experience, allowing me to contribute significantly to the apps development and further my technical expertise. As part of the team, I was involved in various aspects that contributed to the apps success and usability.<br/>One of the primary areas of my contribution was in enhancing the user experience by implementing a robust scan recording feature. This feature automatically captures and stores all scanned results, offering users easy access to their scan history at any time. I was responsible for architecting and implementing this functionality, ensuring its seamless integration into the apps interface. This involved a deep dive into database management and data storage techniques, honing my skills in data handling and management within mobile applications.<br/>Additionally, I played a pivotal role in implementing local storage capabilities, enabling users to save their scanned QR images directly onto their devices. This involved working with file management systems and optimizing storage solutions within the app. Through this, I gained valuable insights into optimizing app performance while managing local data storage efficiently.<br/>Furthermore, I actively contributed to the security aspects of QR Queen. I collaborated on implementing server connectivity to ensure the safekeeping of user-generated QR codes. Understanding and implementing encryption techniques to safeguard sensitive data within the QR codes expanded my knowledge in data security and encryption practices.<br/>Moreover, I engaged in refining the user interface to facilitate seamless code sharing and customization. This involved learning about UI/UX design principles and implementing custom color options for QR code generation, enhancing the apps visual appeal and user customization options.<br/>My tenure at QR Queen has been instrumental in expanding my technical proficiency in mobile app development, database management, security protocols, and user-centric design. Working within a dynamic team environment has fostered my collaboration skills and reinforced the importance of user feedback in refining product features for optimal user experience.', 
        'Download App', 
        'https://github.com/FzArnob/QRQueen/blob/main/release/com.fzs.lab.qr.queen.apk', 
        'Create a comprehensive QR code solution with scan recording, secure storage, sharing options, encryption, customization, and a user-friendly interface while contributing to enhancing user experience, security, and database management for optimal functionality.', 
        'https://github.com/FzArnob/QRQueen', 
        '2020-06-03', 
        'Released', 
        'Prototyping', 
        '2021-03-30', 
        'Java,JavaScript,HTML,CSS', 
        'History management', 
        null, 
        'farhan');
INSERT INTO project_media (project_id, media_type, media_link)
VALUES
(8, 'Image', 'https://live.staticflickr.com/65535/53345791837_5a002ec296_o.png'),
(8, 'Image', 'https://live.staticflickr.com/65535/53346988424_1dc668ae5a_o.png'),
(8, 'Image', 'https://live.staticflickr.com/65535/53346988404_b397bc88df_o.png'),
(8, 'Image', 'https://live.staticflickr.com/65535/53346988449_eff7b675b4_o.png'),
(8, 'Image', 'https://live.staticflickr.com/65535/53012615945_43b55b922c_o.png');
