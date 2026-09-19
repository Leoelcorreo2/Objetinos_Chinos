/**
 * PowerUpSystem - Ejecuta las consecuencias de usar power-ups.
 * 
 * Martillo:
 * - El objeto SELECCIONADO debe estar en TOP, no bloqueado y no especial
 * - Se eliminan TODOS los objetos con la misma identidad (type+color)
 * - Los objetos eliminados pueden estar en CUALQUIER capa, estante o estantería
 * - Se aplican las consecuencias habituales (avance de capas, colapsos, victoria)
 * - NO se requiere mínimo de 3 objetos (elimina todos los que encuentre)
 */
import { PowerUpType, PowerUpConfig } from '../../core/model/PowerUp.js';
import { PowerUpRules } from '../../rules/powerups/PowerUpRules.js';
import { EventType } from '../../core/events/Events.js';
import { LayerRules } from '../../rules/LayerRules.js';
import { CollapseRules } from '../../rules/CollapseRules.js';
import { LayerState } from '../../core/model/Layer.js';

export class PowerUpSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  usePowerUp(levelState, powerUpType, targetObjectId, inventory, onTimePause, onTimeResume) {
    console.log('⚡ PowerUpSystem.usePowerUp:', powerUpType);
    
    const validation = PowerUpRules.canUsePowerUp(levelState, powerUpType, targetObjectId, inventory);
    if (!validation.valid) {
      console.log('⚡ Validación fallida:', validation.reason);
      return { success: false, reason: validation.reason };
    }

    inventory[powerUpType]--;

    switch (powerUpType) {
      case PowerUpType.HAMMER:
        return this._executeHammer(levelState, targetObjectId);
      
      case PowerUpType.ICE:
        return this._executeIce(levelState, onTimePause, onTimeResume);
      
      case PowerUpType.TIME_BOOST:
        return this._executeTimeBoost(levelState);
      
      default:
        return { success: false, reason: 'POWERUP_NOT_IMPLEMENTED' };
    }
  }

  /**
   * Martillo: Elimina TODOS los objetos iguales al seleccionado
   * 
   * El objeto SELECCIONADO ya fue validado por PowerUpRules:
   * - Está en capa TOP
   * - No está bloqueado
   * - No es especial
   * 
   * Los objetos ELIMINADOS:
   * - Todos los que coincidan en type+color
   * - En CUALQUIER capa (TOP, SHADED, INVISIBLE)
   * - En cualquier estante/estantería
   * - Independientemente de si están bloqueados o no
   * - Pueden ser 1, 2, 3, 4... objetos (no hay mínimo)
   */
  _executeHammer(levelState, targetObjectId) {
    const targetObj = levelState.dynamicState.get(targetObjectId);
    if (!targetObj) {
      return { success: false, reason: 'OBJECT_NOT_FOUND' };
    }

    const identityKey = `${targetObj.type}:${targetObj.color}`;
    const objectsToRemove = [];

    console.log('🔨 Buscando objetos con identidad:', identityKey);

    // Buscar en TODAS las estructuras, estantes y capas
    for (const structure of levelState.board.structures) {
      console.log('🔨 Estructura:', structure.id);
      for (const shelf of structure.shelves) {
        if (shelf.collapsed) continue;
        console.log('  🔨 Estante:', shelf.id, 'capas:', shelf.layers.length);
        for (const layer of shelf.layers) {
          // SIN FILTRO DE CAPA - buscar en TOP, SHADED e INVISIBLE
          console.log('    🔨 Capa:', layer.id, 'estado:', layer.state);
          for (const slot of layer.slots) {
            if (!slot.objectId) continue;
            const obj = levelState.dynamicState.get(slot.objectId);
            if (obj && `${obj.type}:${obj.color}` === identityKey) {
              objectsToRemove.push({ obj, slot, layer, shelf });
              console.log('       Encontrado:', obj.id, 'en capa', layer.state, 'bloqueado:', obj.blocked);
            }
          }
        }
      }
    }

    console.log(' Total objetos encontrados:', objectsToRemove.length);

    // ELIMINADO: Ya no se requiere mínimo de 3 objetos
    // if (objectsToRemove.length < 3) {
    //   return { success: false, reason: 'INSUFFICIENT_OBJECTS' };
    // }

    if (objectsToRemove.length === 0) {
      return { success: false, reason: 'NO_OBJECTS_FOUND' };
    }

    // Eliminar TODOS los objetos encontrados
    for (const { obj, slot } of objectsToRemove) {
      levelState.dynamicState.remove(obj.id);
      slot.clear();
      console.log(' Eliminado:', obj.id);
    }

    // Aplicar consecuencias: avance de capas y colapsos
    this._applyConsequences(levelState);

    // Emitir evento con información de todos los objetos eliminados
    this.eventBus.emit(EventType.POWERUP_HAMMER_USED, {
      objectType: targetObj.type,
      objectColor: targetObj.color,
      objectIds: objectsToRemove.map(t => t.obj.id),
      totalEliminated: objectsToRemove.length
    });

    this.eventBus.emit(EventType.POWERUP_USED, {
      powerUpType: PowerUpType.HAMMER,
      objectType: targetObj.type,
      objectColor: targetObj.color,
      totalEliminated: objectsToRemove.length
    });

    return { 
      success: true, 
      objectsEliminated: objectsToRemove.length,
      allEliminated: true 
    };
  }

  _executeIce(levelState, onTimePause, onTimeResume) {
    const duration = PowerUpConfig[PowerUpType.ICE].duration * 1000;

    if (onTimePause) {
      onTimePause();
    }

    this.eventBus.emit(EventType.POWERUP_ICE_USED, {
      duration: PowerUpConfig[PowerUpType.ICE].duration
    });

    this.eventBus.emit(EventType.POWERUP_USED, {
      powerUpType: PowerUpType.ICE,
      duration: PowerUpConfig[PowerUpType.ICE].duration
    });

    setTimeout(() => {
      if (onTimeResume) {
        onTimeResume();
      }
      this.eventBus.emit(EventType.TIMER_RESUMED, {});
    }, duration);

    this.eventBus.emit(EventType.TIMER_PAUSED, {
      duration: PowerUpConfig[PowerUpType.ICE].duration
    });

    return { success: true, paused: true, duration: PowerUpConfig[PowerUpType.ICE].duration };
  }

  _executeTimeBoost(levelState) {
    const timeAdded = PowerUpConfig[PowerUpType.TIME_BOOST].timeAdded;
    levelState.timer += timeAdded;

    this.eventBus.emit(EventType.POWERUP_TIME_BOOST_USED, {
      timeAdded: timeAdded,
      newTime: levelState.timer
    });

    this.eventBus.emit(EventType.POWERUP_USED, {
      powerUpType: PowerUpType.TIME_BOOST,
      timeAdded: timeAdded
    });

    return { success: true, timeAdded: timeAdded, newTime: levelState.timer };
  }

  _applyConsequences(levelState) {
    // Avance de capas
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (LayerRules.shouldAdvanceLayer(shelf)) {
          LayerRules.advanceLayers(shelf);
        }
      }
    }

    // Colapsos
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (CollapseRules.shouldCollapse(shelf)) {
          shelf.collapse();
        }
      }
    }
  }
}