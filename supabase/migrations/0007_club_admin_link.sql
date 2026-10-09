-- Link club admins to their managed club
alter table profiles add column if not exists managed_club_id uuid references clubs(id) on delete set null;

-- Allow super_admin to set managed_club_id (covered by existing update policy)
-- Club admins can view their own managed club
