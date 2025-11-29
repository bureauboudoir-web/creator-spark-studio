-- Add foreign key relationship so PostgREST can join creators with profiles
ALTER TABLE public.creators
ADD CONSTRAINT fk_creators_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;