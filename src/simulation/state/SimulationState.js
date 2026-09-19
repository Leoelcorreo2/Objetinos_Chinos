/**
 * SimulationState - Estado aislado para simulación.
 * 
 * Según Plan de Implementación §14.1:
 * - Ejecuta soluciones sobre un estado aislado
 * - NUNCA modifica el nivel real del jugador
 * - Debe reproducir las mismas reglas del juego
 * 
 * Según Modelo de Datos §69:
 * - Separación LogicalState / PhysicalState
 * - El hash no debe depender de coordenadas físicas
 */
import { Board } from '../../core/model/Board.js';
import { Structure } from '../../core/model/Structure.js';
import { Shelf } from '../../core/model/Shelf.js';
import { Layer } from '../../core/model/Layer.js';
import { Slot } from '../../core/model/Slot.js';
import { DynamicState } from '../../core/state/DynamicState.js';
import { GameObject } from '../../core/model/GameObject.js';

export class SimulationState {
  /**
   * @param {LevelState} levelState - Estado original a clonar
   */
  constructor(levelState) {
    // Clonar el tablero completo
    this.board = this._cloneBoard(levelState.board);
    // Clonar el estado dinámico
    this.dynamicState = this._cloneDynamicState(levelState.dynamicState);
    // Contador de movimientos realizados
    this.moveCount = 0;
  }

  /**
   * Clona el tablero preservando toda la jerarquía
   */
  _cloneBoard(originalBoard) {
    const newBoard = new Board();
    
    for (const structure of originalBoard.structures) {
      const newStructure = new Structure(structure.id, structure.orientation);
      newStructure.position = { ...structure.position };
      newStructure.movement = { ...structure.movement };
      
      for (const shelf of structure.shelves) {
        const newShelf = new Shelf(shelf.id, shelf.type, shelf.behavior);
        newShelf.collapsed = shelf.collapsed;
        
        for (const layer of shelf.layers) {
          const newLayer = new Layer(layer.id, layer.state);
          
          for (const slot of layer.slots) {
            const newSlot = new Slot(slot.id, slot.index);
            newSlot.objectId = slot.objectId;
            newLayer.addSlot(newSlot);
          }
          
          newShelf.addLayer(newLayer);
        }
        
        newStructure.addShelf(newShelf);
      }
      
      newBoard.addStructure(newStructure);
    }
    
    return newBoard;
  }

  /**
   * Clona el estado dinámico (objetos)
   */
  _cloneDynamicState(originalDynamicState) {
    const newDynamicState = new DynamicState();
    
    for (const obj of originalDynamicState.getAll()) {
      const newObj = new GameObject(
        obj.id,
        obj.type,
        obj.color,
        obj.blocked,
        obj.special,
        obj.specialType
      );
      newDynamicState.add(newObj);
    }
    
    return newDynamicState;
  }

  /**
   * Obtiene el número de objetos restantes
   */
  getRemainingObjects() {
    return this.dynamicState.count();
  }

  /**
   * Serialización para hashing
   */
  toLogicalSnapshot() {
    const snapshot = {
      objects: {},
      slots: {}
    };
    
    // Mapeo objeto -> identidad
    for (const obj of this.dynamicState.getAll()) {
      snapshot.objects[obj.id] = {
        type: obj.type,
        color: obj.color
      };
    }
    
    // Mapeo slot -> objeto
    for (const structure of this.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            snapshot.slots[slot.id] = slot.objectId;
          }
        }
      }
    }
    
    return snapshot;
  }
}