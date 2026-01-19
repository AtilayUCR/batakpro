# 🚀 GitHub Repository Kurulum Rehberi

## Adım 1: GitHub'da Repository Oluştur

1. GitHub'a git: https://github.com/new
2. Repository adı: `batak-pro` (veya istediğin isim)
3. **Public** veya **Private** seç (önerilen: Private)
4. **Initialize with README** seçme (zaten var)
5. **Create repository** tıkla

## Adım 2: Remote Ekle ve Push Et

Terminal'de şu komutları çalıştır:

```bash
cd /Users/mujdatatilayucar/Desktop/batakpro

# Remote ekle (YOUR_USERNAME ve REPO_NAME'i değiştir)
# Token'ı environment variable veya GitHub CLI ile kullan
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Veya SSH kullanmak istersen:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Branch'i main olarak değiştir (isteğe bağlı)
git branch -M main

# Push et (token gerekirse GitHub CLI kullan veya credential helper)
git push -u origin main

# Tag'leri push et
git push origin v1.0.0
```

## Adım 3: Token ile Push (Alternatif)

Eğer token kullanmak istersen:

```bash
# Environment variable olarak token'ı ayarla
export GITHUB_TOKEN="your_token_here"

# Remote'u token ile ekle
git remote set-url origin https://${GITHUB_TOKEN}@github.com/YOUR_USERNAME/REPO_NAME.git

# Push et
git push -u origin main
git push origin v1.0.0
```

## Hızlı Komut (Repository oluşturduktan sonra)

```bash
# YOUR_USERNAME ve REPO_NAME'i değiştir
export GITHUB_USER="YOUR_USERNAME"
export REPO_NAME="batak-pro"
export GITHUB_TOKEN="your_token_here"

git remote add origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git
git branch -M main
git push -u origin main
git push origin v1.0.0
```

## ✅ Kontrol

Push işlemi başarılı olduysa:
- GitHub'da repository'ni aç
- "Releases" sekmesine git
- v1.0.0 tag'ini görmelisin

## 🔒 Güvenlik Notu

⚠️ **ÖNEMLİ:** Token'ı asla public repository'de commit etme!
- `.gitignore` dosyasına `.env` ekledim
- Token'ı environment variable olarak kullan
- Veya GitHub CLI kullan: `gh auth login`
- Veya GitHub'da repository'yi Private yap

## 📝 Sonraki Adımlar

1. Repository oluştur
2. Remote ekle (yukarıdaki komutlarla)
3. Push et
4. Tag push et
5. GitHub'da Release oluştur (opsiyonel)
