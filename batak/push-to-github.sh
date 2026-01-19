#!/bin/bash

# Batak Pro - GitHub Push Script
# Kullanım: ./push-to-github.sh YOUR_USERNAME REPO_NAME [TOKEN]

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Kullanım: ./push-to-github.sh YOUR_USERNAME REPO_NAME [TOKEN]"
    echo "Örnek: ./push-to-github.sh mujdatatilayucar batak-pro"
    echo "Token opsiyonel: Environment variable GITHUB_TOKEN kullanılır"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2
TOKEN="${3:-${GITHUB_TOKEN}}"

if [ -z "$TOKEN" ]; then
    echo "⚠️  Token bulunamadı!"
    echo "   Environment variable GITHUB_TOKEN ayarla veya 3. parametre olarak ver"
    echo "   Örnek: GITHUB_TOKEN=your_token ./push-to-github.sh $GITHUB_USER $REPO_NAME"
    exit 1
fi

echo "🚀 GitHub'a push ediliyor..."
echo "Repository: $GITHUB_USER/$REPO_NAME"
echo ""

# Remote kontrolü
if git remote | grep -q "origin"; then
    echo "✅ Remote zaten var, güncelleniyor..."
    git remote set-url origin https://${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git
else
    echo "➕ Remote ekleniyor..."
    git remote add origin https://${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git
fi

# Branch'i main yap
git branch -M main

# Push et
echo "📤 Push ediliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Push başarılı!"
    
    # Tag push et
    echo "🏷️  Tag push ediliyor..."
    git push origin v1.0.0
    
    if [ $? -eq 0 ]; then
        echo "✅ Tag push başarılı!"
        echo ""
        echo "🎉 Tamamlandı! GitHub'da kontrol et:"
        echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
        echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}/releases/tag/v1.0.0"
    else
        echo "❌ Tag push başarısız!"
    fi
else
    echo "❌ Push başarısız! Repository'yi oluşturduğundan emin ol."
    echo "   https://github.com/new"
fi
