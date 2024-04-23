-- Migrate data from visitors_old to visitors table
    INSERT INTO visitors (visitor_ip, created_date, updated_date, fk_profile_id, is_tracked)
    SELECT 
        visitor_ip, 
        MIN(created_date) AS created_date,
        MAX(created_date) AS updated_date,
        fk_profile_id,
        FALSE AS is_tracked
    FROM visitors_old
    GROUP BY visitor_ip, fk_profile_id;

-- Migrate data from visitors_old to actions table
INSERT INTO actions (browser_name, browser_version, operating_system, device_type, device_details, rendering_engine, mobile_specific_info, created_date, fk_visitor_id)
SELECT
    vo.browser_name,
    vo.browser_version,
    vo.operating_system,
    vo.device_type,
    vo.device_details,
    vo.rendering_engine,
    vo.mobile_specific_info,
    vo.created_date,
    v.visitor_id
FROM visitors_old vo
JOIN visitors v ON vo.visitor_ip = v.visitor_ip;
