ALTER TABLE "company_profiles"
ADD COLUMN "hero_title" TEXT,
ADD COLUMN "hero_subtitle" TEXT,
ADD COLUMN "hero_image_url" TEXT,
ADD COLUMN "hero_cta_primary" TEXT,
ADD COLUMN "hero_cta_secondary" TEXT,
ADD COLUMN "hero_badge" TEXT,
ADD COLUMN "feature_headline" TEXT,
ADD COLUMN "feature_text" TEXT,
ADD COLUMN "how_to_book_title" TEXT,
ADD COLUMN "how_to_book_text" TEXT,
ADD COLUMN "about_title" TEXT,
ADD COLUMN "about_text" TEXT;

ALTER TABLE "company_profiles"
ADD COLUMN "whatsapp_number_secondary" TEXT,
ADD COLUMN "instagram_url" TEXT,
ADD COLUMN "facebook_url" TEXT,
ADD COLUMN "tiktok_url" TEXT,
ADD COLUMN "youtube_url" TEXT;
