/**
 * validator.test.js - Pruebas completas del LevelValidator
 * 
 * Según Modelo de Datos §71-82:
 * - Todo nivel debe pasar por el validador
 * - Comprueba: estructura, capas, objetos, bloqueados, tríos iniciales, solvabilidad
 * - Retorna ValidationResult con errors, warnings y metrics
 */
import { GameObject } from '../../src/core/model/GameObject.js';
import { Slot } from '../../src/core/model/Slot.js';
import { Layer, LayerState } from '../../src/core/model/Layer.js';
import { Shelf, ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Structure } from '../../src/core/model/Structure.js';
import { Board } from '../../src/core/model/Board.js';
import { DynamicState } from '../../src/core/state/DynamicState.js';
import { LevelState } from '../../src/core/state/LevelState.js';

import { LevelValidator, ValidationErrorCode } from '../../src/validation/validator/LevelValidator.js';

console.log('=== OBJETINOS - VALIDADOR DE NIVELES (PRUEBAS COMPLETAS) ===\n');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function createValidLevelState() {
  /**
   * Nivel válido y resoluble:
   * - 2 estructuras, cada una con 1 estante NORMAL
   * - Estructura 1: 1 capa TOP con 2 manzanas rojas + 1 hueco vacío
   * - Estructura 2: 1 capa TOP con 1 manzana roja + 2 huecos vacíos
   * 
   * Solución: mover la manzana de estructura 2 a estructura 1 → trío completado
   */
  const board = new Board();
  const dynamicState = new DynamicState();
  
  // Estructura 1
  const structure1 = new Structure('struct_1');
  board.addStructure(structure1);
  
  const shelf1 = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure1.addShelf(shelf1);
  
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
  
  // Estructura 2
  const structure2 = new Structure('struct_2');
  board.addStructure(structure2);
  
  const shelf2 = new Shelf('shelf_2', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure2.addShelf(shelf2);
  
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

function createLevelWithMultipleLayers() {
  /**
   * Nivel válido con múltiples capas:
   * - 1 estructura, 1 estante NORMAL
   * - Capa TOP: 2 manzanas rojas + 1 hueco vacío
   * - Capa SHADED: 1 manzana roja + 2 botellas azules
   * 
   * Solución: mover manzana de SHADED no es posible (no interactiva)
   * Solución real: mover manzana de otra estructura para completar trío en TOP
   */
  const board = new Board();
  const dynamicState = new DynamicState();
  
  const structure = new Structure('struct_1');
  board.addStructure(structure);
  
  const shelf = new Shelf('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure.addShelf(shelf);
  
  // Capa TOP
  const layerTop = new Layer('layer_top', LayerState.TOP);
  const s1 = new Slot('s1', 0);
  const s2 = new Slot('s2', 1);
  const s3 = new Slot('s3', 2);
  const o1 = new GameObject('o1', 'APPLE', 'RED');
  const o2 = new GameObject('o2', 'APPLE', 'RED');
  s1.setObject('o1'); dynamicState.add(o1);
  s2.setObject('o2'); dynamicState.add(o2);
  layerTop.addSlot(s1); layerTop.addSlot(s2); layerTop.addSlot(s3);
  shelf.addLayer(layerTop);
  
  // Capa SHADED
  const layerShaded = new Layer('layer_shaded', LayerState.SHADED);
  const s4 = new Slot('s4', 0);
  const s5 = new Slot('s5', 1);
  const s6 = new Slot('s6', 2);
  const o3 = new GameObject('o3', 'APPLE', 'RED');
  const o4 = new GameObject('o4', 'BOTTLE', 'BLUE');
  const o5 = new GameObject('o5', 'BOTTLE', 'BLUE');
  s4.setObject('o3'); dynamicState.add(o3);
  s5.setObject('o4'); dynamicState.add(o4);
  s6.setObject('o5'); dynamicState.add(o5);
  layerShaded.addSlot(s4); layerShaded.addSlot(s5); layerShaded.addSlot(s6);
  shelf.addLayer(layerShaded);
  
  // Segunda estructura para proporcionar la tercera manzana
  const structure2 = new Structure('struct_2');
  board.addStructure(structure2);
  
  const shelf2 = new Shelf('shelf_2', ShelfType.NORMAL, ShelfBehavior.STANDARD);
  structure2.addShelf(shelf2);
  
  const layer2 = new Layer('layer_2', LayerState.TOP);
  const s7 = new Slot('s7', 0);
  const s8 = new Slot('s8', 1);
  const s9 = new Slot('s9', 2);
  const o6 = new GameObject('o6', 'APPLE', 'RED');
  s7.setObject('o6'); dynamicState.add(o6);
  layer2.addSlot(s7); layer2.addSlot(s8); layer2.addSlot(s9);
  shelf2.addLayer(layer2);
  
  return new LevelState(1, board, dynamicState);
}

// ==========================================
// PRUEBAS
// ==========================================

const validator = new LevelValidator({ maxSimulationMoves: 50 });

// 1. Nivel válido simple
console.log('1. Probando nivel válido simple...');
const validLevel = createValidLevelState();
const result1 = validator.validate(validLevel);
console.log('   Es válido:', result1.valid);
console.log('   Errores:', result1.errors.length);
console.log('   Métricas:', result1.metrics);
if (!result1.valid) {
  console.log('   Errores detallados:', result1.errors);
}
console.log('   ✓ Nivel válido simple OK\n');

// 2. Nivel válido con múltiples capas
console.log('2. Probando nivel válido con múltiples capas...');
const multiLayerLevel = createLevelWithMultipleLayers();
const result2 = validator.validate(multiLayerLevel);
console.log('   Es válido:', result2.valid);
console.log('   Errores:', result2.errors.length);
console.log('   Métricas:', result2.metrics);
if (!result2.valid) {
  console.log('   Errores detallados:', result2.errors);
}
console.log('   ✓ Nivel válido con múltiples capas OK\n');

// 3. Nivel con trío inicial (inválido §76)
console.log('3. Probando trío inicial (debe ser inválido)...');
const levelWithTrio = createValidLevelState();
// Añadir tercera manzana a la capa TOP
const oTrio = new GameObject('o_trio', 'APPLE', 'RED');
levelWithTrio.dynamicState.add(oTrio);
levelWithTrio.board.structures[0].shelves[0].layers[0].slots[2].setObject('o_trio');

const result3 = validator.validate(levelWithTrio);
console.log('   Es válido:', result3.valid);
console.log('   Error detectado:', result3.errors.some(e => e.code === ValidationErrorCode.TRIO_ERROR));
if (result3.errors.length > 0) {
  console.log('   Errores:', result3.errors.map(e => e.message));
}
console.log('   ✓ Trío inicial detectado OK\n');

// 4. Nivel con capa SHADED vacía (inválido §21)
console.log('4. Probando capa no-TOP vacía (debe ser inválido)...');
const levelWithEmptyShaded = createLevelWithMultipleLayers();
// Vaciar la capa SHADED
levelWithEmptyShaded.board.structures[0].shelves[0].layers[1].slots.forEach(s => s.objectId = null);
// Eliminar objetos de la capa SHADED del dynamicState
levelWithEmptyShaded.dynamicState.remove('o3');
levelWithEmptyShaded.dynamicState.remove('o4');
levelWithEmptyShaded.dynamicState.remove('o5');

const result4 = validator.validate(levelWithEmptyShaded);
console.log('   Es válido:', result4.valid);
console.log('   Error detectado:', result4.errors.some(e => e.code === ValidationErrorCode.LAYER_ERROR));
if (result4.errors.length > 0) {
  console.log('   Errores:', result4.errors.map(e => e.message));
}
console.log('   ✓ Capa vacía detectada OK\n');

// 5. Nivel con objeto bloqueado y misma identidad en capa posterior (inválido §32)
console.log('5. Probando regla de objetos bloqueados (debe ser inválido)...');
const levelWithBlocked = createLevelWithMultipleLayers();
// Hacer o1 bloqueado (APPLE:RED en capa TOP)
levelWithBlocked.dynamicState.get('o1').blocked = true;
// o3 en capa SHADED tiene la misma identidad (APPLE:RED) que o1 bloqueado
// Esto ya está configurado en createLevelWithMultipleLayers, así que debería fallar

const result5 = validator.validate(levelWithBlocked);
console.log('   Es válido:', result5.valid);
console.log('   Error detectado:', result5.errors.some(e => e.code === ValidationErrorCode.BLOCKED_OBJECT_ERROR));
if (result5.errors.length > 0) {
  console.log('   Errores:', result5.errors.map(e => e.message));
}
console.log('   ✓ Regla de bloqueados detectada OK\n');

// 6. Nivel sin estructuras (inválido)
console.log('6. Probando nivel sin estructuras...');
const emptyLevel = new LevelState(1, new Board(), new DynamicState());
const result6 = validator.validate(emptyLevel);
console.log('   Es válido:', result6.valid);
console.log('   Error detectado:', result6.errors.some(e => e.code === ValidationErrorCode.STRUCTURE_ERROR));
if (result6.errors.length > 0) {
  console.log('   Errores:', result6.errors.map(e => e.message));
}
console.log('   ✓ Estructura vacía detectada OK\n');

// 7. Nivel con estante que mezcla tipos NORMAL/SPECIAL (inválido §9)
console.log('7. Probando mezcla de tipos de estante (debe ser inválido)...');
const board7 = new Board();
const dynamicState7 = new DynamicState();
const structure7 = new Structure('struct_7');
board7.addStructure(structure7);

const shelf7a = new Shelf('shelf_7a', ShelfType.NORMAL, ShelfBehavior.STANDARD);
const shelf7b = new Shelf('shelf_7b', ShelfType.SPECIAL, ShelfBehavior.STANDARD);
structure7.addShelf(shelf7a);
structure7.addShelf(shelf7b);

const layer7a = new Layer('layer_7a', LayerState.TOP);
const s7a1 = new Slot('s7a1', 0);
const s7a2 = new Slot('s7a2', 1);
const s7a3 = new Slot('s7a3', 2);
const o7a1 = new GameObject('o7a1', 'APPLE', 'RED');
s7a1.setObject('o7a1'); dynamicState7.add(o7a1);
layer7a.addSlot(s7a1); layer7a.addSlot(s7a2); layer7a.addSlot(s7a3);
shelf7a.addLayer(layer7a);

const layer7b = new Layer('layer_7b', LayerState.TOP);
const s7b1 = new Slot('s7b1', 0);
const o7b1 = new GameObject('o7b1', 'APPLE', 'RED');
s7b1.setObject('o7b1'); dynamicState7.add(o7b1);
layer7b.addSlot(s7b1);
shelf7b.addLayer(layer7b);

const level7 = new LevelState(1, board7, dynamicState7);
const result7 = validator.validate(level7);
console.log('   Es válido:', result7.valid);
console.log('   Error detectado:', result7.errors.some(e => e.code === ValidationErrorCode.STRUCTURE_ERROR));
if (result7.errors.length > 0) {
  console.log('   Errores:', result7.errors.map(e => e.message));
}
console.log('   ✓ Mezcla de tipos detectada OK\n');

// 8. Nivel con capacidad de slots incorrecta (inválido)
console.log('8. Probando capacidad de slots incorrecta (debe ser inválido)...');
const board8 = new Board();
const dynamicState8 = new DynamicState();
const structure8 = new Structure('struct_8');
board8.addStructure(structure8);

const shelf8 = new Shelf('shelf_8', ShelfType.SPECIAL, ShelfBehavior.STANDARD);
structure8.addShelf(shelf8);

const layer8 = new Layer('layer_8', LayerState.TOP);
// Estante SPECIAL debe tener 1 slot, pero le damos 3
const s8a = new Slot('s8a', 0);
const s8b = new Slot('s8b', 1);
const s8c = new Slot('s8c', 2);
const o8a = new GameObject('o8a', 'APPLE', 'RED');
s8a.setObject('o8a'); dynamicState8.add(o8a);
layer8.addSlot(s8a); layer8.addSlot(s8b); layer8.addSlot(s8c);
shelf8.addLayer(layer8);

const level8 = new LevelState(1, board8, dynamicState8);
const result8 = validator.validate(level8);
console.log('   Es válido:', result8.valid);
console.log('   Error detectado:', result8.errors.some(e => e.code === ValidationErrorCode.LAYER_ERROR));
if (result8.errors.length > 0) {
  console.log('   Errores:', result8.errors.map(e => e.message));
}
console.log('   ✓ Capacidad incorrecta detectada OK\n');

// 9. Nivel sin capa TOP (inválido)
console.log('9. Probando nivel sin capa TOP (debe ser inválido)...');
const board9 = new Board();
const dynamicState9 = new DynamicState();
const structure9 = new Structure('struct_9');
board9.addStructure(structure9);

const shelf9 = new Shelf('shelf_9', ShelfType.NORMAL, ShelfBehavior.STANDARD);
structure9.addShelf(shelf9);

// Solo capa SHADED, sin TOP
const layer9 = new Layer('layer_9', LayerState.SHADED);
const s9a = new Slot('s9a', 0);
const s9b = new Slot('s9b', 1);
const s9c = new Slot('s9c', 2);
const o9a = new GameObject('o9a', 'APPLE', 'RED');
s9a.setObject('o9a'); dynamicState9.add(o9a);
layer9.addSlot(s9a); layer9.addSlot(s9b); layer9.addSlot(s9c);
shelf9.addLayer(layer9);

const level9 = new LevelState(1, board9, dynamicState9);
const result9 = validator.validate(level9);
console.log('   Es válido:', result9.valid);
console.log('   Error detectado:', result9.errors.some(e => e.code === ValidationErrorCode.LAYER_ERROR));
if (result9.errors.length > 0) {
  console.log('   Errores:', result9.errors.map(e => e.message));
}
console.log('   ✓ Ausencia de capa TOP detectada OK\n');

// 10. Nivel con objeto especial bloqueado (inválido §34)
console.log('10. Probando objeto especial bloqueado (debe ser inválido)...');
const board10 = new Board();
const dynamicState10 = new DynamicState();
const structure10 = new Structure('struct_10');
board10.addStructure(structure10);

const shelf10 = new Shelf('shelf_10', ShelfType.NORMAL, ShelfBehavior.STANDARD);
structure10.addShelf(shelf10);

const layer10 = new Layer('layer_10', LayerState.TOP);
const s10a = new Slot('s10a', 0);
const s10b = new Slot('s10b', 1);
const s10c = new Slot('s10c', 2);
const o10a = new GameObject('o10a', 'APPLE', 'RED', false, true, 'REWARD');
o10a.blocked = true; // ¡Inválido! Los objetos de recompensa no pueden estar bloqueados
s10a.setObject('o10a'); dynamicState10.add(o10a);
layer10.addSlot(s10a); layer10.addSlot(s10b); layer10.addSlot(s10c);
shelf10.addLayer(layer10);

const level10 = new LevelState(1, board10, dynamicState10);
const result10 = validator.validate(level10);
console.log('   Es válido:', result10.valid);
console.log('   Error detectado:', result10.errors.some(e => e.code === ValidationErrorCode.OBJECT_ERROR));
if (result10.errors.length > 0) {
  console.log('   Errores:', result10.errors.map(e => e.message));
}
console.log('   ✓ Objeto especial bloqueado detectado OK\n');

// 11. Nivel con objeto referenciado pero inexistente (inválido)
console.log('11. Probando objeto referenciado inexistente (debe ser inválido)...');
const board11 = new Board();
const dynamicState11 = new DynamicState();
const structure11 = new Structure('struct_11');
board11.addStructure(structure11);

const shelf11 = new Shelf('shelf_11', ShelfType.NORMAL, ShelfBehavior.STANDARD);
structure11.addShelf(shelf11);

const layer11 = new Layer('layer_11', LayerState.TOP);
const s11a = new Slot('s11a', 0);
const s11b = new Slot('s11b', 1);
const s11c = new Slot('s11c', 2);
s11a.setObject('o_nonexistent'); // ¡Referencia a objeto que no existe!
layer11.addSlot(s11a); layer11.addSlot(s11b); layer11.addSlot(s11c);
shelf11.addLayer(layer11);

const level11 = new LevelState(1, board11, dynamicState11);
const result11 = validator.validate(level11);
console.log('   Es válido:', result11.valid);
console.log('   Error detectado:', result11.errors.some(e => e.code === ValidationErrorCode.OBJECT_ERROR));
if (result11.errors.length > 0) {
  console.log('   Errores:', result11.errors.map(e => e.message));
}
console.log('   ✓ Objeto inexistente detectado OK\n');

// 12. Nivel no resoluble (inválido §78)
console.log('12. Probando nivel no resoluble (debe ser inválido)...');
const board12 = new Board();
const dynamicState12 = new DynamicState();
const structure12 = new Structure('struct_12');
board12.addStructure(structure12);

const shelf12 = new Shelf('shelf_12', ShelfType.NORMAL, ShelfBehavior.STANDARD);
structure12.addShelf(shelf12);

const layer12 = new Layer('layer_12', LayerState.TOP);
const s12a = new Slot('s12a', 0);
const s12b = new Slot('s12b', 1);
const s12c = new Slot('s12c', 2);
// Llenar todos los huecos con objetos diferentes (sin trío posible y sin huecos libres)
const o12a = new GameObject('o12a', 'APPLE', 'RED');
const o12b = new GameObject('o12b', 'BOTTLE', 'BLUE');
const o12c = new GameObject('o12c', 'BOOK', 'GREEN');
s12a.setObject('o12a'); dynamicState12.add(o12a);
s12b.setObject('o12b'); dynamicState12.add(o12b);
s12c.setObject('o12c'); dynamicState12.add(o12c);
layer12.addSlot(s12a); layer12.addSlot(s12b); layer12.addSlot(s12c);
shelf12.addLayer(layer12);

const level12 = new LevelState(1, board12, dynamicState12);
const result12 = validator.validate(level12);
console.log('   Es válido:', result12.valid);
console.log('   Error detectado:', result12.errors.some(e => e.code === ValidationErrorCode.UNSOLVABLE_ERROR));
if (result12.errors.length > 0) {
  console.log('   Errores:', result12.errors.map(e => e.message));
}
console.log('   ✓ Nivel no resoluble detectado OK\n');

// ==========================================
// RESUMEN
// ==========================================

console.log('=== RESUMEN DE PRUEBAS ===\n');
const allResults = [
  { test: 'Nivel válido simple', result: result1, expected: true },
  { test: 'Nivel válido con múltiples capas', result: result2, expected: true },
  { test: 'Trío inicial', result: result3, expected: false },
  { test: 'Capa no-TOP vacía', result: result4, expected: false },
  { test: 'Objeto bloqueado con identidad duplicada', result: result5, expected: false },
  { test: 'Sin estructuras', result: result6, expected: false },
  { test: 'Mezcla de tipos de estante', result: result7, expected: false },
  { test: 'Capacidad de slots incorrecta', result: result8, expected: false },
  { test: 'Sin capa TOP', result: result9, expected: false },
  { test: 'Objeto especial bloqueado', result: result10, expected: false },
  { test: 'Objeto referenciado inexistente', result: result11, expected: false },
  { test: 'Nivel no resoluble', result: result12, expected: false }
];

let passed = 0;
let failed = 0;

allResults.forEach(({ test, result, expected }) => {
  const status = result.valid === expected ? '✓' : '✗';
  console.log(`${status} ${test}: ${result.valid === expected ? 'PASÓ' : 'FALLÓ'}`);
  if (result.valid === expected) {
    passed++;
  } else {
    failed++;
    console.log(`   Esperado: ${expected}, Obtenido: ${result.valid}`);
  }
});

console.log(`\nTotal: ${passed} pasaron, ${failed} fallaron`);

if (failed === 0) {
  console.log('\n=== TODAS LAS PRUEBAS DEL VALIDADOR PASARON ===');
  console.log('El LevelValidator está correctamente implementado.');
} else {
  console.log('\n=== ALGUNAS PRUEBAS FALLARON ===');
  console.log('Revisar los errores detallados arriba.');
}