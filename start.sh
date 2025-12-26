#!/bin/bash

# Batak Pro - Hızlı Başlatma Script
# Kullanım: ./start.sh veya bash start.sh

echo "🚀 Batak Pro başlatılıyor..."
echo ""

# Proje dizinine git
cd "$(dirname "$0")"

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies yükleniyor..."
    npm install
    echo ""
fi

# Dev server'ı başlat
echo "✅ Dev server başlatılıyor..."
echo "🌐 Tarayıcı otomatik açılacak: http://localhost:3000"
echo "📱 Mobil test için Network URL'i terminal'de görünecek"
echo ""
echo "💡 Hot reload aktif - Kod değişiklikleri anında yansır!"
echo "🛑 Durdurmak için: Ctrl+C"
echo ""

npm run dev:open

