-- Create users table (extends Supabase's auth.users table)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  grade_level INTEGER,
  UNIQUE(user_id, role)
);

-- Create progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Add teacher_id to subjects table
ALTER TABLE subjects ADD COLUMN teacher_id UUID REFERENCES users(id);

-- Add teacher_id to lessons table
ALTER TABLE lessons ADD COLUMN teacher_id UUID REFERENCES users(id);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read their own roles
CREATE POLICY "Users can read own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Students can read and update their own progress
CREATE POLICY "Students can read own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Teachers can read and update their own subjects and lessons
CREATE POLICY "Teachers can read own subjects" ON subjects
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can read own lessons" ON lessons
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own lessons" ON lessons
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Students can read all subjects and lessons
CREATE POLICY "Students can read all subjects" ON subjects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'student'
    )
  );
CREATE POLICY "Students can read all lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'student'
    )
  );

