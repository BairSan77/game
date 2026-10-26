import { useState, useCallback } from 'react';
import { GameState, Contract, GameEvent, Field } from '../types';
import { INITIAL_STATE, LEVELS, RANDOM_EVENTS, CROPS, WIN_CAPITAL, WIN_REPUTATION } from '../gameData';

const STORAGE_KEY = 'eco_magnate_save';

function getSeason(day: number): string {
  const seasons = ['Весна', 'Лето', 'Осень', 'Зима'];
  const dayOfYear = (day - 1) % 52;
  if (dayOfYear < 13) return seasons[0];
  if (dayOfYear < 26) return seasons[1];
  if (dayOfYear < 39) return seasons[2];
  return seasons[3];
}

function getLevel(capital: number): { level: number; name: string } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (capital >= LEVELS[i].capitalNeeded) {
      return { level: i, name: LEVELS[i].name };
    }
  }
  return { level: 0, name: LEVELS[0].name };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { ...INITIAL_STATE };
      }
    }
    return { ...INITIAL_STATE };
  });

  const saveGame = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startGame = useCallback((name: string) => {
    const newState: GameState = {
      ...INITIAL_STATE,
      playerName: name,
      gameStarted: true,
      fields: [
        { id: '1', crop: '', planted: false, growthDays: 0, maxGrowthDays: 0, ready: false },
        { id: '2', crop: '', planted: false, growthDays: 0, maxGrowthDays: 0, ready: false },
      ],
    };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const buyOrganic = useCallback((amount: number) => {
    const cost = amount * 3000;
    if (state.money < cost) return;
    setState(prev => ({
      ...prev,
      money: prev.money - cost,
      resources: { ...prev.resources, organic: prev.resources.organic + amount },
    }));
  }, [state.money]);

  const activateReactor = useCallback(() => {
    if (state.resources.organic < 2) return;
    const gasProduction = 50 + (state.reactorLevel * 20) + (state.personnel.engineer ? 12 : 0);
    const digestateProduction = 0.8 + (state.reactorLevel * 0.3);
    const organicUsed = 2;

    setState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        organic: prev.resources.organic - organicUsed,
        biogas: prev.resources.biogas + gasProduction,
        digestate: prev.resources.digestate + digestateProduction,
      },
      reactorActive: true,
    }));
  }, [state.resources.organic, state.reactorLevel, state.personnel.engineer]);

  const plantField = useCallback((fieldId: string, cropIndex: number) => {
    const crop = CROPS[cropIndex];
    const seasonMatch = crop.season.includes(state.season);
    if (!seasonMatch) return;

    setState(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId
          ? { ...f, crop: crop.name, planted: true, growthDays: 0, maxGrowthDays: crop.growthDays, ready: false }
          : f
      ),
    }));
  }, [state.season]);

  const harvestField = useCallback((fieldId: string) => {
    const field = state.fields.find(f => f.id === fieldId);
    if (!field || !field.ready) return;

    const crop = CROPS.find(c => c.name === field.crop);
    if (!crop) return;

    let yieldAmount = crop.yield;
    if (state.personnel.agronomist) yieldAmount *= 1.3;
    if (state.resources.digestate > 0) yieldAmount *= 1.15;

    setState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        harvest: prev.resources.harvest + yieldAmount,
        digestate: Math.max(0, prev.resources.digestate - 0.3),
      },
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, planted: false, ready: false, crop: '', growthDays: 0 } : f
      ),
    }));
  }, [state.fields, state.personnel.agronomist, state.resources.digestate]);

  const sellBiogas = useCallback(() => {
    const price = 8;
    const revenue = state.resources.biogas * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      resources: { ...prev.resources, biogas: 0 },
    }));
  }, [state.resources.biogas]);

  const sellDigestate = useCallback(() => {
    const price = 6000;
    const revenue = state.resources.digestate * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      resources: { ...prev.resources, digestate: 0 },
    }));
  }, [state.resources.digestate]);

  const sellHarvest = useCallback(() => {
    const price = 45000;
    const revenue = state.resources.harvest * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      resources: { ...prev.resources, harvest: 0 },
    }));
  }, [state.resources.harvest]);

  const exportToEU = useCallback(() => {
    if (state.reputation < 50 || !state.hasISOCert) return;
    if (state.resources.harvest < 1) return;
    const price = 120000;
    const revenue = state.resources.harvest * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      reputation: Math.min(100, prev.reputation + 5),
      resources: { ...prev.resources, harvest: 0 },
    }));
  }, [state.reputation, state.hasISOCert, state.resources.harvest]);

  const exportToChina = useCallback(() => {
    if (state.reputation < 50 || !state.hasISOCert) return;
    if (state.resources.harvest < 10) return;
    const price = 95000;
    const revenue = state.resources.harvest * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      reputation: Math.min(100, prev.reputation + 3),
      resources: { ...prev.resources, harvest: 0 },
    }));
  }, [state.reputation, state.hasISOCert, state.resources.harvest]);

  const exportToUAE = useCallback(() => {
    if (state.reputation < 50 || !state.hasExportLicense) return;
    if (state.resources.biogas < 100) return;
    const price = 25;
    const revenue = state.resources.biogas * price;
    setState(prev => ({
      ...prev,
      money: prev.money + revenue,
      reputation: Math.min(100, prev.reputation + 10),
      resources: { ...prev.resources, biogas: 0 },
    }));
  }, [state.reputation, state.hasExportLicense, state.resources.biogas]);

  const getISOCert = useCallback(() => {
    if (state.money < 800000 || state.reputation < 40) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 800000,
      hasISOCert: true,
      reputation: Math.min(100, prev.reputation + 5),
    }));
  }, [state.money, state.reputation]);

  const getExportLicense = useCallback(() => {
    if (state.money < 500000) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 500000,
      hasExportLicense: true,
    }));
  }, [state.money]);

  const hireWorker = useCallback(() => {
    if (state.money < 60000) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 60000,
      personnel: { ...prev.personnel, workers: prev.personnel.workers + 1 },
    }));
  }, [state.money]);

  const fireWorker = useCallback(() => {
    if (state.personnel.workers <= 1) return;
    setState(prev => ({
      ...prev,
      personnel: { ...prev.personnel, workers: prev.personnel.workers - 1 },
    }));
  }, [state.personnel.workers]);

  const hireAgronomist = useCallback(() => {
    if (state.money < 150000 || state.personnel.agronomist) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 150000,
      personnel: { ...prev.personnel, agronomist: true },
    }));
  }, [state.money, state.personnel.agronomist]);

  const hireEngineer = useCallback(() => {
    if (state.money < 180000 || state.personnel.engineer) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 180000,
      personnel: { ...prev.personnel, engineer: true },
    }));
  }, [state.money, state.personnel.engineer]);

  const hireExportManager = useCallback(() => {
    if (state.money < 200000 || state.personnel.exportManager) return;
    setState(prev => ({
      ...prev,
      money: prev.money - 200000,
      personnel: { ...prev.personnel, exportManager: true },
    }));
  }, [state.money, state.personnel.exportManager]);

  const upgradeReactor = useCallback(() => {
    const cost = state.reactorLevel * 500000;
    if (state.money < cost) return;
    setState(prev => ({
      ...prev,
      money: prev.money - cost,
      reactorLevel: prev.reactorLevel + 1,
    }));
  }, [state.money, state.reactorLevel]);

  const expandFarm = useCallback(() => {
    const cost = state.farmSize * 300000;
    if (state.money < cost) return;
    setState(prev => ({
      ...prev,
      money: prev.money - cost,
      farmSize: prev.farmSize + 1,
      fields: [...prev.fields, {
        id: String(prev.fields.length + 1),
        crop: '',
        planted: false,
        growthDays: 0,
        maxGrowthDays: 0,
        ready: false,
      }],
    }));
  }, [state.money, state.farmSize]);

  const acceptContract = useCallback((contract: Contract) => {
    setState(prev => ({
      ...prev,
      contracts: [...prev.contracts, { ...contract, active: true }],
    }));
  }, []);

  const generateAvailableContracts = useCallback((): Contract[] => {
    const templates = [
      { name: 'Утилизация навоза', client: 'КРС "Заря"', amount: 5, price: 10000, weeks: 8 },
      { name: 'Переработка отходов', client: 'Мясокомбинат "Южный"', amount: 8, price: 10000, weeks: 12 },
      { name: 'Утилизация силоса', client: 'Агрохолдинг "Восток"', amount: 12, price: 10000, weeks: 6 },
      { name: 'Переработка помёта', client: 'Птицефабрика "Рассвет"', amount: 3, price: 10000, weeks: 10 },
    ];
    const count = Math.min(3, templates.length);
    const shuffled = templates.sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled.map((t, i) => ({
      id: `contract_${Date.now()}_${i}`,
      name: t.name,
      client: t.client,
      amount: t.amount,
      price: t.price,
      weeksLeft: t.weeks,
      active: false,
    }));
  }, []);

  const nextDay = useCallback(() => {
    setState(prev => {
      const newDay = prev.day + 1;
      const newWeek = Math.ceil(newDay / 7);
      const newYear = 2026 + Math.floor((newDay - 1) / 52);
      const season = getSeason(newDay);

      // Grow fields
      const newFields = prev.fields.map(f => {
        if (f.planted && !f.ready) {
          const newGrowth = f.growthDays + 1;
          return {
            ...f,
            growthDays: newGrowth,
            ready: newGrowth >= f.maxGrowthDays,
          };
        }
        return f;
      });

      // Pay salaries
      let salaryCost = 0;
      salaryCost += prev.personnel.workers * 60000;
      if (prev.personnel.agronomist) salaryCost += 150000;
      if (prev.personnel.engineer) salaryCost += 180000;
      if (prev.personnel.exportManager) salaryCost += 200000;
      const monthlySalary = salaryCost;
      // Deduct salary every 4 weeks (monthly)
      let moneyAfterSalary = prev.money;
      if (newWeek % 4 === 0 && prev.week % 4 !== 0) {
        moneyAfterSalary -= monthlySalary;
      }

      // Process contracts
      let contractRevenue = 0;
      let organicFromContracts = 0;
      const newContracts = prev.contracts.map(c => {
        if (c.active) {
          contractRevenue += c.amount * c.price;
          organicFromContracts += c.amount;
          return { ...c, weeksLeft: c.weeksLeft - 1, active: c.weeksLeft - 1 > 0 };
        }
        return c;
      }).filter(c => c.active || c.weeksLeft > 0);

      // Random event (20% chance)
      let newEvents = [...prev.events];
      let eventMoneyChange = 0;
      let eventRepChange = 0;
      let eventHarvestChange = 0;
      let eventGasChange = 0;

      if (Math.random() < 0.2) {
        const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        const newEvent: GameEvent = {
          id: `event_${newDay}`,
          day: newDay,
          text: event.text,
          type: event.type,
        };
        newEvents = [newEvent, ...newEvents].slice(0, 20);

        switch (event.effect) {
          case 'money_boost': eventMoneyChange = 500000; break;
          case 'money_loss': eventMoneyChange = -150000; break;
          case 'rep_boost': eventRepChange = 3; break;
          case 'rep_small': eventRepChange = 2; break;
          case 'rep_big': eventRepChange = 5; break;
          case 'harvest_loss': eventHarvestChange = -prev.resources.harvest * 0.3; break;
          case 'gas_loss': eventGasChange = -prev.resources.biogas * 0.2; break;
          case 'reactor_damage': eventMoneyChange = -200000; break;
        }
      }

      const newMoney = moneyAfterSalary + contractRevenue + eventMoneyChange;
      const newRep = Math.min(100, Math.max(0, prev.reputation + eventRepChange));
      const newResources = {
        organic: Math.max(0, prev.resources.organic + organicFromContracts),
        biogas: Math.max(0, prev.resources.biogas + eventGasChange),
        digestate: prev.resources.digestate,
        harvest: Math.max(0, prev.resources.harvest + eventHarvestChange),
      };

      const { level, name: levelName } = getLevel(newMoney);

      // Check win condition
      const gameWon = newMoney >= WIN_CAPITAL && newRep >= WIN_REPUTATION;

      return {
        ...prev,
        day: newDay,
        week: newWeek,
        year: newYear,
        season,
        money: newMoney,
        reputation: newRep,
        resources: newResources,
        fields: newFields,
        contracts: newContracts,
        events: newEvents,
        level,
        levelName,
        gameWon,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...INITIAL_STATE });
  }, []);

  return {
    state,
    saveGame,
    startGame,
    buyOrganic,
    activateReactor,
    plantField,
    harvestField,
    sellBiogas,
    sellDigestate,
    sellHarvest,
    exportToEU,
    exportToChina,
    exportToUAE,
    getISOCert,
    getExportLicense,
    hireWorker,
    fireWorker,
    hireAgronomist,
    hireEngineer,
    hireExportManager,
    upgradeReactor,
    expandFarm,
    acceptContract,
    generateAvailableContracts,
    nextDay,
    resetGame,
  };
}
