import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

// Define tile types with their properties
const TILE_TYPES = {
  WOOD_FLOOR: {
    className: 'bg-amber-800/80',
    label: 'Wood Floor'
  },
  WATER: {
    className: 'bg-blue-500/50',
    label: 'Water'
  },
  WALL: {
    className: 'bg-stone-800',
    label: 'Wall'
  },
  CRATE: {
    className: 'bg-amber-600',
    label: 'Crate'
  }
};

// Mock entities for the map
const MOCK_ENTITIES = [
  {
    id: 'goblin-1',
    name: 'Goblin Scout',
    type: 'enemy',
    position: { x: 5, y: 5 },
    image: '🧟',
    stats: {
      hp: 7,
      maxHp: 7,
      ac: 15,
      initiative: 14,
      strength: 12,
      dexterity: 14,
      constitution: 10
    }
  },
  {
    id: 'skeleton-1',
    name: 'Skeleton Archer',
    type: 'enemy',
    position: { x: 10, y: 8 },
    image: '💀',
    stats: {
      hp: 13,
      maxHp: 13,
      ac: 13,
      initiative: 16,
      strength: 10,
      dexterity: 12,
      constitution: 8
    }
  },
  {
    id: 'chest-1',
    name: 'Treasure Chest',
    type: 'object',
    position: { x: 7, y: 15 },
    image: '📦',
    interaction: 'loot'
  }
];

// Mock data for the ship map
const MOCK_SHIP_MAP = {
  width: 15,
  height: 25,
  tiles: [],
  entities: MOCK_ENTITIES
};

export default function MapPage() {
  const [map, setMap] = useState(null);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [battleLog, setBattleLog] = useState([]);

  useEffect(() => {
    // Initialize the ship map and turn order
    const initializeMap = () => {
      const tiles = Array(MOCK_SHIP_MAP.height).fill().map((_, y) => 
        Array(MOCK_SHIP_MAP.width).fill().map((_, x) => {
          // Create ship hull shape
          const isEdge = x === 0 || x === MOCK_SHIP_MAP.width - 1 || 
                        y === 0 || y === MOCK_SHIP_MAP.height - 1;
          const isCenterHole = x === Math.floor(MOCK_SHIP_MAP.width / 2) && 
                              y === Math.floor(MOCK_SHIP_MAP.height / 2);
          const isRandomCrate = Math.random() < 0.1 && !isEdge && !isCenterHole;

          return {
            type: isEdge ? 'WALL' : 
                  isCenterHole ? 'WATER' :
                  isRandomCrate ? 'CRATE' : 'WOOD_FLOOR',
            x,
            y
          };
        })
      );

      setMap({
        ...MOCK_SHIP_MAP,
        tiles,
        playerPosition: { x: 7, y: 20 } // Starting position
      });

      // Initialize turn order with entities
      const combatants = [...MOCK_ENTITIES.filter(e => e.type === 'enemy')];
      
      // Sort by initiative
      const sortedTurnOrder = combatants.sort((a, b) => 
        (b.stats?.initiative || 0) - (a.stats?.initiative || 0)
      );

      setTurnOrder(sortedTurnOrder);
    };

    initializeMap();
  }, []);

  const handleNextTurn = async () => {
    try {
      const currentState = getCurrentMapState();
      
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
      setTurnOrder(data.turnOrder);
      setCurrentTurn(data.currentTurn);
      
      // Add new action to battle log
      setBattleLog(prev => [...prev, data.actionText]);
    } catch (error) {
      console.error('Error processing turn:', error);
    }
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

  // Function to generate current map state JSON
  const getCurrentMapState = () => {
    return {
      mapData: {
        width: map.width,
        height: map.height,
        tiles: map.tiles,
      },
      entities: map.entities,
      turnOrder,
      currentTurn,
    };
  };

  // Function to view current JSON state
  const handleViewJson = () => {
    const currentState = getCurrentMapState();
    console.log(currentState);
    alert(JSON.stringify(currentState, null, 2));
  };

  // Function to render entity with stats
  const renderEntity = (entity) => {
    return (
      <div 
        key={entity.id}
        className="absolute flex flex-col items-center"
        style={{
          left: `${entity.position.x * 48}px`,
          top: `${entity.position.y * 48}px`,
        }}
      >
        <div className="text-2xl">{entity.image}</div>
        <div className="text-xs text-white bg-black/50 px-1 rounded">
          HP: {entity.stats.hp}/{entity.stats.maxHp}
        </div>
      </div>
    );
  };

  // ... rest of your rendering functions (renderEntity, renderTile) ...

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
      <div className="flex min-h-screen bg-gray-900 p-8">
        <div className="flex flex-col items-center flex-1">
          <div className="mb-4 flex gap-2">
            <button onClick={handleNextTurn} className="btn-secondary">
              Next Turn
            </button>
            <button onClick={handleViewJson} className="btn-secondary">
              View JSON
            </button>
          </div>
          
          <div className="relative w-[800px] h-[800px] rounded-lg bg-blue-900/20 overflow-hidden">
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
                  {row.map((tile) => (
                    <div
                      key={`${tile.x}-${tile.y}`}
                      className={`
                        w-12 h-12 border border-black/20 relative select-none
                        ${TILE_TYPES[tile.type].className}
                        transition-all duration-200
                      `}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Add entity rendering */}
            <div 
              className="absolute"
              style={{
                transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              {map.entities.map(renderEntity)}
            </div>
          </div>
        </div>

        {/* Turn order and battle log sidebar */}
        <div className="w-80 ml-4 flex flex-col">
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="text-white font-bold mb-2">Turn Order</h3>
            <div className="space-y-2">
              {turnOrder.map((entity, index) => (
                <div 
                  key={entity.id}
                  className={`p-2 rounded ${
                    index === currentTurn ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{entity.image}</span>
                    <div>
                      <div className="text-white">{entity.name}</div>
                      <div className="text-sm text-gray-300">
                        HP: {entity.stats.hp}/{entity.stats.maxHp} | AC: {entity.stats.ac}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg flex-1">
            <h3 className="text-white font-bold mb-2">Battle Log</h3>
            <div className="space-y-2 h-[400px] overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-gray-300 text-sm p-2 bg-gray-700 rounded">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 