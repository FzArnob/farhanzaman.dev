create table
    profile_info (
        profile_id varchar(20) not null primary key,
        full_name varchar(255) null,
        name_subtitle varchar(255) null,
        name_subtitle_highlight varchar(255) null,
        nick_name varchar(50) null,
        designation varchar(255) null,
        intro_text text null,
        intro_image_url varchar(255) null,
        resume_url varchar(255) null,
        expertise_preference_title varchar(255) null,
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
        constraint email unique (email)
    );
create table
    education_items (
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
        delete_flag tinyint (1) default 0 null
    );
create table
    experience_items (
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
        delete_flag tinyint (1) default 0 null
    );
create table
    achievement_items (
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
        delete_flag tinyint (1) default 0 null
    );
create table
    expertise_items (
        expertise_id int auto_increment primary key,
        name varchar(255) null,
        description text null,
        duration int null,
        level varchar(50) null,
        created_date timestamp default current_timestamp() not null,
        updated_date timestamp default current_timestamp() not null on update current_timestamp(),
        delete_flag tinyint (1) default 0 null
    );
create table
    gallery_items (
        gallery_item_id int auto_increment primary key,
        name varchar(255) null,
        description text null,
        category varchar(100) null,
        image_url varchar(255) null,
        thumb_url varchar(255) null,
        created_date timestamp default current_timestamp() not null,
        updated_date timestamp default current_timestamp() not null on update current_timestamp(),
        delete_flag tinyint (1) default 0 null
    );
create table
    projects (
        project_id int auto_increment primary key,
        name varchar(255) null,
        type varchar(100) null,
        stack varchar(255) null,
        details text null,
        live_url varchar(255) null,
        demo_url varchar(255) null,
        logo_image varchar(255) null,
        duration int null,
        additional_image_1 varchar(255) null,
        additional_image_2 varchar(255) null,
        additional_image_3 varchar(255) null,
        additional_image_4 varchar(255) null,
        additional_image_5 varchar(255) null,
        created_date timestamp default current_timestamp() not null,
        updated_date timestamp default current_timestamp() not null on update current_timestamp(),
        delete_flag tinyint (1) default 0 null
    );
create table
    skill_items (
        skill_id int auto_increment primary key,
        name varchar(255) null,
        description text null,
        duration int null,
        percentage int null,
        created_date timestamp default current_timestamp() not null,
        updated_date timestamp default current_timestamp() not null on update current_timestamp(),
        delete_flag tinyint (1) default 0 null
    );
create table
    direct_messages (
        message_id int auto_increment primary key,
        name varchar(255) not null,
        email varchar(255) not null,
        subject varchar(255) not null,
        message text not null,
        created timestamp default current_timestamp() not null,
        delete_flag tinyint (1) default 0 null
    );
create table
    visitors (
        visitor_id int auto_increment primary key,
        visitor_ip varchar(45) null,
        fk_profile_id varchar(20) not null,
        browser_name varchar(255) null,
        browser_version varchar(50) null,
        operating_system varchar(255) null,
        device_type varchar(255) null,
        device_details varchar(255) null,
        rendering_engine varchar(255) null,
        mobile_specific_info text null,
        created_date timestamp default current_timestamp not null,
        updated_date timestamp null on update current_timestamp,
        foreign key (fk_profile_id) references profile_info (profile_id)
    );





create table
    profile_education (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_education_id int null,
        constraint profile_education_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_education_ibfk_2 foreign key (fk_education_id) references education_items (education_id)
    );

create table
    profile_experience (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_experience_id int null,
        constraint profile_experience_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_experience_ibfk_2 foreign key (fk_experience_id) references experience_items (experience_id)
    );

create table
    profile_achievement (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_achievement_id int null,
        constraint profile_achievement_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_achievement_ibfk_2 foreign key (fk_achievement_id) references achievement_items (achievement_id)
    );

create table
    profile_expertise (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_expertise_id int null,
        constraint profile_expertise_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_expertise_ibfk_2 foreign key (fk_expertise_id) references expertise_items (expertise_id)
    );

create table
    profile_gallery_items (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_item_id int null,
        constraint profile_gallery_items_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_gallery_items_ibfk_2 foreign key (fk_item_id) references gallery_items (gallery_item_id)
    );

create table
    profile_projects (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_project_id int null,
        constraint profile_projects_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_projects_ibfk_2 foreign key (fk_project_id) references projects (project_id)
    );

create table
    profile_skill (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_skill_id int null,
        constraint profile_skill_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_skill_ibfk_2 foreign key (fk_skill_id) references skill_items (skill_id)
    );

create table
    profile_direct_messages (
        id int auto_increment primary key,
        fk_profile_id varchar(20) null,
        fk_message_id int null,
        constraint profile_direct_messages_ibfk_1 foreign key (fk_profile_id) references profile_info (profile_id),
        constraint profile_direct_messages_ibfk_2 foreign key (fk_message_id) references direct_messages (message_id)
    );