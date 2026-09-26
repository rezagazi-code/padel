-- Migration 0005: Negaristan courts are indoor (correction from the club info).
-- Run once in Supabase SQL Editor.

update courts
set type = 'indoor',
    name = replace(name, '(روباز)', '(سرپوشیده)')
where club_id in (select id from clubs where name = 'باشگاه پدل نگارستان');

update clubs
set amenities = array_replace(amenities, '۳ زمین پدل روباز با نورپردازی شبانه', '۳ زمین پدل سرپوشیده')
where name = 'باشگاه پدل نگارستان';
