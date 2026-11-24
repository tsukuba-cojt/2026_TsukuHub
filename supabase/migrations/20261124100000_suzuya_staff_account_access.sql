-- Passwords are provisioned through Auth Admin API, never stored in migrations.
insert into public.cafeteria_staff_access(university_id,cafeteria_id,email)
select locations.university_id, locations.cafeteria_id, 'suzuya@cafeteria.tsukuhub.com'
from public.cafeteria_locations locations
join public.universities university on university.id=locations.university_id
where university.slug='tsukuba' and locations.cafeteria_id in
  ('area1-suzuya','area3-suzuya','research-b-suzuya','medical-suzuya','honbu-suzuya')
on conflict (university_id,cafeteria_id,email) do nothing;
