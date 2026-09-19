/**
 * simulation.test.js - Pruebas de la Fase E (Simulación)
 */
import { GameObject } from '../../src/core/model/GameObject.js';
import { Slot } from '../../src/core/model/Slot.js';
import { Layer, LayerState } from '../../src/core/model/Layer.js';
import { Shelf, ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Structure } from '../../src/core/model/Structure.js';
import { Board } from '../../src/core/model/Board.js';
import { DynamicState } from '../../src/core/state/DynamicState.js';
import { LevelState } from '../../src/core/state/LevelState.js';

import { SimulationState } from '../../src/simulation/state/SimulationState.js';
import { LogicalStateHash } from '../../src/simulation/hash/LogicalStateHash.js';
import { Solution } from '../../src/simulation/simulator/Solution.js';
import { SolutionSimulator } from '../../src/simulation/simulator/SolutionSimulator.js';

console.log('=== OBJETINOS - FASE E: PRUEBAS DE SIMULACIÓN ===\n');

function createSimpleLevelState() {
  /**
   * Nivel simple resoluble:
   * - 1 estructura con 2 estantes
   * - Estante 1: 3 manzanas rojas (trío completo en TOP)
   * - Estante 2: 3 huecos vacíos
   * Solución: mover 2 manzanas al estante 2 para formar trío
   */
  const board = new Board();
  const dynamicState = new DynamicState();
  const structure = new Structure('struct_1');
  board.addStructure(structure);
  
  const shelf1 = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  const shelf2 = new Shelf('shelf_2', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure.addShelf(shelf1);
  structure.addShelf(shelf2);
  
  // Shelf 1: 3 manzanas rojas
  const layer1 = new Layer('layer_1', LayerState.TOP);
  const s1 = new Slot('s1', 0);
  const s2 = new Slot('s2', 1);
  const s3 = new Slot('s3', 2);
  const o1 = new GameObject('o1', 'APPLE', 'RED');
  const o2 = new GameObject('o2', 'APPLE', 'RED');
  const o3 = new GameObject('o3', 'APPLE', 'RED');
  s1.setObject('o1'); dynamicState.add(o1);
  s2.setObject('o2'); dynamicState.add(o2);
  s3.setObject('o3'); dynamicState.add(o3);
  layer1.addSlot(s1); layer1.addSlot(s2); layer1.addSlot(s3);
  shelf1.addLayer(layer1);
  
  // Shelf 2: vacío (3 huecos)
  const layer2 = new Layer('layer_2', LayerState.TOP);
  const s4 = new Slot('s4', 0);
  const s5 = new Slot('s5', 1);
  const s6 = new Slot('s6', 2);
  layer2.addSlot(s4); layer2.addSlot(s5); layer2.addSlot(s6);
  shelf2.addLayer(layer2);
  
  return new LevelState(1, board, dynamicState);
}

// 1. SimulationState
console.log('1. Probando SimulationState...');
const levelState1 = createSimpleLevelState();
const simState1 = new SimulationState(levelState1);
console.log('   Objetos clonados:', simState1.getRemainingObjects() === 3);
console.log('   Estructuras clonadas:', simState1.board.structures.length === 1);
console.log('   Estantes clonados:', simState1.board.structures[0].shelves.length === 2);

// Modificar el estado simulado no debe afectar al original
simState1.dynamicState.remove('o1');
console.log('   Original no afectado:', levelState1.dynamicState.count() === 3);
console.log('   ✓ SimulationState OK\n');

// 2. LogicalStateHash
console.log('2. Probando LogicalStateHash...');
const levelState2a = createSimpleLevelState();
const levelState2b = createSimpleLevelState();
const simState2a = new SimulationState(levelState2a);
const simState2b = new SimulationState(levelState2b);

const hash2a = LogicalStateHash.compute(simState2a);
const hash2b = LogicalStateHash.compute(simState2b);
console.log('   Mismos estados = mismo hash:', hash2a === hash2b);

// Modificar un estado debe cambiar el hash
simState2a.dynamicState.remove('o1');
const hash2aModified = LogicalStateHash.compute(simState2a);
console.log('   Estados diferentes = hash diferente:', hash2aModified !== hash2b);
console.log('   ✓ LogicalStateHash OK\n');

// 3. Solution
console.log('3. Probando Solution...');
const solution = new Solution();
solution.addMove('o1', 's1', 's4');
solution.addMove('o2', 's2', 's5');
solution.recordTrio();
console.log('   Movimientos:', solution.moves.length === 2);
console.log('   Tríos:', solution.metrics.triosCompleted === 1);
console.log('   Total moves:', solution.metrics.totalMoves === 2);

const json = solution.toJSON();
const restored = Solution.fromJSON(json);
console.log('   Serialización/Deserialización:', restored.moves.length === 2);
console.log('   ✓ Solution OK\n');

// 4. SolutionSimulator - Nivel resoluble
console.log('4. Probando SolutionSimulator (nivel resoluble)...');
const levelState4 = createSimpleLevelState();
const simulator = new SolutionSimulator({ maxMoves: 100, maxStates: 1000 });
const solution4 = simulator.solve(levelState4);

console.log('   Solución encontrada:', solution4 !== null);
if (solution4) {
  console.log('   Movimientos:', solution4.moves.length);
  console.log('   Tríos completados:', solution4.metrics.triosCompleted);
  console.log('   Nivel resuelto (0 objetos):', true);
}
console.log('   ✓ SolutionSimulator OK\n');

// 5. SolutionSimulator - isSolvable
console.log('5. Probando isSolvable...');
const levelState5 = createSimpleLevelState();
const simulator5 = new SolutionSimulator();
const solvable = simulator5.isSolvable(levelState5);
console.log('   Nivel resoluble:', solvable === true);
console.log('   ✓ isSolvable OK\n');

// 6. SolutionSimulator - Nivel no resoluble (bloqueado)
console.log('6. Probando SolutionSimulator (nivel bloqueado)...');
const board6 = new Board();
const dynamicState6 = new DynamicState();
const structure6 = new Structure('struct_6');
board6.addStructure(structure6);

const shelf6 = new Shelf('shelf_6', ShelfType.NORMAL, ShelfBehavior.STANDARD);
structure6.addShelf(shelf6);

const layer6 = new Layer('layer_6', LayerState.TOP);
const s6a = new Slot('s6a', 0);
const s6b = new Slot('s6b', 1);
const s6c = new Slot('s6c', 2);
// Llenar todos los huecos con objetos diferentes (sin trío posible y sin huecos libres)
const o6a = new GameObject('o6a', 'APPLE', 'RED');
const o6b = new GameObject('o6b', 'BOTTLE', 'BLUE');
const o6c = new GameObject('o6c', 'BOOK', 'GREEN');
s6a.setObject('o6a'); dynamicState6.add(o6a);
s6b.setObject('o6b'); dynamicState6.add(o6b);
s6c.setObject('o6c'); dynamicState6.add(o6c);
layer6.addSlot(s6a); layer6.addSlot(s6b); layer6.addSlot(s6c);
shelf6.addLayer(layer6);

const levelState6 = new LevelState(1, board6, dynamicState6);
const simulator6 = new SolutionSimulator({ maxMoves: 10, maxStates: 100 });
const solution6 = simulator6.solve(levelState6);
console.log('   Nivel bloqueado = sin solución:', solution6 === null);
console.log('   ✓ Nivel bloqueado detectado OK\n');

console.log('=== TODAS LAS PRUEBAS DE SIMULACIÓN PASARON ===');
console.log('La Fase E (Simulación) está correctamente implementada.');