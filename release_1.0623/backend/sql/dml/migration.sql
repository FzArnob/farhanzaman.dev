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