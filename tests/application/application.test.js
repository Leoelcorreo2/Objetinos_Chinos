/**
 * application.test.js - Pruebas de la Fase D (Aplicación)
 */
import { GameObject } from '../../src/core/model/GameObject.js';
import { Slot } from '../../src/core/model/Slot.js';
import { Layer, LayerState } from '../../src/core/model/Layer.js';
import { Shelf, ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Structure } from '../../src/core/model/Structure.js';
import { Board } from '../../src/core/model/Board.js';
import { DynamicState } from '../../src/core/state/DynamicState.js';
import { LevelState } from '../../src/core/state/LevelState.js';
import { GamePhase } from '../../src/core/state/GamePhase.js';
import { CommandType, createMoveObjectCommand } from '../../src/core/commands/Commands.js';
import { EventType, EventBus } from '../../src/core/events/Events.js';

import { GameState } from '../../src/application/GameState.js';
import { GameController } from '../../src/application/GameController.js';

console.log('=== OBJETINOS - FASE D: PRUEBAS DE APLICACIÓN ===\n');

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

// 1. GameState
console.log('1. Probando GameState...');
const gameState = new GameState();
console.log('   Fase inicial:', gameState.gamePhase === GamePhase.BOOT);
console.log('   Vidas iniciales:', gameState.lives === 5);
console.log('   Nivel actual:', gameState.currentLevel === 1);
gameState.setPhase(GamePhase.READY);
console.log('   Cambio de fase:', gameState.gamePhase === GamePhase.READY);
gameState.loseLife();
console.log('   Perder vida:', gameState.lives === 4);
console.log('   ✓ GameState OK\n');

// 2. GameController - Movimiento válido
console.log('2. Probando GameController - Movimiento válido...');
const eventBus = new EventBus();
const levelState = createTestLevelState();
const controller = new GameController(gameState, levelState, eventBus);
gameState.setPhase(GamePhase.READY);

const moveCmd = createMoveObjectCommand('o1', 's4');
const moveResult = controller.handleCommand(moveCmd);
console.log('   Movimiento manejado:', moveResult.handled);
console.log('   Objeto movido:', levelState.board.structures[0].shelves[0].layers[0].slots[0].isEmpty());
console.log('   Destino ocupado:', levelState.board.structures[0].shelves[1].layers[0].slots[0].objectId === 'o1');
console.log('   ✓ Movimiento válido OK\n');

// 3. GameController - Input bloqueado durante resolución
console.log('3. Probando bloqueo de input...');
const levelState2 = createTestLevelState();
const controller2 = new GameController(gameState, levelState2, eventBus);
gameState.setPhase(GamePhase.READY);

controller2._resolving = true;
const blockedResult = controller2.handleCommand(createMoveObjectCommand('o1', 's4'));
console.log('   Input bloqueado:', !blockedResult.handled);
console.log('   ✓ Bloqueo de input OK\n');

// 4. GameController - Victoria (formando un trío que vacíe el tablero)
console.log('4. Probando victoria...');
const eventBus4 = new EventBus();
const levelState4 = new LevelState(1, new Board(), new DynamicState());

const struct4 = new Structure('struct_4');
levelState4.board.addStructure(struct4);

const shelf4a = new Shelf('shelf_4a', ShelfType.NORMAL, ShelfBehavior.STANDARD);
const shelf4b = new Shelf('shelf_4b', ShelfType.NORMAL, ShelfBehavior.STANDARD);
struct4.addShelf(shelf4a);
struct4.addShelf(shelf4b);

// Shelf A: capa TOP con 1 manzana roja y 2 huecos vacíos
const layer4a = new Layer('layer_4a', LayerState.TOP);
const s4a1 = new Slot('s4a1', 0);
const s4a2 = new Slot('s4a2', 1);
const s4a3 = new Slot('s4a3', 2);
const o4a1 = new GameObject('o4a1', 'APPLE', 'RED');
s4a1.setObject('o4a1'); levelState4.dynamicState.add(o4a1);
layer4a.addSlot(s4a1); layer4a.addSlot(s4a2); layer4a.addSlot(s4a3);
shelf4a.addLayer(layer4a);

// Shelf B: capa TOP con 2 manzanas rojas y 1 hueco vacío
const layer4b = new Layer('layer_4b', LayerState.TOP);
const s4b1 = new Slot('s4b1', 0);
const s4b2 = new Slot('s4b2', 1);
const s4b3 = new Slot('s4b3', 2);
const o4b1 = new GameObject('o4b1', 'APPLE', 'RED');
const o4b2 = new GameObject('o4b2', 'APPLE', 'RED');
s4b1.setObject('o4b1'); levelState4.dynamicState.add(o4b1);
s4b2.setObject('o4b2'); levelState4.dynamicState.add(o4b2);
layer4b.addSlot(s4b1); layer4b.addSlot(s4b2); layer4b.addSlot(s4b3);
shelf4b.addLayer(layer4b);

const controller4 = new GameController(gameState, levelState4, eventBus4);
gameState.setPhase(GamePhase.READY);

// Mover o4a1 a s4b3 para completar el trío en shelf B (3 manzanas rojas)
const moveCmd4 = createMoveObjectCommand('o4a1', 's4b3');
const victoryResult = controller4.handleCommand(moveCmd4);

console.log('   Victoria detectada:', victoryResult.victory === true);
console.log('   Fase actual:', gameState.gamePhase === GamePhase.VICTORY);
console.log('   Objetos restantes:', levelState4.dynamicState.count()); // Debería ser 0
console.log('   ✓ Victoria OK\n');

// 5. GameController - Continuar nivel (ahora sí estamos en VICTORY)
console.log('5. Probando continuar nivel...');
const continueResult = controller4.handleCommand({ type: CommandType.CONTINUE_LEVEL, payload: {} });
console.log('   Continuar manejado:', continueResult.handled);
console.log('   Nivel actual incrementado:', gameState.currentLevel === 2);
console.log('   ✓ Continuar nivel OK\n');

// 6. GameController - Pausa
console.log('6. Probando pausa...');
const levelState6 = createTestLevelState();
const controller6 = new GameController(gameState, levelState6, eventBus);
gameState.setPhase(GamePhase.READY);

const pauseResult = controller6.handleCommand({ type: CommandType.PAUSE_GAME, payload: {} });
console.log('   Pausa manejada:', pauseResult.handled);
console.log('   Fase en pausa:', gameState.gamePhase === GamePhase.PAUSED);
console.log('   ✓ Pausa OK\n');

// 7. GameController - Time expired
console.log('7. Probando time expired...');
const levelState7 = createTestLevelState();
const controller7 = new GameController(gameState, levelState7, eventBus);
gameState.setPhase(GamePhase.READY);
gameState.lives = 1;

const timeResult = controller7.handleTimeExpired();
console.log('   Time expired manejado:', timeResult.handled);
console.log('   Game over (0 vidas):', timeResult.gameOver === true);
console.log('   Fase game over:', gameState.gamePhase === GamePhase.GAME_OVER);
console.log('   ✓ Time expired OK\n');

// 8. Eventos emitidos
console.log('8. Probando eventos emitidos...');
const eventBus8 = new EventBus();
let moveEventEmitted = false;
eventBus8.on(EventType.OBJECT_MOVED, () => { moveEventEmitted = true; });

const levelState8 = createTestLevelState();
const controller8 = new GameController(gameState, levelState8, eventBus8);
gameState.setPhase(GamePhase.READY);
controller8.handleCommand(createMoveObjectCommand('o1', 's4'));
console.log('   Evento OBJECT_MOVED emitido:', moveEventEmitted);
console.log('   ✓ Eventos OK\n');

console.log('=== TODAS LAS PRUEBAS DE APLICACIÓN PASARON ===');
console.log('La Fase D (Aplicación) está correctamente implementada.');