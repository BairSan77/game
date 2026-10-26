import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { LEVELS, CROPS, WIN_CAPITAL, WIN_REPUTATION } from './gameData';
import { Contract } from './types';

type Tab = 'production' | 'market' | 'contracts' | 'export' | 'upgrades' | 'personnel';

export default function App() {
  const game = useGameState();
  const { state } = game;
  const [activeTab, setActiveTab] = useState<Tab>('production');
  const [showProfile, setShowProfile] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (!state.gameStarted) {
    return (
      <LandingScreen
        onStart={() => setShowProfile(true)}
        onContinue={() => {
          const saved = localStorage.getItem('eco_magnate_save');
          if (saved) {
            window.location.reload();
          }
        }}
        showProfile={showProfile}
        playerNameInput={playerNameInput}
        setPlayerNameInput={setPlayerNameInput}
        onStartGame={() => game.startGame(playerNameInput)}
        hasSave={!!localStorage.getItem('eco_magnate_save')}
        showHowToPlay={showHowToPlay}
        setShowHowToPlay={setShowHowToPlay}
      />
    );
  }

  if (state.gameWon) {
    return <WinScreen state={state} onReset={game.resetGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-green-500/30 p-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="text-lg font-bold text-green-300">ЭКО-МАГНАТ</h1>
              <p className="text-xs text-green-400/80">ООО «Токчин-Эко»</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-200">🌸 {state.season}, день {state.day}, {state.year} г.</span>
            <span className="text-yellow-300">💰 {formatMoney(state.money)}</span>
            <span className="text-blue-300">⭐ {state.reputation}/100</span>
          </div>
          <div className="flex gap-2">
            <button onClick={game.saveGame} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs transition">💾 Сохранить</button>
            <button onClick={() => setShowProfile(!showProfile)} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs transition">👤 {state.playerName}</button>
          </div>
        </div>
      </header>

      {/* Level Bar */}
      <div className="bg-black/20 px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-lg">🌱</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-300 font-semibold">{state.levelName}</span>
                <span className="text-green-400/70">
                  {state.level < LEVELS.length - 1
                    ? `До след. уровня: ${formatMoney(LEVELS[state.level + 1].capitalNeeded - state.money)}`
                    : 'Максимальный уровень!'}
                </span>
              </div>
              <div className="h-2 bg-green-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (state.money / (LEVELS[Math.min(state.level + 1, LEVELS.length - 1)].capitalNeeded || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4">
        {/* Farm Overview */}
        <div className="bg-black/20 rounded-xl p-4 mb-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-green-300">🏡 Ваша ферма — {state.farmSize} га</h2>
            <span className="text-xs text-green-400/70">🏆 Достижений: {state.achievements.length}</span>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {state.fields.map(field => (
              <div key={field.id} className="bg-green-900/50 rounded-lg p-3 text-center border border-green-700/30">
                {field.planted ? (
                  <>
                    <div className="text-2xl mb-1">{field.ready ? '🌾' : '🌱'}</div>
                    <p className="text-xs text-green-300">{field.crop}</p>
                    <p className="text-xs text-green-400/70">
                      {field.ready ? '✅ Готово!' : `${field.growthDays}/${field.maxGrowthDays} нед.`}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-1">🟫</div>
                    <p className="text-xs text-green-400/50">Свободно</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResourceCard icon="🗑️" label="Органика" value={`${state.resources.organic.toFixed(1)} т`} />
            <ResourceCard icon="🔥" label="Биогаз" value={`${state.resources.biogas.toFixed(0)} м³`} />
            <ResourceCard icon="🌿" label="Дигестат" value={`${state.resources.digestate.toFixed(1)} т`} />
            <ResourceCard icon="🌾" label="Урожай" value={`${state.resources.harvest.toFixed(1)} т`} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 bg-black/20 rounded-lg p-1">
          {([
            { id: 'production', label: '🏭 Производство' },
            { id: 'market', label: '🛒 Рынок' },
            { id: 'contracts', label: '📜 Контракты' },
            { id: 'export', label: '🌍 Экспорт' },
            { id: 'upgrades', label: '🔧 Модернизация' },
            { id: 'personnel', label: '👷 Персонал' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-300 hover:bg-green-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black/20 rounded-xl p-4 border border-green-500/20 mb-4">
          {activeTab === 'production' && (
            <ProductionTab
              state={state}
              onBuyOrganic={game.buyOrganic}
              onActivateReactor={game.activateReactor}
              onPlantField={game.plantField}
              onHarvestField={game.harvestField}
            />
          )}
          {activeTab === 'market' && (
            <MarketTab
              state={state}
              onSellBiogas={game.sellBiogas}
              onSellDigestate={game.sellDigestate}
              onSellHarvest={game.sellHarvest}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractsTab
              state={state}
              availableContracts={availableContracts}
              onGenerate={game.generateAvailableContracts}
              onAccept={game.acceptContract}
              onSetAvailable={setAvailableContracts}
            />
          )}
          {activeTab === 'export' && (
            <ExportTab
              state={state}
              onExportEU={game.exportToEU}
              onExportChina={game.exportToChina}
              onExportUAE={game.exportToUAE}
              onGetISO={game.getISOCert}
              onGetLicense={game.getExportLicense}
            />
          )}
          {activeTab === 'upgrades' && (
            <UpgradesTab
              state={state}
              onUpgradeReactor={game.upgradeReactor}
              onExpandFarm={game.expandFarm}
            />
          )}
          {activeTab === 'personnel' && (
            <PersonnelTab
              state={state}
              onHireWorker={game.hireWorker}
              onFireWorker={game.fireWorker}
              onHireAgronomist={game.hireAgronomist}
              onHireEngineer={game.hireEngineer}
              onHireExportManager={game.hireExportManager}
            />
          )}
        </div>

        {/* Next Day Button */}
        <div className="text-center mb-4">
          <button
            onClick={game.nextDay}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition transform hover:scale-105"
          >
            ⏭️ Следующий день (+1 неделя)
          </button>
        </div>

        {/* Events */}
        {state.events.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 border border-green-500/20 mb-4">
            <h3 className="text-lg font-bold text-green-300 mb-3">📰 События</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.events.map(event => (
                <div
                  key={event.id}
                  className={`p-2 rounded-lg text-sm ${
                    event.type === 'positive'
                      ? 'bg-green-900/50 border border-green-500/30'
                      : event.type === 'negative'
                      ? 'bg-red-900/50 border border-red-500/30'
                      : 'bg-blue-900/50 border border-blue-500/30'
                  }`}
                >
                  <span className="text-green-400/60 text-xs">День {event.day}: </span>
                  {event.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="bg-black/20 rounded-xl p-4 border border-green-500/20 mb-4">
          <h3 className="text-lg font-bold text-green-300 mb-3">🏆 Прогресс к победе</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>💰 Капитал</span>
                <span>{formatMoney(state.money)} / {formatMoney(WIN_CAPITAL)}</span>
              </div>
              <div className="h-3 bg-green-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, (state.money / WIN_CAPITAL) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>⭐ Репутация</span>
                <span>{state.reputation} / {WIN_REPUTATION}</span>
              </div>
              <div className="h-3 bg-green-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-500"
                  style={{ width: `${(state.reputation / WIN_REPUTATION) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== Sub-components =====

function LandingScreen({ onStart, onContinue, showProfile, playerNameInput, setPlayerNameInput, onStartGame, hasSave, showHowToPlay, setShowHowToPlay }: {
  onStart: () => void;
  onContinue: () => void;
  showProfile: boolean;
  playerNameInput: string;
  setPlayerNameInput: (v: string) => void;
  onStartGame: () => void;
  hasSave: boolean;
  showHowToPlay: boolean;
  setShowHowToPlay: (v: boolean) => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-4xl font-bold text-green-300 mb-2">ЭКО-МАГНАТ</h1>
          <p className="text-green-400 text-lg">Биогазовые технологии и органическое земледелие</p>
          <p className="text-green-500/70 text-sm mt-2">ООО «Токчин-Эко» — от фермера до руководителя кластера</p>
        </div>

        {!showProfile && !showHowToPlay && (
          <div className="bg-black/30 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👤</div>
              <h2 className="text-xl font-bold text-green-300 mb-2">📜 Легенда:</h2>
              <p className="text-green-200/80 leading-relaxed">
                Вы — молодой предприниматель, получивший в наследство заброшенную ферму.
                Пройдите путь от простого фермера до руководителя агропромышленного кластера «Токчин»!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⏰</div>
                <p className="text-sm text-green-300 font-semibold">Реальное время</p>
                <p className="text-xs text-green-400/70">1 игровой день = 1 реальная неделя. Игра учитывает сезоны года!</p>
              </div>
              <div className="bg-green-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm text-green-300 font-semibold">Цель по капиталу</p>
                <p className="text-xs text-green-400/70">{formatMoney(WIN_CAPITAL)}</p>
              </div>
            </div>

            <div className="bg-green-900/50 rounded-xl p-4 text-center mb-6">
              <div className="text-2xl mb-2">🌍</div>
              <p className="text-sm text-green-300 font-semibold">Цель по репутации</p>
              <p className="text-xs text-green-400/70">95 / 100</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onStart}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-[1.02]"
              >
                👤 Создать профиль и начать
              </button>
              {hasSave && (
                <button
                  onClick={onContinue}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-[1.02]"
                >
                  💾 Продолжить игру
                </button>
              )}
              <button
                onClick={() => setShowHowToPlay(true)}
                className="w-full py-3 bg-green-800/50 hover:bg-green-700/50 border border-green-500/30 rounded-xl font-medium transition"
              >
                📖 Как играть
              </button>
            </div>
          </div>
        )}

        {showProfile && (
          <div className="bg-black/30 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-green-300 mb-4 text-center">👤 Личный кабинет</h2>
            <input
              type="text"
              value={playerNameInput}
              onChange={e => setPlayerNameInput(e.target.value)}
              placeholder="Введите ваше имя..."
              className="w-full p-3 bg-green-900/50 border border-green-500/30 rounded-xl text-white placeholder-green-500/50 mb-4 focus:outline-none focus:border-green-400"
            />
            <button
              onClick={onStartGame}
              disabled={!playerNameInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg transition"
            >
              🚀 Начать игру
            </button>
          </div>
        )}

        {showHowToPlay && (
          <div className="bg-black/30 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-green-300 mb-4 text-center">📖 Как играть</h2>
            <div className="space-y-3 text-sm text-green-200/80">
              <p>🏭 <strong>Производство:</strong> Закупайте органику, запускайте биогазовый реактор, засевайте поля и собирайте урожай.</p>
              <p>🛒 <strong>Рынок:</strong> Продавайте биогаз, дигестат и органическую продукцию на внутреннем рынке.</p>
              <p>📜 <strong>Контракты:</strong> Заключайте контракты на утилизацию отходов — предприятия платят за это!</p>
              <p>🌍 <strong>Экспорт:</strong> Выходите на международный рынок (нужен ISO сертификат и репутация 50+).</p>
              <p>🔧 <strong>Модернизация:</strong> Улучшайте реактор и расширяйте ферму.</p>
              <p>👷 <strong>Персонал:</strong> Нанимайте специалистов для повышения эффективности.</p>
              <p>🏆 <strong>Победа:</strong> Накопите {formatMoney(WIN_CAPITAL)} капитала и достигните репутации {WIN_REPUTATION}!</p>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full mt-4 py-2 bg-green-700 hover:bg-green-600 rounded-xl font-medium transition"
            >
              ← Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WinScreen({ state, onReset }: { state: any; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center bg-black/30 rounded-2xl p-8 border border-yellow-500/30 backdrop-blur-sm">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">ПОБЕДА!</h1>
        <p className="text-green-200 mb-4">
          Поздравляем, {state.playerName}! Вы стали настоящим Эко-Магнатом!
        </p>
        <div className="bg-green-900/50 rounded-xl p-4 mb-6">
          <p className="text-green-300">💰 Капитал: {formatMoney(state.money)}</p>
          <p className="text-green-300">⭐ Репутация: {state.reputation}/100</p>
          <p className="text-green-300">📅 Дней в игре: {state.day}</p>
          <p className="text-green-300">🏡 Ферма: {state.farmSize} га</p>
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 rounded-xl font-bold text-lg shadow-lg transition"
        >
          🔄 Начать заново
        </button>
      </div>
    </div>
  );
}

function ResourceCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-green-900/50 rounded-lg p-3 text-center border border-green-700/30">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-xs text-green-400/70">{label}</p>
      <p className="text-sm font-bold text-green-200">{value}</p>
    </div>
  );
}

function ProductionTab({ state, onBuyOrganic, onActivateReactor, onPlantField, onHarvestField }: {
  state: any;
  onBuyOrganic: (amount: number) => void;
  onActivateReactor: () => void;
  onPlantField: (fieldId: string, cropIndex: number) => void;
  onHarvestField: (fieldId: string) => void;
}) {
  const [buyAmount, setBuyAmount] = useState(5);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">🏭 Производство</h3>

      {/* Buy Organic */}
      <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
        <h4 className="font-semibold text-green-200 mb-2">📦 Закупить органику</h4>
        <p className="text-xs text-green-400/70 mb-3">Навоз, отходы, силос — 3 000 ₽/т</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="50"
            value={buyAmount}
            onChange={e => setBuyAmount(Number(e.target.value))}
            className="flex-1 accent-green-500"
          />
          <span className="text-green-300 font-bold w-16 text-center">{buyAmount} т</span>
          <button
            onClick={() => onBuyOrganic(buyAmount)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
          >
            Купить ({formatMoney(buyAmount * 3000)})
          </button>
        </div>
      </div>

      {/* Reactor */}
      <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
        <h4 className="font-semibold text-green-200 mb-2">🏭 Запустить реактор (ур. {state.reactorLevel})</h4>
        <p className="text-xs text-green-400/70 mb-3">
          Переработка органики → Биогаз + Дигестат. Нужно минимум 2 т органики.
        </p>
        <button
          onClick={onActivateReactor}
          disabled={state.resources.organic < 2}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
        >
          🔥 Запустить переработку
        </button>
      </div>

      {/* Fields */}
      <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
        <h4 className="font-semibold text-green-200 mb-2">🌱 Засеять поля</h4>
        <p className="text-xs text-green-400/70 mb-3">
          Текущий сезон: {state.season}. Выберите культуру для каждого свободного поля.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.fields.map((field: any) => (
            <div key={field.id} className="bg-green-800/30 rounded-lg p-3">
              <p className="text-sm text-green-300 mb-2">Поле #{field.id}</p>
              {!field.planted ? (
                <div className="flex flex-wrap gap-1">
                  {CROPS.map((crop, idx) => {
                    const canPlant = crop.season.includes(state.season);
                    return (
                      <button
                        key={idx}
                        onClick={() => onPlantField(field.id, idx)}
                        disabled={!canPlant}
                        className={`px-2 py-1 rounded text-xs transition ${
                          canPlant
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-gray-700 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {crop.name} ({crop.growthDays} нед.)
                      </button>
                    );
                  })}
                </div>
              ) : field.ready ? (
                <button
                  onClick={() => onHarvestField(field.id)}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-medium transition"
                >
                  🌾 Собрать урожай
                </button>
              ) : (
                <p className="text-xs text-green-400/70">🌱 Растёт... {field.growthDays}/{field.maxGrowthDays} нед.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketTab({ state, onSellBiogas, onSellDigestate, onSellHarvest }: {
  state: any;
  onSellBiogas: () => void;
  onSellDigestate: () => void;
  onSellHarvest: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">🛒 Рынок</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🔥</div>
          <h4 className="font-semibold text-green-200">Биогаз</h4>
          <p className="text-sm text-green-400/70 mb-1">Цена: 8 ₽/м³</p>
          <p className="text-sm text-green-300 mb-3">В наличии: {state.resources.biogas.toFixed(0)} м³</p>
          <p className="text-xs text-yellow-300 mb-3">
            Выручка: {formatMoney(state.resources.biogas * 8)}
          </p>
          <button
            onClick={onSellBiogas}
            disabled={state.resources.biogas < 1}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Продать
          </button>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🌿</div>
          <h4 className="font-semibold text-green-200">Дигестат</h4>
          <p className="text-sm text-green-400/70 mb-1">Цена: 6 000 ₽/т</p>
          <p className="text-sm text-green-300 mb-3">В наличии: {state.resources.digestate.toFixed(1)} т</p>
          <p className="text-xs text-yellow-300 mb-3">
            Выручка: {formatMoney(state.resources.digestate * 6000)}
          </p>
          <button
            onClick={onSellDigestate}
            disabled={state.resources.digestate < 0.1}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Продать
          </button>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🌾</div>
          <h4 className="font-semibold text-green-200">Органическая продукция</h4>
          <p className="text-sm text-green-400/70 mb-1">Цена: 45 000 ₽/т</p>
          <p className="text-sm text-green-300 mb-3">В наличии: {state.resources.harvest.toFixed(1)} т</p>
          <p className="text-xs text-yellow-300 mb-3">
            Выручка: {formatMoney(state.resources.harvest * 45000)}
          </p>
          <button
            onClick={onSellHarvest}
            disabled={state.resources.harvest < 0.1}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Продать
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractsTab({ state, availableContracts, onGenerate, onAccept, onSetAvailable }: {
  state: any;
  availableContracts: Contract[];
  onGenerate: () => Contract[];
  onAccept: (c: Contract) => void;
  onSetAvailable: (c: Contract[]) => void;
}) {
  const handleGenerate = () => {
    const contracts = onGenerate();
    onSetAvailable(contracts);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">📜 Контракты на утилизацию</h3>
      <p className="text-sm text-green-400/70">
        Предприятия платят <strong className="text-green-300">10 000 ₽/т</strong> за утилизацию отходов.
      </p>

      {/* Active Contracts */}
      <div>
        <h4 className="font-semibold text-green-200 mb-2">⏳ Активные контракты</h4>
        {state.contracts.filter((c: Contract) => c.active).length === 0 ? (
          <p className="text-sm text-green-400/50 italic">Нет активных контрактов</p>
        ) : (
          <div className="space-y-2">
            {state.contracts.filter((c: Contract) => c.active).map((c: Contract) => (
              <div key={c.id} className="bg-green-800/30 rounded-lg p-3 border border-green-600/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-200">{c.name}</p>
                    <p className="text-xs text-green-400/70">{c.client} — {c.amount} т/нед.</p>
                  </div>
                  <span className="text-xs text-yellow-300">Осталось: {c.weeksLeft} нед.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Contracts */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-green-200">📋 Доступные контракты</h4>
          <button
            onClick={handleGenerate}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition"
          >
            🔄 Обновить
          </button>
        </div>
        {availableContracts.length === 0 ? (
          <p className="text-sm text-green-400/50 italic">Нажмите "Обновить" для просмотра доступных контрактов</p>
        ) : (
          <div className="space-y-2">
            {availableContracts.map(c => (
              <div key={c.id} className="bg-green-900/30 rounded-lg p-3 border border-green-700/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-200">{c.name}</p>
                    <p className="text-xs text-green-400/70">{c.client} — {c.amount} т/нед. × {c.weeksLeft} нед.</p>
                    <p className="text-xs text-yellow-300">Доход: {formatMoney(c.amount * c.price * c.weeksLeft)}</p>
                  </div>
                  <button
                    onClick={() => onAccept(c)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium transition"
                  >
                    ✅ Принять
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExportTab({ state, onExportEU, onExportChina, onExportUAE, onGetISO, onGetLicense }: {
  state: any;
  onExportEU: () => void;
  onExportChina: () => void;
  onExportUAE: () => void;
  onGetISO: () => void;
  onGetLicense: () => void;
}) {
  const canExport = state.reputation >= 50 && state.hasISOCert;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">🌍 Международный рынок</h3>
      <p className="text-sm text-green-400/70">
        Цены в 2-3 раза выше. Нужен сертификат ISO и репутация 50+.
      </p>

      {/* Certificates */}
      <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
        <h4 className="font-semibold text-green-200 mb-3">📜 Сертификаты и лицензии</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-green-800/30 rounded-lg p-3">
            <div>
              <p className="text-sm text-green-200">ISO Organic</p>
              <p className="text-xs text-green-400/70">800 000 ₽ | Реп. 40+</p>
            </div>
            {state.hasISOCert ? (
              <span className="text-green-400 text-xs">✅ Получен</span>
            ) : (
              <button
                onClick={onGetISO}
                disabled={state.money < 800000 || state.reputation < 40}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs transition"
              >
                Получить
              </button>
            )}
          </div>
          <div className="flex items-center justify-between bg-green-800/30 rounded-lg p-3">
            <div>
              <p className="text-sm text-green-200">Экспортная лицензия</p>
              <p className="text-xs text-green-400/70">500 000 ₽</p>
            </div>
            {state.hasExportLicense ? (
              <span className="text-green-400 text-xs">✅ Получена</span>
            ) : (
              <button
                onClick={onGetLicense}
                disabled={state.money < 500000}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs transition"
              >
                Получить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export Markets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🇪🇺</div>
          <h4 className="font-semibold text-green-200">Европейский Союз</h4>
          <p className="text-xs text-green-400/70 mb-1">🌾 120 000 ₽/т | 🔥 25 ₽/м³</p>
          <p className="text-xs text-blue-300 mb-3">Репутация +5</p>
          <button
            onClick={onExportEU}
            disabled={!canExport || state.resources.harvest < 1}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Экспорт
          </button>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🇨🇳</div>
          <h4 className="font-semibold text-green-200">Китай</h4>
          <p className="text-xs text-green-400/70 mb-1">🌾 95 000 ₽/т (оптом от 10 т)</p>
          <p className="text-xs text-blue-300 mb-3">Репутация +3</p>
          <button
            onClick={onExportChina}
            disabled={!canExport || state.resources.harvest < 10}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Экспорт
          </button>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30 text-center">
          <div className="text-3xl mb-2">🇦🇪</div>
          <h4 className="font-semibold text-green-200">ОАЭ</h4>
          <p className="text-xs text-green-400/70 mb-1">🔥 Лицензия: 500 000 ₽</p>
          <p className="text-xs text-blue-300 mb-3">Репутация +10</p>
          <button
            onClick={onExportUAE}
            disabled={!state.hasExportLicense || state.resources.biogas < 100}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            Экспорт
          </button>
        </div>
      </div>
    </div>
  );
}

function UpgradesTab({ state, onUpgradeReactor, onExpandFarm }: {
  state: any;
  onUpgradeReactor: () => void;
  onExpandFarm: () => void;
}) {
  const reactorCost = state.reactorLevel * 500000;
  const farmCost = state.farmSize * 300000;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">🔧 Модернизация</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
          <div className="text-3xl mb-2 text-center">🏭</div>
          <h4 className="font-semibold text-green-200 text-center mb-2">Биогазовый реактор</h4>
          <p className="text-sm text-green-400/70 text-center mb-1">Текущий уровень: {state.reactorLevel}</p>
          <p className="text-xs text-green-400/60 text-center mb-3">
            +{50 + state.reactorLevel * 20} м³ газа / +{(0.8 + state.reactorLevel * 0.3).toFixed(1)} т дигестата за цикл
          </p>
          <button
            onClick={onUpgradeReactor}
            disabled={state.money < reactorCost}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            ⬆️ Улучшить ({formatMoney(reactorCost)})
          </button>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
          <div className="text-3xl mb-2 text-center">🏡</div>
          <h4 className="font-semibold text-green-200 text-center mb-2">Расширение фермы</h4>
          <p className="text-sm text-green-400/70 text-center mb-1">Текущая площадь: {state.farmSize} га</p>
          <p className="text-xs text-green-400/60 text-center mb-3">
            +1 га, +1 поле для посева
          </p>
          <button
            onClick={onExpandFarm}
            disabled={state.money < farmCost}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            ⬆️ Расширить ({formatMoney(farmCost)})
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonnelTab({ state, onHireWorker, onFireWorker, onHireAgronomist, onHireEngineer, onHireExportManager }: {
  state: any;
  onHireWorker: () => void;
  onFireWorker: () => void;
  onHireAgronomist: () => void;
  onHireEngineer: () => void;
  onHireExportManager: () => void;
}) {
  const monthlySalary = state.personnel.workers * 60000 +
    (state.personnel.agronomist ? 150000 : 0) +
    (state.personnel.engineer ? 180000 : 0) +
    (state.personnel.exportManager ? 200000 : 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-green-300">👷 Персонал</h3>

      <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-200">{state.personnel.workers}</p>
            <p className="text-xs text-green-400/70">Рабочих</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-300">{formatMoney(monthlySalary)}</p>
            <p className="text-xs text-green-400/70">Зарплата/мес</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-200">{state.personnel.morale}%</p>
            <p className="text-xs text-green-400/70">Мораль</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-300">
              {[state.personnel.agronomist, state.personnel.engineer, state.personnel.exportManager].filter(Boolean).length}/3
            </p>
            <p className="text-xs text-green-400/70">Специалистов</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={onHireWorker}
            disabled={state.money < 60000}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            ➕ Нанять рабочего
          </button>
          <button
            onClick={onFireWorker}
            disabled={state.personnel.workers <= 1}
            className="flex-1 px-3 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
          >
            ➖ Уволить
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-green-200">🎓 Специалисты</h4>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-200">🌾 Агроном</p>
              <p className="text-xs text-green-400/70">150 000 ₽/мес, +30% урожай</p>
            </div>
            {state.personnel.agronomist ? (
              <span className="text-green-400 text-sm">✅ Работает</span>
            ) : (
              <button
                onClick={onHireAgronomist}
                disabled={state.money < 150000}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs transition"
              >
                Нанять
              </button>
            )}
          </div>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-200">⚙️ Инженер</p>
              <p className="text-xs text-green-400/70">180 000 ₽/мес, +25% газ</p>
            </div>
            {state.personnel.engineer ? (
              <span className="text-green-400 text-sm">✅ Работает</span>
            ) : (
              <button
                onClick={onHireEngineer}
                disabled={state.money < 180000}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs transition"
              >
                Нанять
              </button>
            )}
          </div>
        </div>

        <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-200">🌍 Менеджер по экспорту</p>
              <p className="text-xs text-green-400/70">200 000 ₽/мес, +15% цены экспорта</p>
            </div>
            {state.personnel.exportManager ? (
              <span className="text-green-400 text-sm">✅ Работает</span>
            ) : (
              <button
                onClick={onHireExportManager}
                disabled={state.money < 200000}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs transition"
              >
                Нанять
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} млн ₽`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)} тыс ₽`;
  }
  return `${Math.round(amount)} ₽`;
}
