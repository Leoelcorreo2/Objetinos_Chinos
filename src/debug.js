/**
 * debug.js - Herramienta de diagnóstico para identificar problemas de renderizado
 */
import { LevelGenerator } from './generation/generator/LevelGenerator.js';
import { LevelConfiguration } from './generation/configuration/LevelConfiguration.js';
import { LevelBuilder } from './core/definition/LevelBuilder.js';

export class DebugTool {
  static runFullDiagnostic() {
    console.log('=== DIAGNÓSTICO COMPLETO DE OBJETINOS ===\n');

    // 1. Verificar generación de nivel
    console.log('1. Generando nivel de prueba...');
    try {
      const levelDef = LevelGenerator.generateCompleteLevel(1);
      console.log('   ✅ LevelDefinition generada');
      console.log('    Estructuras:', levelDef.structures.length);
      console.log('   📦 Objetos:', Object.keys(levelDef.objects).length);
      console.log('   📦 Timer:', levelDef.timer);
      
      // Inspeccionar primera estructura
      if (levelDef.structures.length > 0) {
        const struct = levelDef.structures[0];
        console.log('   🏗️ Estructura 1:', struct.id);
        console.log('   ️ Estantes:', struct.shelves.length);
        
        if (struct.shelves.length > 0) {
          const shelf = struct.shelves[0];
          console.log('   📚 Estante 1:', shelf.id);
          console.log('   📚 Capas:', shelf.layers.length);
          
          if (shelf.layers.length > 0) {
            const layer = shelf.layers[0];
            console.log('    Capa 1:', layer.id, '- Estado:', layer.state);
            console.log('    Slots:', layer.slots.length);
            console.log('   📄 Slots con objetos:', layer.slots.filter(s => s.objectId).length);
          }
        }
      }
      
      // 2. Construir LevelState
      console.log('\n2. Construyendo LevelState...');
      const levelState = LevelBuilder.build(levelDef);
      console.log('   ✅ LevelState construido');
      console.log('    Board:', levelState.board);
      console.log('   🎯 Structures:', levelState.board.structures.length);
      console.log('    DynamicState objects:', levelState.dynamicState.count());
      
      // 3. Verificar renderer
      console.log('\n3. Verificando renderer...');
      const boardElement = document.getElementById('board');
      console.log('    boardElement:', boardElement);
      console.log('   🎨 boardElement children:', boardElement?.children.length);
      
      return {
        levelDef,
        levelState,
        boardElement
      };
    } catch (error) {
      console.error('   ❌ Error en diagnóstico:', error);
      return null;
    }
  }
}

// Ejecutar automáticamente si se carga como módulo
DebugTool.runFullDiagnostic();