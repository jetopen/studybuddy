-- Add subject_id to ai_generated_content table
ALTER TABLE ai_generated_content ADD COLUMN subject_id UUID REFERENCES subjects(id);

-- Update existing rows to set subject_id based on lesson's subject
UPDATE ai_generated_content
SET subject_id = (
  SELECT subject_id
  FROM lessons
  WHERE lessons.id = ai_generated_content.lesson_id
);

-- Make subject_id NOT NULL after updating existing rows
ALTER TABLE ai_generated_content ALTER COLUMN subject_id SET NOT NULL;

-- Update RLS policies to include subject_id
DROP POLICY IF EXISTS "Teachers can manage their AI-generated content" ON ai_generated_content;
CREATE POLICY "Teachers can manage their AI-generated content" ON ai_generated_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN subjects s ON l.subject_id = s.id
      WHERE l.id = ai_generated_content.lesson_id
      AND s.id = ai_generated_content.subject_id
      AND s.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can read AI-generated content" ON ai_generated_content;
CREATE POLICY "Students can read AI-generated content" ON ai_generated_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN subjects s ON s.suitable_grades @> ARRAY[ur.grade_level]
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'student'
      AND s.id = ai_generated_content.subject_id
    )
  );

