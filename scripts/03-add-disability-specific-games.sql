-- Disleksi için özel oyunlar (okuma ve harf tanıma odaklı)
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, estimated_duration, instructions) VALUES
('Harf Sıralama', 'Karışık harfleri doğru sırayla dizme oyunu', 'reading', 'easy', ARRAY['dyslexia'], 10, 'Ekranda görünen harfleri doğru sıraya koy'),
('Kelime Tamamlama', 'Eksik harfleri bularak kelimeleri tamamla', 'reading', 'medium', ARRAY['dyslexia'], 15, 'Boşluklara doğru harfleri yerleştir'),
('Hızlı Okuma', 'Kelimeleri hızlı okuma pratiği', 'reading', 'hard', ARRAY['dyslexia'], 20, 'Ekranda beliren kelimeleri oku ve hafızala'),
('Ses Analizi', 'Kelimelerdeki sesleri ayırt etme', 'reading', 'easy', ARRAY['dyslexia'], 12, 'Kelimelerdeki sesleri dinle ve tanı');

-- Diskalkuli için özel oyunlar (sayı ve matematik odaklı)
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, estimated_duration, instructions) VALUES
('Sayı Eşleştirme', 'Rakamları nesnelerle eşleştir', 'math', 'easy', ARRAY['dyscalculia'], 10, 'Doğru sayıda nesneyi seç'),
('Toplama Ustası', 'Basit toplama işlemleri', 'math', 'easy', ARRAY['dyscalculia'], 15, 'İki sayıyı topla'),
('Çıkarma Kahramanı', 'Çıkarma işlemleri pratiği', 'math', 'medium', ARRAY['dyscalculia'], 15, 'Sayıları çıkar'),
('Örüntü Bulma', 'Sayı dizilerindeki örüntüleri bul', 'math', 'medium', ARRAY['dyscalculia'], 18, 'Eksik sayıyı tamamla'),
('Geometri Dünyası', 'Şekilleri tanıma ve sayma', 'math', 'easy', ARRAY['dyscalculia'], 12, 'Şekilleri say ve grupla');

-- ADHD için özel oyunlar (dikkat ve odaklanma odaklı)
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, estimated_duration, instructions) VALUES
('Odaklanma Oyunu', 'Kısa süreli dikkat geliştirme', 'attention', 'easy', ARRAY['adhd'], 8, 'Hedefi takip et'),
('Hızlı Tepki', 'Refleks ve hız oyunu', 'attention', 'medium', ARRAY['adhd'], 10, 'Doğru zamanda tıkla'),
('Renk ve Şekil', 'Görsel ayırt etme becerisi', 'attention', 'easy', ARRAY['adhd'], 12, 'Aynı renk ve şekilleri bul'),
('Dikkat Testi', 'Uzun süreli dikkat geliştirme', 'attention', 'hard', ARRAY['adhd'], 20, 'Hedefe odaklan'),
('Hafıza Kartları', 'Kısa süreli hafıza güçlendirme', 'memory', 'medium', ARRAY['adhd'], 15, 'Eşleşen kartları bul');

-- Disgrafya için özel oyunlar (yazma ve motor beceri odaklı)
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, estimated_duration, instructions) VALUES
('Harf İzleme', 'Harfleri doğru şekilde çizme', 'writing', 'easy', ARRAY['dysgraphia'], 10, 'Harfi takip et'),
('Kelime Yazma', 'Kelimeleri doğru yazma pratiği', 'writing', 'medium', ARRAY['dysgraphia'], 15, 'Kelimeyi yaz'),
('Cümle Oluşturma', 'Doğru cümle yapısı', 'writing', 'medium', ARRAY['dysgraphia', 'dyslexia'], 18, 'Kelimeleri sırala');

-- Karma öğrenme güçlükleri için oyunlar
INSERT INTO games (title, description, category, difficulty_level, target_disabilities, estimated_duration, instructions) VALUES
('Mantık Oyunu', 'Problem çözme becerisi', 'attention', 'medium', ARRAY['adhd', 'dyscalculia'], 15, 'Soruları çöz'),
('Görsel Hafıza', 'Resimleri hatırlama', 'memory', 'easy', ARRAY['dyslexia', 'adhd'], 12, 'Resimleri eşleştir'),
('Sıralama Ustası', 'Nesneleri kategorilere ayırma', 'attention', 'medium', ARRAY['adhd', 'autism'], 15, 'Nesneleri grupla');
