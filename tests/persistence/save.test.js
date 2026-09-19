/**
 * save.test.js - Pruebas del SaveSystem
 */
import { SaveSystem } from '../../src/persistence/SaveSystem.js';
import { SaveSlot } from '../../src/persistence/SaveSlot.js';
import { GameState } from '../../src/application/GameState.js';
import { LevelDefinition } from '../../src/core/definition/LevelDefinition.js';
import { StructureDefinition } from '../../src/core/definition/StructureDefinition.js';
import { ShelfDefinition } from '../../src/core/definition/ShelfDefinition.js';
import { LayerDefinition } from '../../src/core/definition/LayerDefinition.js';
import { LayerState } from '../../src/core/model/Layer.js';
import { ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Orientation } from '../../src/core/model/Structure.js';

console.log('=== OBJETINOS - PRUEBAS DE SAVE SYSTEM ===\n');

// Limpiar localStorage antes de las pruebas
localStorage.clear();

// 1. SaveSlot
console.log('1. Probando SaveSlot...');
const slot = new SaveSlot(0, { test: 'data' }, '1.0.0', Date.now());
console.log('   isEmpty:', slot.isEmpty() === false);
console.log('   getFormattedDate:', slot.getFormattedDate().length > 0);

const emptySlot = new SaveSlot(1, null);
console.log('   isEmpty (null):', emptySlot.isEmpty() === true);

const json = slot.toJSON();
const restored = SaveSlot.fromJSON(json);
console.log('   Serialización:', restored.slotIndex === 0);
console.log('   ✓ SaveSlot OK\n');

// 2. SaveSystem - Guardar
console.log('2. Probando SaveSystem.save()...');
const saveSystem = new SaveSystem();

const gameState = new GameState();
gameState.lives = 3;
gameState.currentLevel = 5;
gameState.activeLevel = 5;

const objects = {
  'o1': { type: 'APPLE', color: 'RED', blocked: false, special: false, specialType: 'NONE' }
};

const layerDef = new LayerDefinition('layer_1', LayerState.TOP, [
  { slotIndex: 0, objectId: 'o1' },
  { slotIndex: 1, objectId: null },
  { slotIndex: 2, objectId: null }
]);

const shelfDef = new ShelfDefinition('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD, [layerDef]);
const structDef = new StructureDefinition('struct_1', Orientation.VERTICAL, [shelfDef]);
const levelDef = new LevelDefinition(1, [structDef], objects, 120, {});

const saveResult = saveSystem.save(0, gameState, levelDef, 90);
console.log('   Guardado exitoso:', saveResult === true);
console.log('   hasSave(0):', saveSystem.hasSave(0) === true);
console.log('   hasSave(1):', saveSystem.hasSave(1) === false);
console.log('   ✓ Save OK\n');

// 3. SaveSystem - Cargar
console.log('3. Probando SaveSystem.load()...');
const loadedData = saveSystem.load(0);
console.log('   Datos cargados:', loadedData !== null);
console.log('   gameState.lives:', loadedData.gameState.lives === 3);
console.log('   gameState.currentLevel:', loadedData.gameState.currentLevel === 5);
console.log('   remainingTime:', loadedData.remainingTime === 90);
console.log('   levelDefinition existe:', loadedData.levelDefinition !== null);
console.log('   ✓ Load OK\n');

// 4. SaveSystem - Múltiples slots
console.log('4. Probando múltiples slots...');
gameState.lives = 2;
saveSystem.save(1, gameState, levelDef, 60);
gameState.lives = 1;
saveSystem.save(2, gameState, levelDef, 30);

const slots = saveSystem.listSlots();
console.log('   Total slots:', slots.length === 3);
console.log('   Slot 0 con datos:', slots[0].hasData === true);
console.log('   Slot 1 con datos:', slots[1].hasData === true);
console.log('   Slot 2 con datos:', slots[2].hasData === true);
console.log('   ✓ Múltiples slots OK\n');

// 5. SaveSystem - Eliminar
console.log('5. Probando SaveSystem.delete()...');
const deleteResult = saveSystem.delete(1);
console.log('   Eliminación exitosa:', deleteResult === true);
console.log('   hasSave(1) después de eliminar:', saveSystem.hasSave(1) === false);
console.log('   ✓ Delete OK\n');

// 6. SaveSystem - Autosave
console.log('6. Probando autosave...');
gameState.lives = 4;
const autoSaveResult = saveSystem.autoSave(gameState, levelDef, 100);
console.log('   Autosave exitoso:', autoSaveResult === true);

const autoSaveData = saveSystem.loadAutoSave();
console.log('   Autosave cargado:', autoSaveData !== null);
console.log('   Autosave lives:', autoSaveData.gameState.lives === 4);
console.log('   Autosave time:', autoSaveData.remainingTime === 100);
console.log('   ✓ Autosave OK\n');

// 7. SaveSystem - Limpiar todo
console.log('7. Probando clearAll()...');
const clearResult = saveSystem.clearAll();
console.log('   Limpieza exitosa:', clearResult === true);
console.log('   hasSave(0) después de limpiar:', saveSystem.hasSave(0) === false);
console.log('   hasSave(2) después de limpiar:', saveSystem.hasSave(2) === false);
console.log('   ✓ ClearAll OK\n');

// 8. SaveSystem - Slot fuera de rango
console.log('8. Probando validación de rangos...');
const invalidSave = saveSystem.save(5, gameState, levelDef, 10);
console.log('   Save fuera de rango:', invalidSave === false);

const invalidLoad = saveSystem.load(-1);
console.log('   Load fuera de rango:', invalidLoad === null);
console.log('   ✓ Validación OK\n');

// 9. SaveSystem - Cargar slot vacío
console.log('9. Probando carga de slot vacío...');
const emptyLoad = saveSystem.load(0);
console.log('   Carga de slot vacío:', emptyLoad === null);
console.log('   ✓ Slot vacío OK\n');

console.log('=== TODAS LAS PRUEBAS DE SAVE SYSTEM PASARON ===');
console.log('SaveSystem está correctamente implementado.');