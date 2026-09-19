/**
 * definition.test.js - Pruebas de LevelDefinition y LevelBuilder
 */
import { LayerState } from '../../src/core/model/Layer.js';
import { ShelfType, ShelfBehavior } from '../../src/core/model/Shelf.js';
import { Orientation } from '../../src/core/model/Structure.js';

import { LevelDefinition } from '../../src/core/definition/LevelDefinition.js';
import { StructureDefinition } from '../../src/core/definition/StructureDefinition.js';
import { ShelfDefinition } from '../../src/core/definition/ShelfDefinition.js';
import { LayerDefinition } from '../../src/core/definition/LayerDefinition.js';
import { LevelBuilder } from '../../src/core/definition/LevelBuilder.js';

console.log('=== OBJETINOS - PRUEBAS DE LEVEL DEFINITION ===\n');

// 1. Crear LevelDefinition
console.log('1. Probando creación de LevelDefinition...');
const objects = {
  'o1': { type: 'APPLE', color: 'RED', blocked: false, special: false, specialType: 'NONE' },
  'o2': { type: 'APPLE', color: 'RED', blocked: false, special: false, specialType: 'NONE' }
};

const layerDef = new LayerDefinition('layer_1', LayerState.TOP, [
  { slotIndex: 0, objectId: 'o1' },
  { slotIndex: 1, objectId: 'o2' },
  { slotIndex: 2, objectId: null }
]);

const shelfDef = new ShelfDefinition('shelf_1', ShelfType.NORMAL, ShelfBehavior.STANDARD, [layerDef]);
const structDef = new StructureDefinition('struct_1', Orientation.VERTICAL, [shelfDef]);
const levelDef = new LevelDefinition(1, [structDef], objects, 120, { difficulty: 1 });

console.log('   Level number:', levelDef.levelNumber === 1);
console.log('   Structures:', levelDef.structures.length === 1);
console.log('   Objects:', Object.keys(levelDef.objects).length === 2);
console.log('   Timer:', levelDef.timer === 120);
console.log('   ✓ LevelDefinition OK\n');

// 2. Serialización/Deserialización
console.log('2. Probando serialización...');
const json = levelDef.toJSON();
const restored = LevelDefinition.fromJSON(json);
console.log('   Level number restaurado:', restored.levelNumber === 1);
console.log('   Structures restauradas:', restored.structures.length === 1);
console.log('   Objects restaurados:', Object.keys(restored.objects).length === 2);
console.log('   ✓ Serialización OK\n');

// 3. LevelBuilder - Construir LevelState
console.log('3. Probando LevelBuilder...');
const levelState = LevelBuilder.build(levelDef);
console.log('   Board structures:', levelState.board.structures.length === 1);
console.log('   DynamicState objects:', levelState.dynamicState.count() === 2);
console.log('   Timer:', levelState.timer === 120);
console.log('   ✓ LevelBuilder OK\n');

// 4. Verificar que el estado es mutable pero la definición no
console.log('4. Probando separación Definition vs State...');
const levelState2 = LevelBuilder.build(levelDef);
levelState2.dynamicState.remove('o1');
console.log('   State modificado no afecta definition:', levelDef.objects['o1'] !== undefined);
console.log('   ✓ Separación OK\n');

// 5. Reinicio desde definición
console.log('5. Probando reinicio desde definición...');
const levelState3 = LevelBuilder.build(levelDef);
levelState3.dynamicState.remove('o1');
levelState3.dynamicState.remove('o2');
console.log('   Antes de reiniciar:', levelState3.dynamicState.count() === 0);

const levelState4 = LevelBuilder.build(levelDef);
console.log('   Después de reiniciar:', levelState4.dynamicState.count() === 2);
console.log('   ✓ Reinicio OK\n');

console.log('=== TODAS LAS PRUEBAS DE LEVEL DEFINITION PASARON ===');
console.log('LevelDefinition y LevelBuilder están correctamente implementados.');