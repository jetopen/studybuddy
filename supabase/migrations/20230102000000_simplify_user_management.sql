-- ... (previous code remains unchanged)

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Allow inserting new users
CREATE POLICY "Allow inserting new users" ON users
  FOR INSERT WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- ... (rest of the policies remain unchanged)

