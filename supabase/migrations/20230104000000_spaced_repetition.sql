-- Create spaced_repetition_items table
CREATE TABLE spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create spaced_repetition_progress table
CREATE TABLE spaced_repetition_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  item_id UUID REFERENCES spaced_repetition_items(id),
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE spaced_repetition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_progress ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own spaced repetition items
CREATE POLICY "Teachers can manage their spaced repetition items" ON spaced_repetition_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = spaced_repetition_items.lesson_id
      AND l.teacher_id = auth.uid()
    )
  );

-- Students can read all spaced repetition items
CREATE POLICY "Students can read all spaced repetition items" ON spaced_repetition_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'student'
    )
  );

-- Users can manage their own spaced repetition progress
CREATE POLICY "Users can manage their own spaced repetition progress" ON spaced_repetition_progress
  FOR ALL USING (auth.uid() = user_id);

