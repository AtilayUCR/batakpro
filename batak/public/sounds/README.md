# 🔊 Ses Dosyaları Rehberi

## İhtiyaç Duyulan Sesler

Bu klasöre aşağıdaki ses dosyalarını eklemeniz gerekiyor:

| Dosya Adı | Açıklama | Önerilen Süre |
|-----------|----------|---------------|
| `card_deal.mp3` | Kart dağıtma sesi | 0.3-0.5 sn |
| `card_play.mp3` | Kart atma/oynama sesi | 0.2-0.4 sn |
| `card_shuffle.mp3` | Kart karıştırma sesi | 1-2 sn |
| `trick_win.mp3` | El kazanma sesi | 0.5-1 sn |
| `game_win.mp3` | Oyun kazanma sesi | 1-2 sn |
| `game_lose.mp3` | Oyun kaybetme sesi | 1-2 sn |
| `bid_place.mp3` | İhale yapma sesi | 0.3 sn |
| `bid_pass.mp3` | Pas geçme sesi | 0.3 sn |
| `coin_earn.mp3` | Coin kazanma sesi | 0.5 sn |
| `level_up.mp3` | Seviye atlama sesi | 1-2 sn |
| `button_click.mp3` | Buton tıklama sesi | 0.1-0.2 sn |
| `notification.mp3` | Bildirim sesi | 0.5 sn |

## Format Gereksinimleri

- **Format:** MP3
- **Bitrate:** 128kbps (yeterli kalite, küçük dosya boyutu)
- **Sample Rate:** 44100 Hz
- **Channels:** Mono veya Stereo

## Ücretsiz Ses Kaynakları

### 1. Freesound.org (CC0 Lisans - En İyi)
- https://freesound.org/search/?q=card+flip
- https://freesound.org/search/?q=card+shuffle
- https://freesound.org/search/?q=casino+chip
- https://freesound.org/search/?q=game+win

### 2. Pixabay (Ücretsiz)
- https://pixabay.com/sound-effects/search/card/
- https://pixabay.com/sound-effects/search/game/

### 3. Mixkit (Ücretsiz)
- https://mixkit.co/free-sound-effects/game/

## Önerilen Ses Arama Terimleri

- "card flip sound"
- "card shuffle sound"
- "playing card sound effect"
- "casino chip sound"
- "game win fanfare"
- "game over sound"
- "coin collect sound"
- "level up sound"
- "button click sound"
- "notification ding"

## İndirdikten Sonra

1. Dosyaları bu klasöre (`public/sounds/`) kopyalayın
2. Dosya isimlerini yukarıdaki tabloya göre yeniden adlandırın
3. Uygulamayı yeniden başlatın: `npm run dev`

## Test Etme

Ses dosyalarını ekledikten sonra, tarayıcı konsolunda test edebilirsiniz:

```javascript
new Audio('/sounds/card_play.mp3').play();
```

