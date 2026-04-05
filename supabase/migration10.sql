-- 利用規約同意エビデンス
CREATE TABLE IF NOT EXISTS terms_agreements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version     text        NOT NULL DEFAULT '1.0',
  agreed_at   timestamptz NOT NULL DEFAULT now(),
  ip_address  text,
  user_agent  text
);

ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own records only" ON terms_agreements
  FOR SELECT USING (auth.uid() = user_id);
