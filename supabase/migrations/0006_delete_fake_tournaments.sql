-- Delete the 5 fake/demo tournaments (they have NULL club_id)
-- Run this in Supabase SQL Editor

DELETE FROM tournaments WHERE club_id IS NULL;

-- Verify: should return 0
SELECT COUNT(*) as remaining_fake FROM tournaments WHERE club_id IS NULL;
