-- Create ai_generated_content table
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  type TEXT NOT NULL CHECK (type IN ('quiz', 'flashcards')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own AI-generated content
CREATE POLICY "Teachers can manage their AI-generated content" ON ai_generated_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = ai_generated_content.lesson_id
      AND l.teacher_id = auth.uid()
    )
  );

-- Students can read AI-generated content
CREATE POLICY "Students can read AI-generated content" ON ai_generated_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'student'
    )
  );

