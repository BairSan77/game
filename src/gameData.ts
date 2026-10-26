export const SEASONS = ['🌸 Весна', '☀️ Лето', '🍂 Осень', '❄️ Зима'];

export const LEVELS = [
  { name: 'Начинающий фермер', desc: 'Первые шаги в органическом земледелии', capitalNeeded: 0 },
  { name: 'Опытный фермер', desc: 'Освоили основы биогазового производства', capitalNeeded: 500000 },
  { name: 'Агропредприниматель', desc: 'Стабильное производство и продажи', capitalNeeded: 2000000 },
  { name: 'Промышленник', desc: 'Крупномасштабное производство', capitalNeeded: 8000000 },
  { name: 'Директор кластера', desc: 'Руководитель агропромышленного кластера', capitalNeeded: 25000000 },
  { name: 'Эко-Магнат', desc: 'Легенда органического земледелия!', capitalNeeded: 50000000 },
];

export const CROPS = [
  { name: 'Пшеница', growthDays: 4, yield: 2.5, season: ['Весна', 'Лето'] },
  { name: 'Кукуруза', growthDays: 5, yield: 4, season: ['Лето'] },
  { name: 'Подсолнечник', growthDays: 4, yield: 1.8, season: ['Лето', 'Осень'] },
  { name: 'Озимая рожь', growthDays: 6, yield: 3, season: ['Осень', 'Зима'] },
];

export const RANDOM_EVENTS = [
  { text: '🌧️ Обильные дожди повысили урожайность! +20% урожая', type: 'positive' as const, effect: 'harvest_boost' },
  { text: '📰 Местное ТВ взяло интервью о вашей ферме! Репутация +3', type: 'positive' as const, effect: 'rep_boost' },
  { text: '🏆 Вы получили региональную награду за эко-производство! +500 000 ₽', type: 'positive' as const, effect: 'money_boost' },
  { text: '🔧 Поломка оборудования! Ремонт: -150 000 ₽', type: 'negative' as const, effect: 'money_loss' },
  { text: '🐛 Вредители атаковали поля! Потеряно 30% урожая', type: 'negative' as const, effect: 'harvest_loss' },
  { text: '📋 Проверка Россельхознадзора пройдена! Репутация +2', type: 'positive' as const, effect: 'rep_small' },
  { text: '💨 Ураган повредил хранилище биогаза! Потеряно 20% газа', type: 'negative' as const, effect: 'gas_loss' },
  { text: '🎓 Ваш агроном прошёл курсы повышения! +15% к урожаю навсегда', type: 'positive' as const, effect: 'agronomist_boost' },
  { text: '📈 Спрос на органику вырос! Цены +10% на неделю', type: 'positive' as const, effect: 'price_boost' },
  { text: '🤝 Новый клиент заинтересован в контракте на утилизацию', type: 'neutral' as const, effect: 'new_contract' },
  { text: '⚡ Скачок напряжения повредил реактор! -200 000 ₽ на ремонт', type: 'negative' as const, effect: 'reactor_damage' },
  { text: '🌟 Ваша продукция отмечена на международной выставке! Репутация +5', type: 'positive' as const, effect: 'rep_big' },
];

export const INITIAL_STATE = {
  playerName: '',
  money: 500000,
  reputation: 30,
  day: 1,
  week: 1,
  year: 2026,
  season: 'Весна',
  farmSize: 2,
  level: 0,
  levelName: 'Начинающий фермер',
  achievements: [],
  resources: { organic: 0, biogas: 0, digestate: 0, harvest: 0 },
  personnel: { workers: 3, agronomist: false, engineer: false, exportManager: false, morale: 75 },
  contracts: [],
  events: [],
  fields: [],
  reactorActive: false,
  reactorLevel: 1,
  hasISOCert: false,
  hasExportLicense: false,
  exportMarkets: [],
  gameStarted: false,
  gameWon: false,
};

export const WIN_CAPITAL = 50000000;
export const WIN_REPUTATION = 95;
