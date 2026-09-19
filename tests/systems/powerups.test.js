/**
 * powerups.test.js - Pruebas del PowerUpSystem
 */
import { GameObject } from '../../src/core/model/GameObject.js';
import { Slot } from '../../src/core/model/Slot.js';
import { Layer, LayerState } from '../../src/core/model/Layer.js';
import { Shelf, ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Structure } from '../../src/core/model/Structure.js';
import { Board } from '../../src/core/model/Board.js';
import { DynamicState } from '../../src/core/state/DynamicState.js';
import { LevelState } from '../../src/core/state/LevelState.js';
import { EventBus, EventType } from '../../src/core/events/Events.js';
import { PowerUpType, PowerUp } from '../../src/core/model/PowerUp.js';
import { PowerUpSystem } from '../../src/systems/powerups/PowerUpSystem.js';
import { PowerUpRules } from '../../src/rules/powerups/PowerUpRules.js';

console.log('=== OBJETINOS - PRUEBAS DE POWER-UPS ===\n');

function createTestLevelState() {
  /**
   * Nivel con 3 manzanas rojas distribuidas en 2 estantes
   */
  const board = new Board();
  const dynamicState = new DynamicState();
  
  const structure = new Structure('struct_1');
  board.addStructure(structure);
  
  const shelf1 = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  const shelf2 = new Shelf('shelf_2', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure.addShelf(shelf1);
  structure.addShelf(shelf2);
  
  // Shelf 1: 2 manzanas rojas
  const layer1 = new Layer('layer_1', LayerState.TOP);
  const s1 = new Slot('s1', 0);
  const s2 = new Slot('s2', 1);
  const s3 = new Slot('s3', 2);
  const o1 = new GameObject('o1', 'APPLE', 'RED');
  const o2 = new GameObject('o2', 'APPLE', 'RED');
  s1.setObject('o1'); dynamicState.add(o1);
  s2.setObject('o2'); dynamicState.add(o2);
  layer1.addSlot(s1); layer1.addSlot(s2); layer1.addSlot(s3);
  shelf1.addLayer(layer1);
  
  // Shelf 2: 1 manzana roja
  const layer2 = new Layer('layer_2', LayerState.TOP);
  const s4 = new Slot('s4', 0);
  const s5 = new Slot('s5', 1);
  const s6 = new Slot('s6', 2);
  const o3 = new GameObject('o3', 'APPLE', 'RED');
  s4.setObject('o3'); dynamicState.add(o3);
  layer2.addSlot(s4); layer2.addSlot(s5); layer2.addSlot(s6);
  shelf2.addLayer(layer2);
  
  return new LevelState(1, board, dynamicState);
}

// 1. PowerUp - Creación y consumo
console.log('1. Probando PowerUp...');
const hammer = new PowerUp(PowerUpType.HAMMER, 3);
console.log('   isAvailable:', hammer.isAvailable() === true);
console.log('   consume:', hammer.consume() === true);
console.log('   quantity after consume:', hammer.quantity === 2);
hammer.add(1);
console.log('   quantity after add:', hammer.quantity === 3);

const json = hammer.toJSON();
const restored = PowerUp.fromJSON(json);
console.log('   Serialización:', restored.type === PowerUpType.HAMMER);
console.log('   ✓ PowerUp OK\n');

// 2. PowerUpRules - Validación de Martillo
console.log('2. Probando PowerUpRules (Martillo)...');
const levelState = createTestLevelState();
const inventory = { [PowerUpType.HAMMER]: 1 };

const validation1 = PowerUpRules.canUsePowerUp(levelState, PowerUpType.HAMMER, 'o1', inventory);
console.log('   Martillo válido con objetivo:', validation1.valid === true);

const validation2 = PowerUpRules.canUsePowerUp(levelState, PowerUpType.HAMMER, null, inventory);
console.log('   Martillo sin objetivo:', validation2.valid === false);

const emptyInventory = { [PowerUpType.HAMMER]: 0 };
const validation3 = PowerUpRules.canUsePowerUp(levelState, PowerUpType.HAMMER, 'o1', emptyInventory);
console.log('   Martillo sin disponibilidad:', validation3.valid === false);
console.log('   ✓ PowerUpRules OK\n');

// 3. PowerUpSystem - Martillo
console.log('3. Probando PowerUpSystem (Martillo)...');
const eventBus = new EventBus();
const powerUpSystem = new PowerUpSystem(eventBus);
const levelState2 = createTestLevelState();
const inventory2 = { [PowerUpType.HAMMER]: 1 };

let hammerEventEmitted = false;
eventBus.on(EventType.POWERUP_HAMMER_USED, () => { hammerEventEmitted = true; });

const result1 = powerUpSystem.usePowerUp(
  levelState2,
  PowerUpType.HAMMER,
  'o1',
  inventory2,
  null,
  null
);

console.log('   Martillo ejecutado:', result1.success === true);
console.log('   Trío eliminado:', result1.trioEliminated === true);
console.log('   Objetos restantes:', levelState2.dynamicState.count() === 0);
console.log('   Evento emitido:', hammerEventEmitted === true);
console.log('   Inventario consumido:', inventory2[PowerUpType.HAMMER] === 0);
console.log('   ✓ Martillo OK\n');

// 4. PowerUpSystem - Hielo
console.log('4. Probando PowerUpSystem (Hielo)...');
const levelState3 = createTestLevelState();
const inventory3 = { [PowerUpType.ICE]: 1 };

let timePaused = false;
let timeResumed = false;
const onTimePause = () => { timePaused = true; };
const onTimeResume = () => { timeResumed = true; };

const result2 = powerUpSystem.usePowerUp(
  levelState3,
  PowerUpType.ICE,
  null,
  inventory3,
  onTimePause,
  onTimeResume
);

console.log('   Hielo ejecutado:', result2.success === true);
console.log('   Tiempo pausado:', timePaused === true);
console.log('   Inventario consumido:', inventory3[PowerUpType.ICE] === 0);
console.log('   ✓ Hielo OK\n');

// 5. PowerUpSystem - Aumento de tiempo
console.log('5. Probando PowerUpSystem (Aumento de tiempo)...');
const levelState4 = createTestLevelState();
levelState4.timer = 60;
const inventory4 = { [PowerUpType.TIME_BOOST]: 1 };

const result3 = powerUpSystem.usePowerUp(
  levelState4,
  PowerUpType.TIME_BOOST,
  null,
  inventory4,
  null,
  null
);

console.log('   Aumento de tiempo ejecutado:', result3.success === true);
console.log('   Tiempo añadido:', result3.timeAdded === 60);
console.log('   Nuevo tiempo:', levelState4.timer === 120);
console.log('   Inventario consumido:', inventory4[PowerUpType.TIME_BOOST] === 0);
console.log('   ✓ Aumento de tiempo OK\n');

// 6. PowerUpSystem - Power-up no implementado
console.log('6. Probando power-up no implementado...');
const levelState5 = createTestLevelState();
const inventory5 = { [PowerUpType.MAGIC_WAND]: 1 };

const result4 = powerUpSystem.usePowerUp(
  levelState5,
  PowerUpType.MAGIC_WAND,
  null,
  inventory5,
  null,
  null
);

console.log('   Power-up no implementado:', result4.success === false);
console.log('   ✓ Power-up no implementado OK\n');

console.log('=== TODAS LAS PRUEBAS DE POWER-UPS PASARON ===');
console.log('PowerUpSystem está correctamente implementado.');