export default function TurnOrder({ characters, currentTurn }) {
  return (
    <div className="fixed left-4 top-48 w-64 bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border)] shadow-lg">
      <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Порядок Ходов</h3>
      <div className="space-y-2">
        {characters.map((character, index) => (
          <div 
            key={character.id}
            className={`p-2 rounded ${
              index === currentTurn ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-hover)]'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">{character.icon}</span>
              <div>
                <div className="text-[var(--color-text-primary)]">{character.name}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Здоровье: {character.stats.hp}/{character.stats.maxHp} | Класс Защиты: {character.stats.ac}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}