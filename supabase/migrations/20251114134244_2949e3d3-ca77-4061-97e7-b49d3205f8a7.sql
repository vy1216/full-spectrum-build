-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for user data and reputation
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation_level TEXT DEFAULT 'Bronze Learner' CHECK (reputation_level IN ('Bronze Learner', 'Silver Learner', 'Gold Learner', 'Bronze Mentor', 'Silver Mentor', 'Gold Mentor', 'Platinum Mentor')),
  tokens INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  total_quizzes_completed INTEGER DEFAULT 0,
  total_study_hours DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study materials (uploaded content)
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  content_summary TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations with the mentor
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Conversation',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages in conversations
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public BOOLEAN DEFAULT FALSE,
  attempts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'coding', 'reasoning')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL
);

-- Quiz attempts by users
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study circles (learning rooms)
CREATE TABLE public.study_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 50,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study circle membership
CREATE TABLE public.study_circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES public.study_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Achievement badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'achievement', 'streak')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB
);

-- User badges (earned)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Mentor sessions for 1-on-1 help
CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  tokens_offered INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Material shares for peer exchange
CREATE TABLE public.material_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_earned INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for study_materials
CREATE POLICY "Users can view public materials" ON public.study_materials FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own materials" ON public.study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON public.study_materials FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages in own conversations" ON public.ai_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.ai_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- RLS Policies for quizzes
CREATE POLICY "Users can view public quizzes" ON public.quizzes FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can insert own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for quiz_questions
CREATE POLICY "Users can view questions of accessible quizzes" ON public.quiz_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND (is_public = true OR creator_id = auth.uid())));
CREATE POLICY "Users can insert questions in own quizzes" ON public.quiz_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));
CREATE POLICY "Users can update questions in own quizzes" ON public.quiz_questions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));
CREATE POLICY "Users can delete questions in own quizzes" ON public.quiz_questions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_circles
CREATE POLICY "Users can view public circles" ON public.study_circles FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can insert circles" ON public.study_circles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own circles" ON public.study_circles FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own circles" ON public.study_circles FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for study_circle_members
CREATE POLICY "Users can view members of joined circles" ON public.study_circle_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.study_circle_members m WHERE m.circle_id = circle_id AND m.user_id = auth.uid()));
CREATE POLICY "Users can insert themselves as members" ON public.study_circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own membership" ON public.study_circle_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all earned badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view own mentor sessions" ON public.mentor_sessions FOR SELECT 
  USING (auth.uid() = mentor_id OR auth.uid() = learner_id);
CREATE POLICY "Learners can create sessions" ON public.mentor_sessions FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Users can update sessions they're part of" ON public.mentor_sessions FOR UPDATE 
  USING (auth.uid() = mentor_id OR auth.uid() = learner_id);

-- RLS Policies for material_shares
CREATE POLICY "Users can view all shares" ON public.material_shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares for own materials" ON public.material_shares FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.study_materials WHERE id = material_id AND user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_reputation ON public.profiles(reputation_level);
CREATE INDEX idx_materials_user ON public.study_materials(user_id);
CREATE INDEX idx_materials_public ON public.study_materials(is_public);
CREATE INDEX idx_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX idx_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX idx_quizzes_creator ON public.quizzes(creator_id);
CREATE INDEX idx_quizzes_public ON public.quizzes(is_public);
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_circles_public ON public.study_circles(is_public);
CREATE INDEX idx_circle_members_circle ON public.study_circle_members(circle_id);
CREATE INDEX idx_circle_members_user ON public.study_circle_members(user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_mentor_sessions_mentor ON public.mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_learner ON public.mentor_sessions(learner_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default badges
INSERT INTO public.badges (name, description, icon, category, rarity) VALUES
  ('First Steps', 'Complete your first quiz', '🎯', 'achievement', 'common'),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'rare'),
  ('Quiz Master', 'Complete 50 quizzes', '👑', 'achievement', 'epic'),
  ('Helpful Mentor', 'Help 10 learners', '🌟', 'social', 'rare'),
  ('Knowledge Sharer', 'Share 20 study materials', '📚', 'social', 'rare'),
  ('Circle Starter', 'Create your first study circle', '👥', 'social', 'common'),
  ('Month Champion', 'Maintain a 30-day streak', '💎', 'streak', 'legendary'),
  ('Perfect Score', 'Get 100% on a hard quiz', '⭐', 'achievement', 'epic');