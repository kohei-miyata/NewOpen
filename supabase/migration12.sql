-- Migration 12
-- 1) stores: 審査ステータス列 (pending=審査中 / approved=承認 / rejected=否認)
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 既存店舗はすべて承認済みとして扱う
UPDATE stores SET approval_status = 'approved' WHERE approval_status = 'pending';

-- 2) store_email_history: オーナー向けに送ったメール履歴
CREATE TABLE IF NOT EXISTS store_email_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  subject     TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  recipient_email TEXT    NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) contact_replies: 問い合わせへの返信履歴
CREATE TABLE IF NOT EXISTS contact_replies (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID        NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
