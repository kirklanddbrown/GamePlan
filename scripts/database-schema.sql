-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    team TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Situations table
CREATE TABLE public.situations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    down INTEGER NOT NULL CHECK (down >= 1 AND down <= 4),
    distance INTEGER NOT NULL CHECK (distance >= 1),
    field_position TEXT,
    time_remaining TEXT,
    score TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own situations" ON public.situations
    FOR ALL USING (auth.uid() = user_id);

-- Plays table
CREATE TABLE public.plays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    situation_id UUID REFERENCES public.situations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    formation TEXT NOT NULL,
    play_type TEXT NOT NULL,
    description TEXT,
    personnel TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    success BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plays" ON public.plays
    FOR ALL USING (auth.uid() = user_id);

-- Weeks table
CREATE TABLE public.weeks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    opponent TEXT NOT NULL,
    game_date DATE NOT NULL,
    location TEXT,
    notes TEXT,
    selected_situations UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weeks" ON public.weeks
    FOR ALL USING (auth.uid() = user_id);

-- Play Scripts table
CREATE TABLE public.play_scripts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    situation_id UUID REFERENCES public.situations(id) ON DELETE SET NULL,
    play_ids UUID[] DEFAULT '{}',
    situations_order UUID[] DEFAULT '{}',
    play_orders JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.play_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own play scripts" ON public.play_scripts
    FOR ALL USING (auth.uid() = user_id);

-- Week Plays table (plays specific to a week)
CREATE TABLE public.week_plays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
    play_id UUID REFERENCES public.plays(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(week_id, play_id)
);

ALTER TABLE public.week_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own week plays" ON public.week_plays
    FOR ALL USING (auth.uid() = user_id);

-- Custom Play Types table
CREATE TABLE public.custom_play_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

ALTER TABLE public.custom_play_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom play types" ON public.custom_play_types
    FOR ALL USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Coach'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_situations_user_id ON public.situations(user_id);
CREATE INDEX idx_plays_user_id ON public.plays(user_id);
CREATE INDEX idx_plays_situation_id ON public.plays(situation_id);
CREATE INDEX idx_weeks_user_id ON public.weeks(user_id);
CREATE INDEX idx_play_scripts_user_id ON public.play_scripts(user_id);
CREATE INDEX idx_play_scripts_week_id ON public.play_scripts(week_id);
CREATE INDEX idx_week_plays_user_id ON public.week_plays(user_id);
CREATE INDEX idx_week_plays_week_id ON public.week_plays(week_id);
