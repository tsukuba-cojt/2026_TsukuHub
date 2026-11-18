-- Remote still called the pre-multi-university profile trigger, so allowlisted
-- admins were inserted as students without a university and signup failed.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop function if exists public.create_profile_for_user();
