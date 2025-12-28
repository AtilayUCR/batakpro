// Bot Kişilik Sistemi - Dinamik ve Bağlama Duyarlı Konuşmalar

export interface BotPersonality {
  id: string;
  name: string;
  avatar: string;
  style: 'aggressive' | 'cautious' | 'bluffer' | 'troll' | 'wise' | 'rookie';
  gender: 'male' | 'female';
  ageGroup: 'young' | 'middle' | 'old';
  mood: 'happy' | 'neutral' | 'angry' | 'surprised' | 'confident';
  quotes: {
    // Oyun durumları
    gameStart: string[];
    trickWin: string[];
    trickLose: string[];
    gameWin: string[];
    gameLose: string[];
    batak: string[];
    perfectGame: string[];
    
    // İhale
    bidLow: string[];
    bidHigh: string[];
    bidPass: string[];
    bidWin: string[];
    
    // Oyun sırası
    playFirst: string[];
    playLast: string[];
    playTrump: string[];
    
    // Duruma göre
    winning: string[];
    losing: string[];
    close: string[];
    
    // Sosyal
    taunt: string[];
    compliment: string[];
    frustrated: string[];
    excited: string[];
    thinking: string[];
  };
}

// 6 Farklı Kişilik Tipi
export const BOT_PERSONALITIES: BotPersonality[] = [
  // 1. TOSUN DAYI - Agresif, yaşlı, deneyimli
  {
    id: 'tosun',
    name: 'Tosun Dayı',
    avatar: '👴',
    style: 'aggressive',
    gender: 'male',
    ageGroup: 'old',
    mood: 'confident',
    quotes: {
      gameStart: [
        "Haydi bakalım, göreyim sizi!",
        "Bu masada patron benim!",
        "Eski kurt kurnaz olur.",
        "Gençler, ders zamanı!",
        "40 yıllık tecrübe konuşuyor.",
        "Hazır mısınız yenilmeye?",
        "Bu oyunu ben icat ettim sanki.",
      ],
      trickWin: [
        "Ha şöyle!",
        "Görün bakalım ustalığı!",
        "Ben varken rahat yok!",
        "Tecrübe işte bu.",
        "Kolay değil benimle oynamak.",
        "Bir el daha bende.",
        "Yaşlı kurdu küçümseme!",
        "Öğrenin bakın.",
      ],
      trickLose: [
        "Hmm, iyi oynadın.",
        "Bu sefer senin olsun.",
        "Bekle sen.",
        "Şans bu sefer senden yana.",
        "Acele etme, daha bitmedi.",
      ],
      gameWin: [
        "Demiştim ben!",
        "40 yıllık tecrübe!",
        "Yaş kemale ermiş!",
        "Bir ders daha tamamlandı.",
        "Tosun Dayı'yı yenemezsiniz!",
        "Usta işi!",
      ],
      gameLose: [
        "Bu sefer affettim.",
        "Şansına küs!",
        "Bir dahakine görüşürüz.",
        "İyi oynadın, kabul.",
        "Yaşlandık galiba...",
      ],
      batak: [
        "Eyvah be!",
        "Kahretsin!",
        "Bu olmadı!",
        "40 yılda ilk kez!",
        "Hay aksi!",
      ],
      perfectGame: [
        "İşte buna oyun derim!",
        "13'te 13! Mükemmel!",
        "Yaşlı kurt bu.",
      ],
      bidLow: [
        "4 yeter bana.",
        "Temkinli gidiyorum.",
        "Küçük ama emin adımlar.",
      ],
      bidHigh: [
        "12 diyorum, kim artırır?",
        "Cesaretiniz varsa gelin!",
        "Bu el benim olacak!",
        "Korkak değilim ben!",
      ],
      bidPass: [
        "Bu el pas.",
        "Bekleyeceğim.",
        "Sizi izliyorum.",
      ],
      bidWin: [
        "İhale bende!",
        "Göstereceğim size.",
        "Hazırlanın!",
      ],
      playFirst: [
        "Önden gidiyorum.",
        "Açılışı ben yapayım.",
        "Seyredin.",
      ],
      playLast: [
        "Finali ben yapayım.",
        "Bekledim, şimdi vuracağım.",
        "Son söz bende.",
      ],
      playTrump: [
        "Koz devrede!",
        "Bunu yeyin bakalım!",
        "Trump zamanı!",
      ],
      winning: [
        "Rahat oyun bu.",
        "Devam devam.",
        "Güzel gidiyor.",
        "Plan işliyor.",
      ],
      losing: [
        "Hmm, zor iş.",
        "Ama bitmedi!",
        "Daha erken sevinmeyin.",
        "Bekleyin siz.",
      ],
      close: [
        "Bu heyecanlı olacak.",
        "Son dakikaya kadar belli olmaz.",
        "Kim alır acaba?",
      ],
      taunt: [
        "Korktunuz mu?",
        "Bu kadar mı?",
        "Daha neler göreceksiniz!",
        "Acemi misiniz?",
        "Ben yokken mi öğrendiniz?",
      ],
      compliment: [
        "İyi hamle.",
        "Tebrikler.",
        "Güzel oynadın.",
        "Potansiyelin var.",
      ],
      frustrated: [
        "Olmaz böyle şey!",
        "Ne şans bu!",
        "İnanamıyorum!",
      ],
      excited: [
        "Ohoo!",
        "İşte bu!",
        "Harika!",
      ],
      thinking: [
        "Düşüneyim...",
        "Hmm...",
        "Bir dakika...",
        "Bakalım...",
      ],
    },
  },
  
  // 2. SELIN - Genç, troll, eğlenceli
  {
    id: 'selin',
    name: 'Selin',
    avatar: '👩',
    style: 'troll',
    gender: 'female',
    ageGroup: 'young',
    mood: 'happy',
    quotes: {
      gameStart: [
        "Hazır mısınız kaybetmeye? 😏",
        "Bu oyun çok kolay olacak.",
        "Selam! Eğlenmeye geldim.",
        "Hadi bakalım, göster kendini!",
        "Bugün şanslıyım hissediyorum ✨",
        "Yine mi ben kazanacağım?",
      ],
      trickWin: [
        "Ezzzz! 😎",
        "Çok kolaydı bu.",
        "Üzgünüm... şaka, değilim 😂",
        "Bu da bende!",
        "Yine mi? Sıkılmadınız mı?",
        "GG!",
        "Too easy!",
        "Oof!",
      ],
      trickLose: [
        "Şansına küs! 😤",
        "Ama... ama...",
        "Bu olmaz!",
        "Nasıl ya?!",
        "Bekle sen! 😈",
      ],
      gameWin: [
        "EZ WIN! 🏆",
        "Söyledim mi?",
        "Selin her zaman kazanır!",
        "Thanks for playing! 😘",
        "One more? 😏",
      ],
      gameLose: [
        "Bug var kesin 🐛",
        "Lag yaptı!",
        "Şanslıydın!",
        "Rematch! Şimdi!",
        "Bu sayılmaz!",
      ],
      batak: [
        "NOOOO! 😭",
        "Bu kabus!",
        "Olmaz olmaz olmaz!",
        "Hileee!",
      ],
      perfectGame: [
        "PERFECT! 💯",
        "13/13! Efsane!",
        "I'm the best! 👑",
      ],
      bidLow: [
        "4 atıyorum, temkinli.",
        "Küçük başlayalım.",
      ],
      bidHigh: [
        "12! YOLO! 🎲",
        "All in!",
        "Cesaretsiz kazanamaz!",
        "13! Neden olmasın?",
      ],
      bidPass: [
        "Pas, bu sefer izliyorum.",
        "Skip!",
        "Nah, beklerim.",
      ],
      bidWin: [
        "Benim turn!",
        "Showtime! 🎬",
        "Seyredin ve öğrenin.",
      ],
      playFirst: [
        "Ben başlıyorum!",
        "First blood!",
        "Açıyorum!",
      ],
      playLast: [
        "Finali ben yapayım 🎭",
        "Ve... bu!",
        "Son hamle!",
      ],
      playTrump: [
        "TRUMP! 💣",
        "Koz attım! Deal with it!",
        "Boom! 💥",
      ],
      winning: [
        "Eğleniyor musunuz? 😏",
        "Too ez!",
        "Devam devam!",
        "Loving it! ❤️",
      ],
      losing: [
        "Hala kazanabilirim!",
        "Plot twist geliyor!",
        "Bekle sen!",
        "Comeback queen! 👑",
      ],
      close: [
        "Heyecanlı!",
        "Drama! 🎭",
        "Bu finale gidiyor!",
      ],
      taunt: [
        "Ağlama sonra! 😢",
        "Kolay olacak bu.",
        "Acıdım size.",
        "Şimdiden gg.",
        "Ez clap! 👏",
        "Noob? 🤔",
      ],
      compliment: [
        "Oha! İyi oynadın!",
        "Respect! ✊",
        "Nice one!",
        "GG WP!",
      ],
      frustrated: [
        "AAAHH! 😤",
        "Bu nasıl olur?!",
        "Şaka mı bu?!",
      ],
      excited: [
        "YESSS! 🎉",
        "Wohooo!",
        "Let's gooo!",
      ],
      thinking: [
        "Hmm... 🤔",
        "Wait...",
        "Düşünüyorum...",
        "Bir saniye...",
      ],
    },
  },
  
  // 3. HALİL USTA - Bilge, sakin, stratejik
  {
    id: 'halil',
    name: 'Halil Usta',
    avatar: '🧔',
    style: 'wise',
    gender: 'male',
    ageGroup: 'middle',
    mood: 'neutral',
    quotes: {
      gameStart: [
        "Hayırlı oyunlar.",
        "Bakalım kader ne gösterecek.",
        "Her oyun bir derstir.",
        "Sabırla, dikkatle.",
        "Bismillah.",
      ],
      trickWin: [
        "Hamdolsun.",
        "Güzel bir el.",
        "Sabır kazanır.",
        "Her şey plana göre.",
        "İyi gidiyor.",
        "Şükür.",
      ],
      trickLose: [
        "Olur böyle şeyler.",
        "Her kaybediş bir ders.",
        "Sıkıntı yok.",
        "Devam edelim.",
        "Kader böyleymiş.",
      ],
      gameWin: [
        "Allah'a şükür.",
        "Güzel bir oyundu.",
        "Teşekkürler herkese.",
        "Bereketli bir oyun oldu.",
      ],
      gameLose: [
        "Hayırlısı bu.",
        "Kazanmak kaybetmek var.",
        "İnşallah sıradaki.",
        "Helal olsun.",
      ],
      batak: [
        "Kader...",
        "Olmadı bu sefer.",
        "Sabır.",
        "Bir dahakine.",
      ],
      perfectGame: [
        "Maşallah!",
        "Allah'ın lütfu.",
        "Harika bir el.",
      ],
      bidLow: [
        "Temkinli gidiyorum.",
        "Küçük ama emin.",
        "Yavaş yavaş.",
      ],
      bidHigh: [
        "Allah'ın izniyle.",
        "Güveniyorum elime.",
        "Tevekkül.",
      ],
      bidPass: [
        "Bu el pas.",
        "Bekleyeceğim.",
        "Sabredelim.",
      ],
      bidWin: [
        "İhale bende.",
        "Hayırlısı.",
        "Başlayalım.",
      ],
      playFirst: [
        "Önce ben.",
        "Açalım.",
        "Bismillah.",
      ],
      playLast: [
        "Son söz.",
        "Kapatalım.",
        "Bu kadar.",
      ],
      playTrump: [
        "Koz girdi.",
        "Mecbur kaldık.",
        "Koz zamanı.",
      ],
      winning: [
        "Güzel gidiyor.",
        "Hamdolsun.",
        "Devam.",
        "İyi iyi.",
      ],
      losing: [
        "Sabır.",
        "Daha bitmedi.",
        "Tevekkül.",
        "Her şey olabilir.",
      ],
      close: [
        "Heyecanlı.",
        "Bakalım.",
        "Allah'a havale.",
      ],
      taunt: [
        "Aceleniz ne?",
        "Sabırsızlık kaybettirir.",
        "Yavaş yavaş.",
      ],
      compliment: [
        "Maşallah.",
        "Güzel hamle.",
        "Aferin.",
        "Helal.",
      ],
      frustrated: [
        "Hay Allah.",
        "Eyvah.",
        "Olmadı.",
      ],
      excited: [
        "Ohhh!",
        "Güzel!",
        "Harika!",
      ],
      thinking: [
        "Bir düşüneyim...",
        "Hmm...",
        "Bakalım...",
        "Sabır...",
      ],
    },
  },
  
  // 4. DEFNE - Temkinli, stratejik, sakin
  {
    id: 'defne',
    name: 'Defne',
    avatar: '👩‍🦰',
    style: 'cautious',
    gender: 'female',
    ageGroup: 'young',
    mood: 'neutral',
    quotes: {
      gameStart: [
        "Dikkatli oynayalım.",
        "Stratejik gidiyorum.",
        "Her hamle önemli.",
        "Hazırım.",
        "Konsantre olalım.",
      ],
      trickWin: [
        "Plana göre.",
        "İyi hesapladım.",
        "Güzel.",
        "Beklendiği gibi.",
        "Bir adım daha.",
        "Stratejim işliyor.",
      ],
      trickLose: [
        "Hesaplamam yanlış mıydı?",
        "Hmm, düşünmem lazım.",
        "Beklenmedik.",
        "Ayarlama yapmalıyım.",
        "Not aldım.",
      ],
      gameWin: [
        "Strateji kazandı.",
        "Planlı iş.",
        "Analiz doğruydu.",
        "Güzel oyundu.",
      ],
      gameLose: [
        "Analiz hatası.",
        "Bir dahakine düzeltirim.",
        "Not aldım.",
        "Tecrübe kazandım.",
      ],
      batak: [
        "Hesap hatası.",
        "Riskli oynamalıydım.",
        "Düzeltirim.",
      ],
      perfectGame: [
        "Mükemmel analiz!",
        "Her şey plana göre.",
        "Strateji işe yaradı!",
      ],
      bidLow: [
        "Temkinli başlayalım.",
        "Risk almıyorum.",
        "Güvenli oynuyorum.",
      ],
      bidHigh: [
        "Elim güçlü, gidiyorum.",
        "Hesaplarım doğru.",
        "Analiz tamam, artırıyorum.",
      ],
      bidPass: [
        "Elim zayıf, pas.",
        "Risk almıyorum.",
        "Bekliyorum.",
      ],
      bidWin: [
        "Stratejimi uygulayacağım.",
        "Plan hazır.",
        "Başlayabiliriz.",
      ],
      playFirst: [
        "Açılış hamlesi.",
        "İlk adım.",
        "Strateji başlıyor.",
      ],
      playLast: [
        "Kapanış.",
        "Son hamle.",
        "Analiz tamamlandı.",
      ],
      playTrump: [
        "Koz kullanıyorum.",
        "Mecbur kaldım.",
        "Hesaplı koz.",
      ],
      winning: [
        "Plan işliyor.",
        "Güzel gidiyor.",
        "Devam edelim.",
        "Strateji doğru.",
      ],
      losing: [
        "Adapte olmalıyım.",
        "Plan değişikliği.",
        "Daha bitmedi.",
        "Yeni strateji.",
      ],
      close: [
        "Kritik nokta.",
        "Dikkatli olmalıyız.",
        "Her hamle önemli.",
      ],
      taunt: [
        "Acele hata getirir.",
        "Düşündün mü?",
        "Emin misin?",
      ],
      compliment: [
        "Güzel hamle.",
        "İyi düşünülmüş.",
        "Stratejik.",
        "Akıllıca.",
      ],
      frustrated: [
        "Hesap tutmadı.",
        "Beklenmedik.",
        "Hmm...",
      ],
      excited: [
        "Güzel!",
        "Plan işliyor!",
        "Harika!",
      ],
      thinking: [
        "Analiz ediyorum...",
        "Düşünüyorum...",
        "Bir dakika...",
        "Hesaplıyorum...",
      ],
    },
  },
  
  // 5. MERT - Blöfçü, risk sever
  {
    id: 'mert',
    name: 'Mert',
    avatar: '😎',
    style: 'bluffer',
    gender: 'male',
    ageGroup: 'young',
    mood: 'confident',
    quotes: {
      gameStart: [
        "Poker face aktif! 😎",
        "Blöf mü değil mi, bilemezsin!",
        "Risk almayan kazanamaz!",
        "Bugün şans benden yana!",
        "Yüksek risk, yüksek kazanç!",
      ],
      trickWin: [
        "Blöf değildi! 😏",
        "Ya da blöftü... kimin umurunda!",
        "Risk kazandırdı!",
        "Görüyor musun?",
        "Cesaret işte!",
        "Yine tuttum!",
        "Lucky? Skill! 💪",
      ],
      trickLose: [
        "Blöf tutmadı...",
        "Risk işte!",
        "Olsun, daha var!",
        "Her blöf tutmaz.",
        "Ama eğlenceliydi!",
      ],
      gameWin: [
        "Risk her zaman kazandırır!",
        "Blöfçüyü yenemedin!",
        "Poker face for the win!",
        "Cesur ol, kazan!",
      ],
      gameLose: [
        "Bu sefer tutmadı.",
        "Risk bazen bu.",
        "Ama eğlendim!",
        "Bir dahakine!",
      ],
      batak: [
        "Blöf fena patladı! 💥",
        "Çok fazla risk...",
        "Olsun, cesaret ettim!",
      ],
      perfectGame: [
        "Blöf değil, gerçek güç!",
        "Bazen elim gerçekten iyi!",
        "13/13! No bluff needed!",
      ],
      bidLow: [
        "Yavaş yavaş...",
        "Bekle beni.",
        "Sürpriz geliyor.",
      ],
      bidHigh: [
        "ALL IN! 13! 🎰",
        "Blöf mü gerçek mi? Gel gör!",
        "Cesaretin varsa artır!",
        "Risk almayan kazanamaz!",
        "12! Korktu mu?",
      ],
      bidPass: [
        "Stratejik pas.",
        "Sizi izliyorum.",
        "Bu sefer pas... ya da öyle mi?",
      ],
      bidWin: [
        "Showtime! 🎭",
        "Blöf zamanı!",
        "Hazır mısınız?",
      ],
      playFirst: [
        "Sürpriz geliyor!",
        "Açıyorum!",
        "Risk zamanı!",
      ],
      playLast: [
        "Ve... sürpriz! 🎉",
        "Finalde blöf!",
        "Beklediniz mi?",
      ],
      playTrump: [
        "Plot twist! 🔄",
        "Beklemiyordunuz değil mi?",
        "Koz bombası! 💣",
      ],
      winning: [
        "Risk kazandırıyor!",
        "Devam!",
        "Blöf üstüne blöf!",
        "On fire! 🔥",
      ],
      losing: [
        "Comeback geliyor!",
        "Daha büyük blöf zamanı!",
        "Bekle sen!",
        "Risk arttırıyorum!",
      ],
      close: [
        "Heyecan dorukta!",
        "Son blöf!",
        "All or nothing!",
      ],
      taunt: [
        "Korktu mu? 😏",
        "Blöf mü değil mi?",
        "Cesaretiniz yok!",
        "Risk almayı öğrenin!",
        "Oyun benim kontrolümde!",
      ],
      compliment: [
        "Güzel blöf!",
        "Risk almışsın!",
        "Cesur hamle!",
        "Respect! 🤝",
      ],
      frustrated: [
        "Blöf patladı!",
        "Çok fazla risk!",
        "Olacak iş değil!",
      ],
      excited: [
        "YESSSS! 🎉",
        "Risk kazandırdı!",
        "All in and WIN!",
      ],
      thinking: [
        "Blöf mü etsem... 🤔",
        "Risk mi alsam...",
        "Hmm...",
        "Poker face...",
      ],
    },
  },
  
  // 6. AYŞE TEYZE - Rookie, samimi, öğreniyor
  {
    id: 'ayse',
    name: 'Ayşe Teyze',
    avatar: '👵',
    style: 'rookie',
    gender: 'female',
    ageGroup: 'old',
    mood: 'happy',
    quotes: {
      gameStart: [
        "Aa selam çocuklar!",
        "Yine mi oynuyoruz? Çok seviyorum!",
        "Bu oyunu yeni öğrendim ama çok sevdim!",
        "Hadi bakalım, ne olacak!",
        "Çayınızı aldınız mı?",
      ],
      trickWin: [
        "Aaa kazandım mı? 😊",
        "Oooo aldım mı bunu?",
        "Vay canına! Ben mi aldım?",
        "Şansa bak ya!",
        "Öğreniyorum bakın!",
        "Çok mutlu oldum!",
        "Devam mı ediyoruz?",
      ],
      trickLose: [
        "Eyvah yanlış mı yaptım?",
        "Aaa şimdi anladım!",
        "Neyse öğreniyorum.",
        "Bir dahakine dikkat edeceğim.",
        "Olsun olsun.",
      ],
      gameWin: [
        "KAZANDIM MI?! 🎉",
        "Olamaz! Ben mi kazandım?!",
        "Çok mutlu oldum çocuklar!",
        "Ohooo! Bak sen!",
        "Teşekkürler herkese!",
      ],
      gameLose: [
        "Olsun olsun, öğreniyorum.",
        "Bir dahakine inşallah.",
        "Yine de çok eğlendim!",
        "Siz iyi oynadınız.",
        "Bravo size!",
      ],
      batak: [
        "Aaa eyvah! Ne oldu?",
        "Yanlış mı yaptım yoksa?",
        "Batak ne demekti ya?",
        "Özür dilerim!",
      ],
      perfectGame: [
        "BU NASIL OLDU?! 🤯",
        "13 tane mi? Vay be!",
        "Şanslıymışım demek!",
      ],
      bidLow: [
        "4 diyorum... doğru mu?",
        "Az diyeyim güvende olayım.",
        "Yüksek demekten korkuyorum.",
      ],
      bidHigh: [
        "Aaa yüksek mi desem?",
        "Cesaretlendim, 8!",
        "Belki de 10? Denemek lazım!",
      ],
      bidPass: [
        "Pas diyorum, bilmiyorum.",
        "Bu sefer izleyeyim.",
        "Elim pek iyi değil sanki.",
      ],
      bidWin: [
        "Aaa ihale bende mi?",
        "Heyecanlandım şimdi!",
        "Bakalım yapabilecek miyim.",
      ],
      playFirst: [
        "Ben mi başlıyorum?",
        "Hangisini atsam acaba?",
        "Bunu atayım mı?",
      ],
      playLast: [
        "Son bende mi?",
        "Şunu atıyorum o zaman.",
        "Doğru mu yaptım?",
      ],
      playTrump: [
        "Bu koz mu?",
        "Koz atıyorum galiba.",
        "Doğru mu bu?",
      ],
      winning: [
        "İyi gidiyormuşum!",
        "Vay be!",
        "Öğrendim galiba!",
        "Çok mutluyum!",
      ],
      losing: [
        "Daha öğreniyorum.",
        "Bir dahakine daha iyi!",
        "Olsun, eğleniyorum.",
        "Siz çok iyisiniz.",
      ],
      close: [
        "Heyecanlıyım!",
        "Kim kazanacak acaba?",
        "Çok merak ediyorum!",
      ],
      taunt: [
        "Aa yapma ya!",
        "Hiç acımıyorsunuz!",
        "Beni mi hedef aldınız?",
      ],
      compliment: [
        "Çok iyi oynuyorsunuz!",
        "Bravo size!",
        "Ben de böyle oynamak istiyorum!",
        "Ustasınız!",
      ],
      frustrated: [
        "Eyvah eyvah!",
        "Naptım ya!",
        "Yanlış oldu!",
      ],
      excited: [
        "Ohoooo!",
        "Vay canına!",
        "Çok güzel!",
      ],
      thinking: [
        "Bir düşüneyim bakim...",
        "Hmm acaba...",
        "Hangisini atsam...",
        "Bekleyin bir saniye...",
      ],
    },
  },
];

// Bot kişiliğine göre random isim oluştur
const PERSONALITY_NAMES: Record<string, string[]> = {
  aggressive: ['Tosun', 'Kemal', 'Cevdet', 'Hikmet', 'Necati', 'Galip', 'Sabri', 'Yılmaz'],
  cautious: ['Defne', 'Seda', 'Pelin', 'Melis', 'Irmak', 'Esra', 'Derya', 'Cansu'],
  bluffer: ['Mert', 'Kaan', 'Bora', 'Sinan', 'Onur', 'Deniz', 'Cem', 'Alper'],
  troll: ['Selin', 'Ece', 'Melis', 'Aslı', 'Duru', 'Pınar', 'Ceyda', 'Zeynep'],
  wise: ['Halil', 'Ahmet', 'Mehmet', 'Mustafa', 'İbrahim', 'Ömer', 'Hüseyin', 'Ali'],
  rookie: ['Ayşe', 'Fatma', 'Hatice', 'Zehra', 'Meryem', 'Emine', 'Şerife', 'Havva'],
};

// Rastgele kişilik seç
export const getRandomPersonality = (excludeIds: string[] = []): BotPersonality => {
  const available = BOT_PERSONALITIES.filter(p => !excludeIds.includes(p.id));
  if (available.length === 0) return BOT_PERSONALITIES[0];
  return available[Math.floor(Math.random() * available.length)];
};

// Kişiliğe göre isim al (kişiliğin varsayılan ismi yerine rastgele)
export const getNameForPersonality = (personality: BotPersonality, excludeNames: string[] = []): string => {
  const names = PERSONALITY_NAMES[personality.style] || PERSONALITY_NAMES.cautious;
  const available = names.filter(n => !excludeNames.includes(n));
  if (available.length === 0) return personality.name;
  return available[Math.floor(Math.random() * available.length)];
};

// Dinamik ve bağlama duyarlı cümle al
export const getBotQuote = (
  personality: BotPersonality,
  type: keyof BotPersonality['quotes'],
  context?: {
    isWinning?: boolean;
    tricksWon?: number;
    trickCount?: number;
    perfectGame?: boolean;
    isBatak?: boolean;
  }
): string => {
  let quotes = personality.quotes[type];
  
  // Bağlama göre ek cümleler
  if (context) {
    if (context.perfectGame && type === 'gameWin') {
      quotes = [...quotes, ...personality.quotes.perfectGame];
    }
    if (context.isBatak && type === 'gameLose') {
      quotes = [...quotes, ...personality.quotes.batak];
    }
    if (context.isWinning && (type === 'trickWin' || type === 'playFirst')) {
      quotes = [...quotes, ...personality.quotes.winning, ...personality.quotes.taunt];
    }
    if (!context.isWinning && context.tricksWon !== undefined && context.tricksWon < 3) {
      quotes = [...quotes, ...personality.quotes.losing];
    }
  }
  
  if (!quotes || quotes.length === 0) {
    quotes = personality.quotes.thinking;
  }
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// 3 benzersiz bot kişiliği al
export const getThreeUniqueBotPersonalities = (): { personality: BotPersonality; name: string }[] => {
  const result: { personality: BotPersonality; name: string }[] = [];
  const usedIds: string[] = [];
  const usedNames: string[] = [];
  
  for (let i = 0; i < 3; i++) {
    const personality = getRandomPersonality(usedIds);
    usedIds.push(personality.id);
    
    const name = getNameForPersonality(personality, usedNames);
    usedNames.push(name);
    
    result.push({ personality, name });
  }
  
  return result;
};

// Bot mood güncelleme
export const updateBotMood = (
  personality: BotPersonality,
  tricksWon: number,
  totalTricks: number,
  isWinning: boolean
): BotPersonality['mood'] => {
  const winRate = tricksWon / Math.max(totalTricks, 1);
  
  if (winRate > 0.6) return 'happy';
  if (winRate < 0.2) return personality.style === 'troll' ? 'angry' : 'neutral';
  if (isWinning) return 'confident';
  return 'neutral';
};

