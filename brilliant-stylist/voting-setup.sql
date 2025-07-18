-- Voting System Setup for Brilliant Stylist
-- Run this in your Supabase SQL Editor

-- Vote Pairs Table (stores the prompt + user submission combinations)
CREATE TABLE vote_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES styling_challenges(id),
  user_submission_id UUID REFERENCES user_outfits(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Votes Table (stores individual votes)
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_pair_id UUID REFERENCES vote_pairs(id) ON DELETE CASCADE,
  user_submission_id UUID REFERENCES user_outfits(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('brilliant', 'meh')),
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_pair_id, voter_id) -- Prevent duplicate votes from same user
);

-- Enable RLS on vote_pairs
ALTER TABLE vote_pairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vote_pairs
CREATE POLICY "Anyone can view active vote pairs" ON vote_pairs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage vote pairs" ON vote_pairs
  FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
CREATE POLICY "Users can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = voter_id);

-- Function to create vote pairs automatically when outfits are uploaded
CREATE OR REPLACE FUNCTION create_vote_pair_for_outfit()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a vote pair for the new outfit
  INSERT INTO vote_pairs (prompt_id, user_submission_id)
  VALUES (
    (NEW.outfit_data->>'prompt_id')::UUID,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create vote pair when outfit is uploaded
CREATE TRIGGER on_outfit_created
  AFTER INSERT ON user_outfits
  FOR EACH ROW EXECUTE FUNCTION create_vote_pair_for_outfit();

-- Function to get vote counts for a submission
CREATE OR REPLACE FUNCTION get_vote_counts(submission_id UUID)
RETURNS TABLE(brilliant_count BIGINT, meh_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'brilliant') as brilliant_count,
    COUNT(*) FILTER (WHERE vote_type = 'meh') as meh_count
  FROM votes 
  WHERE user_submission_id = submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 