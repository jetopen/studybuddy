-- Create materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'video', 'document')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id),
    user_id UUID REFERENCES users(id),
    score INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own content
CREATE POLICY "Teachers can manage their materials" ON materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lessons l
            WHERE l.id = materials.lesson_id
            AND l.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can manage their quizzes" ON quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lessons l
            WHERE l.id = quizzes.lesson_id
            AND l.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can manage their quiz questions" ON quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quizzes q
            JOIN lessons l ON q.lesson_id = l.id
            WHERE q.id = quiz_questions.quiz_id
            AND l.teacher_id = auth.uid()
        )
    );

-- Students can read materials and quizzes, and manage their attempts
CREATE POLICY "Students can read materials" ON materials
    FOR SELECT USING (true);

CREATE POLICY "Students can read quizzes" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "Students can read quiz questions" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Students can manage their quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

