// CSS Pattern'leri - Internetsiz Çalışan SVG Pattern'ler

// Base64 encoded SVG pattern'ler
export const PATTERNS = {
  // Keçe dokusu - Yeşil masa için
  felt: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  
  // Ahşap dokusu
  wood: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M0 0h100v2H0zM0 20h100v1H0zM0 40h100v1H0zM0 60h100v1H0zM0 80h100v2H0z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Kadife dokusu
  velvet: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='0' cy='0' r='1'/%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3Ccircle cx='0' cy='40' r='1'/%3E%3Ccircle cx='40' cy='0' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Yıldız dokusu - Gece teması için
  stardust: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='30' r='0.5'/%3E%3Ccircle cx='80' cy='20' r='1'/%3E%3Ccircle cx='30' cy='60' r='0.5'/%3E%3Ccircle cx='70' cy='80' r='1'/%3E%3Ccircle cx='20' cy='90' r='0.5'/%3E%3Ccircle cx='90' cy='50' r='1'/%3E%3Ccircle cx='60' cy='70' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Kağıt dokusu
  paper: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23000' stroke-opacity='0.02'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Elmas dokusu - Kart arkası için
  diamonds: `url("data:image/svg+xml,%3Csvg width='16' height='32' viewBox='0 0 16 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M8 0l8 16-8 16L0 16z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Çizgili doku
  stripes: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h1v40H0zM10 0h1v40h-1zM20 0h1v40h-1zM30 0h1v40h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Dama dokusu
  checkers: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Dalga dokusu
  waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  
  // Altıgen doku
  hexagons: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Neon ızgara
  neonGrid: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2300ff00' stroke-opacity='0.1'%3E%3Cpath d='M0 50h100M50 0v100'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Kumlu doku
  sand: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='5' cy='5' r='1'/%3E%3Ccircle cx='25' cy='15' r='0.5'/%3E%3Ccircle cx='45' cy='25' r='1'/%3E%3Ccircle cx='15' cy='35' r='0.5'/%3E%3Ccircle cx='35' cy='45' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Lav dokusu
  lava: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff4500' fill-opacity='0.1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Orman dokusu
  forest: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.1'%3E%3Cpath d='M30 0l5 10h-10zM30 20l5 10h-10zM10 30l5 10H5zM50 30l5 10h-10z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Okyanus dokusu
  ocean: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Uzay dokusu
  space: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='20' cy='30' r='1' fill-opacity='0.3'/%3E%3Ccircle cx='80' cy='60' r='0.5' fill-opacity='0.2'/%3E%3Ccircle cx='150' cy='20' r='1.5' fill-opacity='0.4'/%3E%3Ccircle cx='40' cy='120' r='0.5' fill-opacity='0.2'/%3E%3Ccircle cx='180' cy='90' r='1' fill-opacity='0.3'/%3E%3Ccircle cx='100' cy='150' r='0.5' fill-opacity='0.2'/%3E%3Ccircle cx='60' cy='180' r='1' fill-opacity='0.3'/%3E%3Ccircle cx='140' cy='160' r='1.5' fill-opacity='0.4'/%3E%3Ccircle cx='30' cy='80' r='0.5' fill-opacity='0.15'/%3E%3Ccircle cx='170' cy='140' r='0.5' fill-opacity='0.15'/%3E%3C/g%3E%3C/svg%3E")`,
  
  // Kiraathane özel doku
  kiraathane: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
};

// Tema -> Pattern eşleştirmesi
export const THEME_PATTERNS: Record<string, string> = {
  classic: PATTERNS.felt,
  casino: PATTERNS.diamonds,
  wood: PATTERNS.wood,
  royal: PATTERNS.velvet,
  midnight: PATTERNS.stardust,
  vintage: PATTERNS.paper,
  forest: PATTERNS.forest,
  ocean: PATTERNS.ocean,
  lava: PATTERNS.lava,
  sunset: PATTERNS.waves,
  space: PATTERNS.space,
  desert: PATTERNS.sand,
  neon: PATTERNS.neonGrid,
  kiraathane: PATTERNS.kiraathane,
};

// Pattern'i CSS olarak al
export const getPatternCSS = (themeName: string): string => {
  return THEME_PATTERNS[themeName] || PATTERNS.felt;
};

