import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CharacterCreationModal from '../components/CharacterCreationModal';
import TurnOrder from '../components/TurnOrder';
import JsonViewerModal from '../components/JsonViewerModal';

// Define tile types with their properties
const TILE_TYPES = {
  WOOD_FLOOR: {
    className: 'bg-[var(--color-wood)] border-[var(--color-wood-border)]',
    label: 'Деревянный Пол',
    blocked: false,
    icon: null
  },
  WATER: {
    className: 'bg-[var(--color-water)] border-[var(--color-water-border)]',
    label: 'Вода',
    blocked: true,
    icon: '🌊'
  },
  WALL: {
    className: 'bg-[var(--color-wall)] border-[var(--color-wall-border)]',
    label: 'Стена',
    blocked: true,
    icon: '🧱'
  },
  CRATE: {
    className: 'bg-[var(--color-crate)] border-[var(--color-crate-border)]',
    label: 'Ящик',
    blocked: true,
    icon: '📦'
  }
};

// Map tile types to Russian
const TILE_TYPE_TRANSLATIONS = {
  WALL: 'СТЕНА',
  WATER: 'ВОДА',
  CRATE: 'ЯЩИК'
};

// Update MAP_DESCRIPTION to be more concise
const MAP_DESCRIPTION = {
  name: "Торговый Корабль",
  desc: "Торговое судно, захваченно пиратами. Особенности: грузовые отсеки, каюты экипажа, каюта капитана.",
};

// Update MOCK_SHIP_MAP to include initial state
const MOCK_SHIP_MAP = {
  width: 15,
  height: 25,
  tiles: [],
  entities: [] // Will be populated with characters
};

export default function HomePage() {
  const [map, setMap] = useState(null);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCharacterCreation, setShowCharacterCreation] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [placingCharacter, setPlacingCharacter] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  // Update getCurrentGameState to use a more concise tile representation
  const getCurrentGameState = () => {
    // Group tiles by type and create arrays of coordinates
    const tiles = map.tiles.reduce((acc, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type !== 'WOOD_FLOOR') {  // Skip wood floor tiles
          const russianType = TILE_TYPE_TRANSLATIONS[tile.type];
          if (!acc[russianType]) {
            acc[russianType] = [];
          }
          acc[russianType].push([x, y]);
        }
      });
      return acc;
    }, {});

    // Create base state object with proper text handling
    const state = {
      map: {
        w: map.width,
        h: map.height,
        desc: {
          name: MAP_DESCRIPTION.name,
          desc: MAP_DESCRIPTION.desc
        },
        tiles: {}
      },
      chars: characters.map(char => ({
        id: char.id,
        name: char.name,
        pos: [char.position.x, char.position.y],
        icon: char.icon,
        stats: {
          hp: char.stats.hp,
          max: char.stats.maxHp,
          ac: char.stats.ac,
          str: char.stats.strength,
          dex: char.stats.agility,
          con: char.stats.constitution,
          int: char.stats.intelligence,
          wis: char.stats.wisdom,
          cha: char.stats.charisma
        },
        weapon: {
          name: char.weapon.name,
          dmg: char.weapon.damage
        },
        spells: char.spells.map(spell => ({
          name: spell.name,
          effect: spell.damage || spell.healing || spell.effect
        }))
      })),
      turn: {
        order: turnOrder.map(char => char.name),
        current: turnOrder[currentTurn]?.name || null
      }
    };

    // Add tile types that have tiles
    Object.entries(tiles).forEach(([type, positions]) => {
      if (positions.length > 0) {
        state.map.tiles[type] = positions;
      }
    });

    // Custom JSON stringify to preserve spaces in text fields
    const customStringify = (obj) => {
      return JSON.stringify(obj, null, 2)
        // Compact coordinate arrays
        .replace(/\[\s+(\d+)\s*,\s*(\d+)\s*\]/g, '[$1,$2]')
        // Compact consecutive coordinate arrays
        .replace(/\],\s+\[/g, '],[');
    };

    return JSON.parse(customStringify(state));
  };

  useEffect(() => {
    // Initialize the ship map and turn order
    const initializeMap = () => {
      const tiles = Array(MOCK_SHIP_MAP.height).fill().map((_, y) => 
        Array(MOCK_SHIP_MAP.width).fill().map((_, x) => {
          // Create outer walls
          const isEdge = x === 0 || x === MOCK_SHIP_MAP.width - 1 || 
                        y === 0 || y === MOCK_SHIP_MAP.height - 1;
          
          // Create a river flowing through the map
          const isRiver = (x === 5 || x === 6) && y > 3 && y < MOCK_SHIP_MAP.height - 4;
          
          // Create some wall structures
          const isInnerWall = (
            // Horizontal wall segments
            (y === 8 && x > 8 && x < 13) ||
            (y === 15 && x > 2 && x < 7) ||
            // Vertical wall segments
            (x === 10 && y > 8 && y < 12) ||
            (x === 3 && y > 15 && y < 20) ||
            // Small room in the corner
            (x > 11 && x < 14 && y > 2 && y < 5) ||
            (x === 11 && y === 3)
          );

          // Bridge over the river
          const isBridge = (x === 5 || x === 6) && y === 12;

          return {
            type: isEdge || isInnerWall ? 'WALL' : 
                  isRiver && !isBridge ? 'WATER' : 
                  'WOOD_FLOOR',
            x,
            y
          };
        })
      );

      setMap({
        ...MOCK_SHIP_MAP,
        tiles,
        specialTiles: tiles.flatMap(row => 
          row.filter(tile => tile.type !== 'WOOD_FLOOR')
        ),
        playerPosition: { x: 7, y: 20 } // Starting position
      });

      // Initialize turn order with entities
      const combatants = [...MOCK_SHIP_MAP.entities.filter(e => e.type === 'enemy')];
      
      // Sort by initiative
      const sortedTurnOrder = combatants.sort((a, b) => 
        (b.stats?.initiative || 0) - (a.stats?.initiative || 0)
      );

      setTurnOrder(sortedTurnOrder);
    };

    initializeMap();
  }, []);

  // Update handleNextTurn to make API call
  const handleNextTurn = async () => {
    try {
      const currentState = getCurrentGameState();
      
      const response = await fetch('/api/game/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentState),
      });

      const data = await response.json();
      
      // Update map state with new data
      setMap(data.mapData);
      setCharacters(data.entities);
      
      // Find the index of the next character in the turn order
      const nextCharacterIndex = turnOrder.findIndex(char => char.name === data.currentTurn);
      setCurrentTurn(nextCharacterIndex !== -1 ? nextCharacterIndex : 0);
      
      // Add new action to battle log
      setBattleLog(prev => [...prev, data.actionText]);
    } catch (error) {
      console.error('Error processing turn:', error);
    }
  };

  // Add function to view current JSON state
  const handleViewJson = () => {
    const currentState = getCurrentGameState();
    console.log(currentState);
    setShowJsonViewer(true);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setMapPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCreateCharacter = (newCharacter) => {
    const characterWithId = {
      ...newCharacter,
      id: `character-${characters.length + 1}`,
      position: null // Will be set when placed on map
    };
    setSelectedCharacter(characterWithId);
    setPlacingCharacter(true);
    setShowCharacterCreation(false);
  };

  // Handle clicking on a tile
  const handleTileClick = (x, y) => {
    if (placingCharacter && selectedCharacter) {
      // Check if tile is available (not a wall or occupied)
      const isWall = map.tiles[y][x].type === 'WALL';
      const isOccupied = characters.some(char => 
        char.position && char.position.x === x && char.position.y === y
      );

      if (!isWall && !isOccupied) {
        const characterWithPosition = {
          ...selectedCharacter,
          position: { x, y }
        };
        setCharacters(prev => [...prev, characterWithPosition]);
        setSelectedCharacter(null);
        setPlacingCharacter(false);
      }
    }
  };

  // Update the map rendering
  const renderTile = (tile) => {
    const character = characters.find(
      char => char.position && char.position.x === tile.x && char.position.y === tile.y
    );

    const tileType = TILE_TYPES[tile.type];

    return (
      <div
        key={`${tile.x}-${tile.y}`}
        onClick={() => handleTileClick(tile.x, tile.y)}
        className={`
          w-12 h-12 relative select-none
          ${tileType.className}
          ${placingCharacter && !tileType.blocked ? 'cursor-pointer hover:brightness-110' : ''}
          transition-all duration-200
          border border-[var(--color-grid)]
        `}
      >
        {tileType.icon && (
          <div className="absolute inset-0 flex items-center justify-center text-lg opacity-50">
            {tileType.icon}
          </div>
        )}
        
        {character && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="text-2xl">{character.icon}</div>
            <div className="text-xs text-white bg-black/80 px-1 rounded">
              Здоровье: {character.stats.hp}/{character.stats.maxHp}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sort characters by agility when turn order is needed
  useEffect(() => {
    const sortedCharacters = [...characters].sort((a, b) => b.stats.agility - a.stats.agility);
    setTurnOrder(sortedCharacters);
  }, [characters]);

  if (!map) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen bg-[var(--color-bg-primary)] p-8">
        <div className="flex flex-col items-center flex-1">
          {/* Instructions when placing character */}
          {placingCharacter && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg border border-[var(--color-border)] shadow-lg">
              Выберите место для {selectedCharacter.name}
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <button 
              onClick={handleNextTurn} 
              className="px-4 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Следующий Ход ({currentTurn + 1}/{turnOrder.length})
            </button>
            <button 
              onClick={handleViewJson}
              className="px-4 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Просмотр JSON
            </button>
          </div>

          {/* Add Character button positioned above Turn Order */}
          <button
            onClick={() => setShowCharacterCreation(true)}
            className="fixed left-4 top-32 w-64 px-4 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors shadow-lg"
          >
            ��� Добавить Персонажа
          </button>

          <div className="relative w-[800px] h-[800px] rounded-lg bg-[var(--color-map-bg)] overflow-hidden shadow-2xl border-8 border-[var(--color-wall-border)]">
            <div 
              className="absolute select-none cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {map.tiles.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((tile) => renderTile(tile))}
                </div>
              ))}
              
              {/* Render NPCs/monsters */}
              {map.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-2xl"
                  style={{
                    left: entity.position.x * 48,
                    top: entity.position.y * 48
                  }}
                >
                  {entity.image}
                </div>
              ))}
            </div>
          </div>

          <TurnOrder 
            characters={turnOrder}
            currentTurn={currentTurn}
          />

          <CharacterCreationModal
            isOpen={showCharacterCreation}
            onClose={() => {
              setShowCharacterCreation(false);
              setSelectedCharacter(null);
              setPlacingCharacter(false);
            }}
            onCreateCharacter={handleCreateCharacter}
          />
        </div>

        {/* Turn order and battle log sidebar */}
        <div className="w-80 ml-4 flex flex-col">
          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg mb-4">
            <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Turn Order</h3>
            <div className="space-y-2">
              {turnOrder.map((character, index) => (
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
                        HP: {character.stats.hp}/{character.stats.maxHp} | AC: {character.stats.ac}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg flex-1">
            <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Журнал Боя</h3>
            <div className="space-y-2 h-[400px] overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-[var(--color-text-secondary)] text-sm p-2 bg-[var(--color-bg-hover)] rounded">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <JsonViewerModal
          isOpen={showJsonViewer}
          onClose={() => setShowJsonViewer(false)}
          jsonData={map ? getCurrentGameState() : null}
        />
      </div>
    </Layout>
  );
}