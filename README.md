# Eğitim Platformu

Özel eğitim öğrencileri için interaktif oyun tabanlı öğrenme platformu.

## Kurulum

### 1. Bağımlılıkları Yükleyin
\`\`\`bash
npm install
\`\`\`

### 2. Veritabanı Kurulumu

Bu proje Neon PostgreSQL veritabanı kullanmaktadır.

1. [Neon](https://neon.tech) hesabı oluşturun
2. Yeni bir proje ve veritabanı oluşturun
3. Connection string'i kopyalayın

### 3. Ortam Değişkenlerini Ayarlayın

Proje kök dizininde `.env.local` dosyası oluşturun:

\`\`\`env
DATABASE_URL=postgresql://kullanici:sifre@host/veritabani?sslmode=require
\`\`\`

### 4. Veritabanı Tablolarını Oluşturun

`scripts/` klasöründeki SQL dosyalarını sırasıyla çalıştırın:
1. `01-create-schema.sql` - Tabloları oluşturur
2. `02-seed-data.sql` - Test verilerini ekler

### 5. Uygulamayı Başlatın

\`\`\`bash
npm run dev
\`\`\`

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Test Hesapları

| Rol | Email | Şifre |
|-----|-------|-------|
| Öğrenci | ogrenci@test.com | test123 |
| Öğretmen | ogretmen@test.com | test123 |
| Admin | admin@test.com | test123 |

## Özellikler

- Disleksi, Diskalkuli, ADHD ve Disgrafya için özel eğitim oyunları
- Öğrenci ilerleme takibi
- Öğretmen görev atama sistemi
- Rozet ve başarı sistemi
- Adaptif zorluk seviyeleri
