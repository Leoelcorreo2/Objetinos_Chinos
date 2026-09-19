/**
 * LevelBuilder - Construye un LevelState a partir de un LevelDefinition.
 * 
 * Según Modelo de Datos §44, §47-49:
 * - Transforma la definición (plantilla inmutable) en estado vivo (mutable)
 * - Permite reiniciar niveles desde cero sin contaminar el estado anterior
 */
import { Board } from '../model/Board.js';
import { Structure } from '../model/Structure.js';
import { Shelf } from '../model/Shelf.js';
import { Layer } from '../model/Layer.js';
import { Slot } from '../model/Slot.js';
import { GameObject } from '../model/GameObject.js';
import { DynamicState } from '../state/DynamicState.js';
import { LevelState } from '../state/LevelState.js';

export class LevelBuilder {
  static build(definition) {
    console.log('🔨 LevelBuilder.build:', definition);
    
    const board = new Board();
    const dynamicState = new DynamicState();

    // 1. Crear objetos en DynamicState
    for (const [objectId, objData] of Object.entries(definition.objects)) {
      const obj = new GameObject(
        objectId,
        objData.type,
        objData.color,
        objData.blocked || false,
        objData.special || false,
        objData.specialType || 'NONE'
      );
      dynamicState.add(obj);
    }

    // 2. Construir estructuras, estantes, capas y slots
    for (const structDef of definition.structures) {
      const structure = new Structure(structDef.id, structDef.orientation);
      structure.position = { x: 0, y: 0, z: 0 };
      structure.movement = { ...structDef.movement };

      for (const shelfDef of structDef.shelves) {
        const shelf = new Shelf(shelfDef.id, shelfDef.type, shelfDef.behavior);

        for (const layerDef of shelfDef.layers) {
          const layer = new Layer(layerDef.id, layerDef.state);

          for (const slotDef of layerDef.slots) {
            const slot = new Slot(`slot_${layerDef.id}_${slotDef.slotIndex}`, slotDef.slotIndex);
            
            if (slotDef.objectId && definition.objects[slotDef.objectId]) {
              slot.setObject(slotDef.objectId);
            }

            layer.addSlot(slot);
          }

          shelf.addLayer(layer);
        }

        structure.addShelf(shelf);
      }

      board.addStructure(structure);
    }

    const levelState = new LevelState(definition.levelNumber, board, dynamicState);
    levelState.timer = definition.timer;
    levelState.configuration = definition.configuration;

    console.log('🔨 LevelState construido:', levelState);
    console.log('🔨 Structures:', levelState.board.structures.length);
    console.log('🔨 Objects:', levelState.dynamicState.count());

    return levelState;
  }
}