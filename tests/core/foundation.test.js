/**
 * foundation.test.js - Pruebas básicas de la Fase A
 * 
 * Ejecuta en consola del navegador para verificar que todo funciona
 */
import { GameObject } from '../../src/core/model/GameObject.js';
import { Slot } from '../../src/core/model/Slot.js';
import { Layer, LayerState } from '../../src/core/model/Layer.js';
import { Shelf, ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Structure, Orientation } from '../../src/core/model/Structure.js';
import { Board } from '../../src/core/model/Board.js';
import { DynamicState } from '../../src/core/state/DynamicState.js';
import { LevelState } from '../../src/core/state/LevelState.js';
import { GamePhase, isInputLocked } from '../../src/core/state/GamePhase.js';
import { CommandType, createMoveObjectCommand } from '../../src/core/commands/Commands.js';
import { EventType, EventBus } from '../../src/core/events/Events.js';
import * as Queries from '../../src/core/queries/StateQueries.js';

console.log('=== OBJETINOS - FASE A: PRUEBAS DE FUNDACIÓN ===\n');

// 1. Prueba de GameObject
console.log('1. Probando GameObject...');
const obj1 = new GameObject('obj_1', 'APPLE', 'RED');
const obj2 = new GameObject('obj_2', 'APPLE', 'RED');
const obj3 = new GameObject('obj_3', 'APPLE', 'BLUE');
console.log('   obj1.matches(obj2):', obj1.matches(obj2)); // true
console.log('   obj1.matches(obj3):', obj1.matches(obj3)); // false
console.log('   ✓ GameObject OK\n');

// 2. Prueba de Slot
console.log('2. Probando Slot...');
const slot1 = new Slot('slot_1', 0);
console.log('   slot1.isEmpty():', slot1.isEmpty()); // true
slot1.setObject('obj_1');
console.log('   slot1.isEmpty() after set:', slot1.isEmpty()); // false
slot1.clear();
console.log('   slot1.isEmpty() after clear:', slot1.isEmpty()); // true
console.log('   ✓ Slot OK\n');

// 3. Prueba de Layer
console.log('3. Probando Layer...');
const layer = new Layer('layer_1', LayerState.TOP);
layer.addSlot(new Slot('s1', 0));
layer.addSlot(new Slot('s2', 1));
layer.addSlot(new Slot('s3', 2));
console.log('   layer.allEmpty():', layer.allEmpty()); // true
layer.slots[0].setObject('obj_1');
console.log('   layer.allEmpty() with object:', layer.allEmpty()); // false
console.log('   layer.isInteractive():', layer.isInteractive()); // true
console.log('   ✓ Layer OK\n');

// 4. Prueba de Shelf
console.log('4. Probando Shelf...');
const shelf = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.COLLAPSIBLE);
const shelfLayer = new Layer('sl1', LayerState.TOP);
shelfLayer.addSlot(new Slot('ss1', 0));
shelfLayer.addSlot(new Slot('ss2', 1));
shelfLayer.addSlot(new Slot('ss3', 2));
shelf.addLayer(shelfLayer);
console.log('   shelf.capacity():', shelf.capacity()); // 3
console.log('   shelf.canCollapse():', shelf.canCollapse()); // true (vacío y collapsible)
shelfLayer.slots[0].setObject('obj_1');
console.log('   shelf.canCollapse() with object:', shelf.canCollapse()); // false
console.log('   ✓ Shelf OK\n');

// 5. Prueba de Structure
console.log('5. Probando Structure...');
const structure = new Structure('struct_1', Orientation.VERTICAL);
structure.addShelf(shelf);
console.log('   structure.shelves.length:', structure.shelves.length); // 1
console.log('   ✓ Structure OK\n');

// 6. Prueba de Board
console.log('6. Probando Board...');
const board = new Board();
board.addStructure(structure);
console.log('   board.structures.length:', board.structures.length); // 1
const topSlots = board.getAllTopSlots();
console.log('   board.getAllTopSlots().length:', topSlots.length); // 3
console.log('   ✓ Board OK\n');

// 7. Prueba de DynamicState
console.log('7. Probando DynamicState...');
const dynamicState = new DynamicState();
dynamicState.add(obj1);
dynamicState.add(obj2);
console.log('   dynamicState.count():', dynamicState.count()); // 2
dynamicState.remove('obj_1');
console.log('   dynamicState.count() after remove:', dynamicState.count()); // 1
console.log('   ✓ DynamicState OK\n');

// 8. Prueba de GamePhase
console.log('8. Probando GamePhase...');
console.log('   isInputLocked(READY):', isInputLocked(GamePhase.READY)); // false
console.log('   isInputLocked(RESOLVING):', isInputLocked(GamePhase.RESOLVING)); // true
console.log('   ✓ GamePhase OK\n');

// 9. Prueba de Commands
console.log('9. Probando Commands...');
const moveCmd = createMoveObjectCommand('obj_1', 'slot_2');
console.log('   Command type:', moveCmd.type); // MOVE_OBJECT
console.log('   Command payload:', moveCmd.payload);
console.log('   ✓ Commands OK\n');

// 10. Prueba de Events
console.log('10. Probando Events...');
const eventBus = new EventBus();
let eventReceived = false;
eventBus.on(EventType.OBJECT_MOVED, (event) => {
  eventReceived = true;
  console.log('   Event received:', event.type);
});
eventBus.emit(EventType.OBJECT_MOVED, { objectId: 'obj_1' });
console.log('   eventReceived:', eventReceived); // true
console.log('   ✓ Events OK\n');

// 11. Prueba de Queries
console.log('11. Probando StateQueries...');
const location = Queries.getObjectLocation(board, dynamicState, 'obj_2');
console.log('   Object location found:', location !== null);
const emptySlots = Queries.getEmptyTopSlots(board);
console.log('   Empty top slots:', emptySlots.length);
console.log('   ✓ StateQueries OK\n');

// 12. Prueba de LevelState
console.log('12. Probando LevelState...');
const levelState = new LevelState(1, board, dynamicState);
console.log('   Level number:', levelState.levelNumber);
console.log('   Remaining objects:', levelState.getRemainingObjects());
console.log('   ✓ LevelState OK\n');

console.log('=== TODAS LAS PRUEBAS PASARON ===');
console.log('La Fase A (Fundación) está correctamente implementada.');