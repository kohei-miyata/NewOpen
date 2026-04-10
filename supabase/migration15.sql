-- クーポンに「他のクーポンとの併用可否」を追加
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS combinable BOOLEAN NOT NULL DEFAULT false;
