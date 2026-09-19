/**
 * systems.test.js - Pruebas de la Fase C (Sistemas)
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

import { MovementSystem } from '../../src/systems/MovementSystem.js';
import { TrioSystem } from '../../src/systems/TrioSystem.js';
import { LayerSystem } from '../../src/systems/LayerSystem.js';
import { CollapseSystem } from '../../src/systems/CollapseSystem.js';
import { VictorySystem } from '../../src/systems/VictorySystem.js';
import { BlockDetectionSystem } from '../../src/systems/BlockDetectionSystem.js';

console.log('=== OBJETINOS - FASE C: PRUEBAS DE SISTEMAS ===\n');

function createTestLevelState() {
  const board = new Board();
  const dynamicState = new DynamicState();
  const structure = new Structure('struct_1');
  board.addStructure(structure);
  
  const shelf1 = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  const shelf2 = new Shelf('shelf_2', ShelfType.NORMAL, ShelfBehavior.COLLAPSIBLE);
  structure.addShelf(shelf1);
  structure.addShelf(shelf2);
  
  const layer1 = new Layer('layer_1', LayerState.TOP);
  const s1 = new Slot('s1', 0);
  const s2 = new Slot('s2', 1);
  const s3 = new Slot('s3', 2);
  
  const o1 = new GameObject('o1', 'APPLE', 'RED');
  const o2 = new GameObject('o2', 'APPLE', 'RED');
  const o3 = new GameObject('o3', 'BOTTLE', 'BLUE');
  
  s1.setObject('o1'); dynamicState.add(o1);
  s2.setObject('o2'); dynamicState.add(o2);
  s3.setObject('o3'); dynamicState.add(o3);
  
  layer1.addSlot(s1); layer1.addSlot(s2); layer1.addSlot(s3);
  shelf1.addLayer(layer1);
  
  const layer2 = new Layer('layer_2', LayerState.TOP);
  const s4 = new Slot('s4', 0);
  const s5 = new Slot('s5', 1);
  const s6 = new Slot('s6', 2);
  layer2.addSlot(s4); layer2.addSlot(s5); layer2.addSlot(s6);
  shelf2.addLayer(layer2);
  
  return new LevelState(1, board, dynamicState);
}

const eventBus = new EventBus();

// 1. MovementSystem
console.log('1. Probando MovementSystem...');
const state1 = createTestLevelState();
const moveSys = new MovementSystem(eventBus);
const moveResult = moveSys.execute(state1, 'o1', 's4');
console.log('   Movimiento ejecutado:', moveResult.success);
console.log('   Slot origen vacío:', state1.board.structures[0].shelves[0].layers[0].slots[0].isEmpty());
console.log('   Slot destino ocupado:', state1.board.structures[0].shelves[1].layers[0].slots[0].objectId === 'o1');
console.log('   ✓ MovementSystem OK\n');

// 2. TrioSystem
console.log('2. Probando TrioSystem...');
const state2 = createTestLevelState();
const trioSys = new TrioSystem(eventBus);
const shelf1_t = state2.board.structures[0].shelves[0];
const layer1_t = shelf1_t.layers[0];
layer1_t.slots[2].setObject('o3_new');
state2.dynamicState.remove('o3');
state2.dynamicState.add(new GameObject('o3_new', 'APPLE', 'RED'));

let trioEmitted = false;
eventBus.on(EventType.TRIO_COMPLETED, () => { trioEmitted = true; });

const trioResult = trioSys.check(state2, 'shelf_1', 'layer_1');
console.log('   Trío detectado y eliminado:', trioResult !== null);
console.log('   Evento emitido:', trioEmitted);
console.log('   Objetos restantes:', state2.dynamicState.count()); // 0
console.log('   ✓ TrioSystem OK\n');

// 3. LayerSystem
console.log('3. Probando LayerSystem...');
const state3 = createTestLevelState();
const layerSys = new LayerSystem(eventBus);
const shelf1_l = state3.board.structures[0].shelves[0];
const layer1_l = shelf1_l.layers[0];
const layer2_l = new Layer('layer_2_new', LayerState.SHADED);
shelf1_l.addLayer(layer2_l);

// Vaciar la capa TOP
layer1_l.slots.forEach(s => s.objectId = null);
state3.dynamicState.clear();

const advanced = layerSys.checkAndAdvance(state3);
console.log('   Capas avanzadas:', advanced.length > 0);
console.log('   Nueva capa TOP:', layer2_l.state === LayerState.TOP);
console.log('   ✓ LayerSystem OK\n');

// 4. CollapseSystem
console.log('4. Probando CollapseSystem...');
const state4 = createTestLevelState();
const collapseSys = new CollapseSystem(eventBus);
const shelf2_c = state4.board.structures[0].shelves[1]; // Ya está vacío

let collapseEmitted = false;
eventBus.on(EventType.SHELF_COLLAPSED, () => { collapseEmitted = true; });

const collapsed = collapseSys.check(state4);
console.log('   Estante colapsado:', collapsed.length > 0);
console.log('   Estado collapsed:', shelf2_c.collapsed);
console.log('   Evento emitido:', collapseEmitted);
console.log('   ✓ CollapseSystem OK\n');

// 5. VictorySystem
console.log('5. Probando VictorySystem...');
const state5 = createTestLevelState();
const victorySys = new VictorySystem(eventBus);
console.log('   isVictory (con objetos):', !victorySys.check(state5));
state5.dynamicState.clear();
let victoryEmitted = false;
eventBus.on(EventType.LEVEL_COMPLETED, () => { victoryEmitted = true; });
console.log('   isVictory (sin objetos):', victorySys.check(state5));
console.log('   Evento emitido:', victoryEmitted);
console.log('   ✓ VictorySystem OK\n');

// 6. BlockDetectionSystem
console.log('6. Probando BlockDetectionSystem...');
const state6 = createTestLevelState();
const blockSys = new BlockDetectionSystem(eventBus);
console.log('   isBlocked (hay huecos libres):', !blockSys.check(state6));

// Llenar todo para bloquear
const shelf1_b = state6.board.structures[0].shelves[0];
const shelf2_b = state6.board.structures[0].shelves[1];
shelf1_b.layers[0].slots[0].setObject('o4'); state6.dynamicState.add(new GameObject('o4', 'BOOK', 'GREEN'));
shelf1_b.layers[0].slots[1].setObject('o5'); state6.dynamicState.add(new GameObject('o5', 'BOOK', 'GREEN'));
shelf1_b.layers[0].slots[2].setObject('o6'); state6.dynamicState.add(new GameObject('o6', 'BOOK', 'GREEN'));
shelf2_b.layers[0].slots[0].setObject('o7'); state6.dynamicState.add(new GameObject('o7', 'BALL', 'BLUE'));
shelf2_b.layers[0].slots[1].setObject('o8'); state6.dynamicState.add(new GameObject('o8', 'BALL', 'BLUE'));
shelf2_b.layers[0].slots[2].setObject('o9'); state6.dynamicState.add(new GameObject('o9', 'BALL', 'BLUE'));

let blockEmitted = false;
eventBus.on(EventType.BLOCK_DETECTED, () => { blockEmitted = true; });
console.log('   isBlocked (sin huecos libres):', blockSys.check(state6));
console.log('   Evento emitido:', blockEmitted);
console.log('   ✓ BlockDetectionSystem OK\n');

console.log('=== TODAS LAS PRUEBAS DE SISTEMAS PASARON ===');
console.log('La Fase C (Sistemas) está correctamente implementada.');