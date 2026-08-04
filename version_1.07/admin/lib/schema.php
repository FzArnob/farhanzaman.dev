<?php

/**
 * Describes every editable part of profile.json. The whole admin UI — forms,
 * templates, validation and saving — is generated from this, so adding a field
 * anywhere means adding one line here.
 *
 * field: name, label, type, width, nullable, help, options
 * type : text | url | textarea | html | lines | number | select
 * width: full | half | third
 */
function admin_schema()
{
    $presentOptions = array('0' => 'No', '1' => 'Yes (present)');

    return array(
        'info' => array(
            'label' => 'Profile Info',
            'kind' => 'object',
            'fields' => array(
                array('name' => 'profile_id', 'label' => 'Profile ID', 'type' => 'text', 'width' => 'half', 'help' => 'Sent with every tracking and contact request.'),
                array('name' => 'full_name', 'label' => 'Full name', 'type' => 'text', 'width' => 'half'),
                array('name' => 'first_name', 'label' => 'First name', 'type' => 'text', 'width' => 'third'),
                array('name' => 'last_name', 'label' => 'Last name', 'type' => 'text', 'width' => 'third'),
                array('name' => 'nick_name', 'label' => 'Nick name', 'type' => 'text', 'width' => 'third'),
                array('name' => 'designations', 'label' => 'Designations', 'type' => 'lines', 'width' => 'full', 'help' => 'One per line. These are typed out in the intro animation.'),
                array('name' => 'intro_text', 'label' => 'Intro text', 'type' => 'html', 'width' => 'full'),
                array('name' => 'about_text', 'label' => 'About text', 'type' => 'html', 'width' => 'full'),
                array('name' => 'expertise_preference_details', 'label' => 'Expertise intro', 'type' => 'html', 'width' => 'full'),
                array('name' => 'contact_preference_details', 'label' => 'Contact intro', 'type' => 'textarea', 'width' => 'full'),
                array('name' => 'website_base_url', 'label' => 'Website base URL', 'type' => 'url', 'width' => 'half', 'help' => 'Drives the API host, the error page link and every {{base_url}} token.'),
                array('name' => 'website_domain_name', 'label' => 'Website domain', 'type' => 'text', 'width' => 'half', 'help' => 'Shown in the footer copyright and via {{domain}}.'),
                array('name' => 'intro_image_url', 'label' => 'Intro image URL', 'type' => 'text', 'width' => 'half'),
                array('name' => 'resume_url', 'label' => 'Resume URL', 'type' => 'text', 'width' => 'half'),
                array('name' => 'address', 'label' => 'Address', 'type' => 'text', 'width' => 'full'),
                array('name' => 'phone', 'label' => 'Phone', 'type' => 'text', 'width' => 'half'),
                array('name' => 'secondary_phone', 'label' => 'Secondary phone', 'type' => 'text', 'width' => 'half'),
                array('name' => 'email', 'label' => 'Email', 'type' => 'text', 'width' => 'half'),
                array('name' => 'alternative_email', 'label' => 'Alternative email', 'type' => 'text', 'width' => 'half'),
                array('name' => 'facebook_url', 'label' => 'Facebook URL', 'type' => 'url', 'width' => 'half'),
                array('name' => 'github_url', 'label' => 'GitHub URL', 'type' => 'url', 'width' => 'half'),
                array('name' => 'linkedin_url', 'label' => 'LinkedIn URL', 'type' => 'url', 'width' => 'half'),
                array('name' => 'whatsapp_url', 'label' => 'WhatsApp URL', 'type' => 'url', 'width' => 'half'),
            ),
        ),

        'educations' => array(
            'label' => 'Education',
            'kind' => 'list',
            'key' => 'education_id',
            'title' => 'subject',
            'subtitle' => 'institute_name',
            'singular' => 'education entry',
            'fields' => array(
                array('name' => 'subject', 'label' => 'Subject / degree', 'type' => 'text', 'width' => 'full'),
                array('name' => 'institute_name', 'label' => 'Institute', 'type' => 'text', 'width' => 'half'),
                array('name' => 'institute_url', 'label' => 'Institute URL', 'type' => 'url', 'width' => 'half'),
                array('name' => 'start_date', 'label' => 'Start date', 'type' => 'text', 'width' => 'third', 'help' => 'YYYY-MM-DD or just YYYY.'),
                array('name' => 'end_date', 'label' => 'End date', 'type' => 'text', 'width' => 'third', 'nullable' => true, 'help' => 'Leave empty for ongoing.'),
                array('name' => 'is_present', 'label' => 'Ongoing', 'type' => 'select', 'width' => 'third', 'options' => $presentOptions),
                array('name' => 'institute_std', 'label' => 'Institute standard', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'activity', 'label' => 'Activity', 'type' => 'text', 'width' => 'full'),
            ),
        ),

        'experiences' => array(
            'label' => 'Experience',
            'kind' => 'list',
            'key' => 'experience_id',
            'title' => 'position',
            'subtitle' => 'institute_name',
            'singular' => 'experience entry',
            'fields' => array(
                array('name' => 'position', 'label' => 'Position', 'type' => 'text', 'width' => 'full'),
                array('name' => 'institute_name', 'label' => 'Company', 'type' => 'text', 'width' => 'half'),
                array('name' => 'institute_url', 'label' => 'Company URL', 'type' => 'url', 'width' => 'half'),
                array('name' => 'start_date', 'label' => 'Start date', 'type' => 'text', 'width' => 'third'),
                array('name' => 'end_date', 'label' => 'End date', 'type' => 'text', 'width' => 'third', 'nullable' => true, 'help' => 'Leave empty for present.'),
                array('name' => 'is_present', 'label' => 'Ongoing', 'type' => 'select', 'width' => 'third', 'options' => $presentOptions),
                array('name' => 'institute_std', 'label' => 'Company standard', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_details', 'label' => 'Role summary', 'type' => 'textarea', 'width' => 'full'),
                array('name' => 'project_text_1', 'label' => 'Project 1 label', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_url_1', 'label' => 'Project 1 URL', 'type' => 'url', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_text_2', 'label' => 'Project 2 label', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_url_2', 'label' => 'Project 2 URL', 'type' => 'url', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_text_3', 'label' => 'Project 3 label', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'project_url_3', 'label' => 'Project 3 URL', 'type' => 'url', 'width' => 'half', 'nullable' => true),
            ),
        ),

        'expertises' => array(
            'label' => 'Expertise',
            'kind' => 'list',
            'key' => 'expertise_id',
            'title' => 'name',
            'subtitle' => 'level',
            'singular' => 'expertise',
            'help' => 'Names appear in the rotating tag cloud on the home page.',
            'fields' => array(
                array('name' => 'name', 'label' => 'Name', 'type' => 'text', 'width' => 'third'),
                array('name' => 'level', 'label' => 'Level', 'type' => 'text', 'width' => 'third'),
                array('name' => 'duration', 'label' => 'Duration (months)', 'type' => 'number', 'width' => 'third'),
                array('name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'width' => 'full'),
            ),
        ),

        'skills' => array(
            'label' => 'Skills',
            'kind' => 'list',
            'key' => 'skill_id',
            'title' => 'name',
            'subtitle' => 'percentage',
            'singular' => 'skill',
            'help' => 'Percentage drives the bar width and its level label.',
            'fields' => array(
                array('name' => 'name', 'label' => 'Name', 'type' => 'text', 'width' => 'third'),
                array('name' => 'percentage', 'label' => 'Percentage (0-100)', 'type' => 'number', 'width' => 'third'),
                array('name' => 'duration', 'label' => 'Duration (months)', 'type' => 'number', 'width' => 'third'),
                array('name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'width' => 'full'),
            ),
        ),

        'achievements' => array(
            'label' => 'Achievements',
            'kind' => 'list',
            'key' => 'achievement_id',
            'title' => 'name',
            'subtitle' => 'level',
            'singular' => 'achievement',
            'fields' => array(
                array('name' => 'name', 'label' => 'Name', 'type' => 'text', 'width' => 'half'),
                array('name' => 'level', 'label' => 'Level', 'type' => 'text', 'width' => 'half'),
                array('name' => 'certification_date', 'label' => 'Certification date', 'type' => 'text', 'width' => 'half'),
                array('name' => 'duration', 'label' => 'Duration (months)', 'type' => 'number', 'width' => 'half'),
                array('name' => 'certification_url', 'label' => 'Certificate URL', 'type' => 'url', 'width' => 'full'),
                array('name' => 'certification_logo', 'label' => 'Logo URL', 'type' => 'text', 'width' => 'full', 'help' => 'Shown as the badge image, e.g. view/static/svg/java.svg'),
                array('name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'width' => 'full'),
            ),
        ),

        'projects' => array(
            'label' => 'Projects',
            'kind' => 'list',
            'key' => 'project_id',
            'title' => 'name',
            'subtitle' => 'work_role',
            'singular' => 'project',
            'help' => 'Order matters: the work page is addressed as /work?work_id=<position>. The home marquee needs at least 8 projects.',
            'fields' => array(
                array('name' => 'name', 'label' => 'Name', 'type' => 'text', 'width' => 'half'),
                array('name' => 'work_role', 'label' => 'Role', 'type' => 'text', 'width' => 'half'),
                array('name' => 'type', 'label' => 'Type', 'type' => 'text', 'width' => 'half', 'help' => 'First tag, e.g. Enterprise.'),
                array('name' => 'stack', 'label' => 'Stack', 'type' => 'text', 'width' => 'half', 'help' => 'Second tag, e.g. Web.'),
                array('name' => 'logo_image', 'label' => 'Card image URL', 'type' => 'url', 'width' => 'full'),
                array('name' => 'details', 'label' => 'Details', 'type' => 'html', 'width' => 'full', 'help' => 'Rendered as HTML — &lt;br /&gt; and &lt;b&gt; are allowed.'),
                array('name' => 'scope_of_work', 'label' => 'Scope of work', 'type' => 'textarea', 'width' => 'full'),
                array('name' => 'live_text', 'label' => 'Live link label', 'type' => 'text', 'width' => 'half', 'nullable' => true),
                array('name' => 'live_url', 'label' => 'Live URL', 'type' => 'text', 'width' => 'half', 'nullable' => true, 'help' => 'Use {{base_url}} for pages hosted on this site.'),
                array('name' => 'source_url', 'label' => 'Source URL', 'type' => 'text', 'width' => 'full', 'nullable' => true),
                array('name' => 'start_date', 'label' => 'Start date', 'type' => 'text', 'width' => 'half'),
                array('name' => 'last_contribution_date', 'label' => 'Last contribution', 'type' => 'text', 'width' => 'half'),
                array('name' => 'current_status', 'label' => 'Current status', 'type' => 'text', 'width' => 'half'),
                array('name' => 'methodology', 'label' => 'Methodology', 'type' => 'text', 'width' => 'half'),
                array('name' => 'tech_stack', 'label' => 'Tech stack', 'type' => 'textarea', 'width' => 'full', 'help' => 'Comma separated — each becomes a chip.'),
                array('name' => 'challenges', 'label' => 'Challenges and risks', 'type' => 'textarea', 'width' => 'full'),
                array('name' => 'future_scope', 'label' => 'Future scope', 'type' => 'textarea', 'width' => 'full', 'nullable' => true, 'help' => 'Left empty this prints "null" on the work page, as in the original site.'),
            ),
            'children' => array(
                'media' => array(
                    'label' => 'Media',
                    'key' => 'media_id',
                    'singular' => 'media item',
                    'parent_key' => 'project_id',
                    'fields' => array(
                        array('name' => 'media_type', 'label' => 'Type', 'type' => 'select', 'width' => 'third', 'options' => array('Image' => 'Image', 'Vimeo' => 'Vimeo embed', 'Video' => 'Video file (mp4)')),
                        array('name' => 'media_link', 'label' => 'Link', 'type' => 'url', 'width' => 'full'),
                    ),
                ),
            ),
        ),

        'gallery' => array(
            'label' => 'Gallery',
            'kind' => 'list',
            'key' => 'gallery_item_id',
            'title' => 'name',
            'subtitle' => 'category',
            'singular' => 'gallery item',
            'help' => 'Shown on the hobbies page and, partly, on the home page.',
            'fields' => array(
                array('name' => 'name', 'label' => 'Name', 'type' => 'text', 'width' => 'half'),
                array('name' => 'category', 'label' => 'Category', 'type' => 'text', 'width' => 'half'),
                array('name' => 'thumb_url', 'label' => 'Thumbnail URL', 'type' => 'url', 'width' => 'full'),
                array('name' => 'image_url', 'label' => 'Full image URL', 'type' => 'url', 'width' => 'full'),
                array('name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'width' => 'full'),
            ),
        ),
    );
}
