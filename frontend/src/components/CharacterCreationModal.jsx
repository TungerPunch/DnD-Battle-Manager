import { useState, useEffect } from 'react';

const AVAILABLE_ICONS = ['🧙‍♂️', '🦹‍♂️', '🧝‍♂️', '🧝‍♀️', '🧚‍♂️', '🧚‍♀️', '🦸‍♂️', '🦸‍♀️', '🧟‍♂️', '🧟‍♀️'];

const WEAPONS = [
  { name: 'Меч', icon: '⚔️', damage: '1d8' },
  { name: 'Лук', icon: '🏹', damage: '1d6' },
  { name: 'Посох', icon: '🪄', damage: '1d6' },
  { name: 'Топор', icon: '🪓', damage: '1d10' },
  { name: 'Кинжал', icon: '🗡️', damage: '1d4' }
];

const SPELLS = [
  { name: 'Огненный Шар', icon: '🔥', damage: '8d6', type: 'огонь' },
  { name: 'Ледяная Стрела', icon: '❄️', damage: '6d6', type: 'холод' },
  { name: 'Молния', icon: '⚡', damage: '7d6', type: 'электричество' },
  { name: 'Лечение', icon: '💚', healing: '2d8+4', type: 'исцеление' },
  { name: 'Щит', icon: '🛡️', effect: '+5 КЗ', type: 'защита' }
];

export default function CharacterCreationModal({ isOpen, onClose, onCreateCharacter }) {
  const [character, setCharacter] = useState({
    name: '',
    icon: AVAILABLE_ICONS[0],
    description: '',
    stats: {
      strength: 10,
      agility: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hp: 20,
      maxHp: 20,
      ac: 10,
    },
    weapon: WEAPONS[0],
    spells: []
  });

  const handleStatChange = (stat, value) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(1, Math.min(20, parseInt(value) || 0))
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCharacter(character);
  };

  useEffect(() => {
    const maxHp = 10 + character.stats.constitution;
    const ac = 10 + Math.floor((character.stats.agility - 10) / 2);

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        maxHp,
        hp: maxHp,
        ac
      }
    }));
  }, [character.stats.constitution, character.stats.agility]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Создание Персонажа</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Имя Персонажа
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Иконка Персонажа
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCharacter(prev => ({ ...prev, icon }))}
                    className={`text-2xl p-2 rounded-lg ${
                      character.icon === icon 
                        ? 'bg-[var(--color-accent)] text-white' 
                        : 'bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Описание Персонажа
              </label>
              <textarea
                value={character.description}
                onChange={(e) => setCharacter(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg h-24 resize-none"
                placeholder="Опишите внешность и характер вашего персонажа..."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Характеристики</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(character.stats)
                .filter(([stat]) => !['hp', 'maxHp', 'ac'].includes(stat))
                .map(([stat, value]) => (
                  <div key={stat}>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1 capitalize">
                      {getStatLabel(stat)}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleStatChange(stat, e.target.value)}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">Здоровье</div>
                <div className="text-lg font-bold text-[var(--color-text-primary)]">
                  {character.stats.hp}/{character.stats.maxHp}
                </div>
              </div>
              <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">Класс Защиты</div>
                <div className="text-lg font-bold text-[var(--color-text-primary)]">
                  {character.stats.ac}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Выберите Оружие</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {WEAPONS.map((weapon) => (
                <button
                  key={weapon.name}
                  type="button"
                  onClick={() => setCharacter(prev => ({ ...prev, weapon }))}
                  className={`p-3 rounded-lg border ${
                    character.weapon === weapon
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div className="text-2xl mb-1">{weapon.icon}</div>
                  <div className="text-sm font-medium">{weapon.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    Damage: {weapon.damage}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
              Выберите Заклинания (макс. 3)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPELLS.map((spell) => (
                <button
                  key={spell.name}
                  type="button"
                  onClick={() => {
                    setCharacter(prev => ({
                      ...prev,
                      spells: prev.spells.includes(spell)
                        ? prev.spells.filter(s => s !== spell)
                        : prev.spells.length < 3
                        ? [...prev.spells, spell]
                        : prev.spells
                    }))
                  }}
                  className={`p-3 rounded-lg border ${
                    character.spells.includes(spell)
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                  disabled={!character.spells.includes(spell) && character.spells.length >= 3}
                >
                  <div className="text-2xl mb-1">{spell.icon}</div>
                  <div className="text-sm font-medium">{spell.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {spell.damage || spell.healing || spell.effect}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStatLabel(stat) {
  const labels = {
    strength: 'Сила',
    agility: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма'
  };
  return labels[stat] || stat;
} 