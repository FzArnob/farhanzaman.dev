INSERT INTO visitor_tracking (
    device_fingerprint,
    visit_timestamp,
    fk_visitor_ip,
    browser_name,
    browser_version,
    operating_system,
    device_type,
    screen_resolution,
    color_depth,
    timezone_offset,
    language,
    rendering_engine,
    page_tag,
    feature_tag,
    activity_tag,
    action_tag,
    referrer_url,
    fk_profile_id
)
SELECT
    -- Hard-coded / generated fingerprint to satisfy NOT NULL
    -- compute MD5 once in a derived table and format it as a UUID (8-4-4-4-12)
    LOWER(CONCAT(
        SUBSTR(md5hash, 1, 8), '-',
        SUBSTR(md5hash, 9, 4), '-',
        SUBSTR(md5hash, 13, 4), '-',
        SUBSTR(md5hash, 17, 4), '-',
        SUBSTR(md5hash, 21, 12)
    )) AS device_fingerprint,
    created_date                AS visit_timestamp,
    visitor_ip             AS fk_visitor_ip,
    IFNULL(NULLIF(browser_name, ''), 'Other')            AS browser_name,
    IFNULL(NULLIF(browser_version, ''), 'Other')         AS browser_version,
    IFNULL(NULLIF(operating_system, ''), 'Other')        AS operating_system,
    IFNULL(NULLIF(device_type, ''), 'Other')             AS device_type,
    'N/A'                                       AS screen_resolution,  -- no data → keep NULL
    0                                       AS color_depth,
    0                                       AS timezone_offset,
    'N/A'                                       AS language,
    IFNULL(rendering_engine, 'N/A')        AS rendering_engine,
    'HOME'                                       AS page_tag,
    'FULL_PAGE'                                       AS feature_tag,
    'PAGE_VIEW'                                       AS activity_tag,
    'VISIT'                                       AS action_tag,
    'https://farhanzaman.dev/?i=1'                                       AS referrer_url,
    fk_profile_id                AS fk_profile_id
FROM (
    SELECT *, MD5(TRIM(LOWER(COALESCE(visitor_ip, '0.0.0.0')))) AS md5hash
    FROM visitors_old
) visitors_old;