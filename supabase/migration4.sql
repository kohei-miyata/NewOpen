-- migration4.sql: contacts に法人名・部署を追加
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company    TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS department TEXT;
