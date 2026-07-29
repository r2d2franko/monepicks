const mlbLogos = {
  'Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
  'White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
  'Giants': 'https://a.espncdn.com/i/teamlogos/mlb/500/sf.png',
  'Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
  'Marlins': 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png',
  'Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
  'Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
  'Rockies': 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png',
  'Athletics': 'https://a.espncdn.com/i/teamlogos/mlb/500/oak.png',
  'Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
  // Otros equipos
  'Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
  'Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
  'Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
  'Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
  'Rangers': 'https://a.espncdn.com/i/teamlogos/mlb/500/tex.png',
  'Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
  'Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
  'Diamondbacks': 'https://a.espncdn.com/i/teamlogos/mlb/500/ari.png',
  'Orioles': 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png',
  'Rays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png',
  'Blue Jays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
  'Mariners': 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
  'Twins': 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
  'Guardians': 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
  'Tigers': 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
  'Royals': 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
  'Reds': 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png',
  'Pirates': 'https://a.espncdn.com/i/teamlogos/mlb/500/pit.png',
  'Nationals': 'https://a.espncdn.com/i/teamlogos/mlb/500/wsh.png',
  'Angels': 'https://a.espncdn.com/i/teamlogos/mlb/500/laa.png',
};

export function getTeamLogo(teamName) {
  // Búsqueda simple, si el nombre contiene alguna clave
  for (const [key, logoUrl] of Object.entries(mlbLogos)) {
    if (teamName?.includes(key)) {
      return logoUrl;
    }
  }
  // Logo genérico o de pelota si no se encuentra
  return 'https://cdn-icons-png.flaticon.com/512/820/820556.png';
}
