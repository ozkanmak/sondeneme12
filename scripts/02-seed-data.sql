-- Seed initial admin user (password: admin123)
-- In production, you should hash passwords properly
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@eduplatform.com', '$2a$10$rZL0qsmJV7qPqQzRxJ6eWe6PdBvJk8xJhH9pQK7XQC.8qFxMQf3fG', 'Sistem Yöneticisi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed some sample games
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, thumbnail_url, game_url, duration_minutes, is_active) VALUES
('Harf Avı', 'Harfleri tanıma ve eşleştirme oyunu', 'reading', 'easy', ARRAY['dyslexia'], '/games/thumbnails/letter-hunt.jpg', '/games/letter-hunt', 15, true),
('Sayı Dünyası', 'Temel matematik işlemleri pratiği', 'math', 'easy', ARRAY['dyscalculia'], '/games/thumbnails/number-world.jpg', '/games/number-world', 20, true),
('Kelime Ustası', 'Yazım kuralları ve kelime oluşturma', 'writing', 'medium', ARRAY['dysgraphia', 'dyslexia'], '/games/thumbnails/word-master.jpg', '/games/word-master', 25, true),
('Dikkat Merkezi', 'Odaklanma ve dikkat geliştirme egzersizleri', 'attention', 'medium', ARRAY['adhd'], '/games/thumbnails/focus-center.jpg', '/games/focus-center', 10, true),
('Hafıza Kahramanı', 'Görsel ve işitsel hafıza güçlendirme', 'memory', 'easy', ARRAY['adhd', 'autism'], '/games/thumbnails/memory-hero.jpg', '/games/memory-hero', 15, true),
('Matematik Macerası', 'İleri seviye problem çözme', 'math', 'hard', ARRAY['dyscalculia'], '/games/thumbnails/math-adventure.jpg', '/games/math-adventure', 30, true),
('Okuma Yıldızı', 'Hızlı okuma ve anlama geliştirme', 'reading', 'medium', ARRAY['dyslexia'], '/games/thumbnails/reading-star.jpg', '/games/reading-star', 20, true),
('Yazı Atölyesi', 'El yazısı ve yazım becerileri', 'writing', 'easy', ARRAY['dysgraphia'], '/games/thumbnails/writing-workshop.jpg', '/games/writing-workshop', 20, true)
ON CONFLICT DO NOTHING;

-- Seed AI prompts for assessments
INSERT INTO ai_prompts (prompt_type, prompt_text, target_disability, is_active) VALUES
('assessment', 'Bu öğrencinin disleksi ile ilgili son performans verilerini analiz et ve gelişim alanlarını belirle.', 'dyslexia', true),
('assessment', 'Diskalkuli yaşayan öğrencinin matematik becerilerindeki ilerlemeyi değerlendir.', 'dyscalculia', true),
('recommendation', 'DEHB tanılı öğrenci için dikkat ve odaklanma becerilerini geliştirici oyun önerileri sun.', 'adhd', true),
('recommendation', 'Disgrafi yaşayan öğrenci için yazma becerilerini destekleyici aktiviteler öner.', 'dysgraphia', true),
('analysis', 'Otizm spektrum bozukluğu olan öğrencinin sosyal etkileşim ve öğrenme paternlerini analiz et.', 'autism', true)
ON CONFLICT DO NOTHING;
