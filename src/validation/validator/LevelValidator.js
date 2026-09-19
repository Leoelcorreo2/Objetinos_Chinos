/**
 * LevelValidator - Valida que un nivel cumple todas las reglas estructurales y de juego.
 * 
 * Según Modelo de Datos §71-82:
 * - Todo nivel debe pasar por el validador (generados o manuales)
 * - Comprueba: estructura, capas, objetos, bloqueados, tríos iniciales, solvabilidad
 * - Retorna ValidationResult con errors, warnings y metrics
 */
import { LayerState } from '../../core/model/Layer.js';
import { ShelfType } from '../../core/model/Shelf.js';
import { TrioRules } from '../../rules/TrioRules.js';
import { SolutionSimulator } from '../../simulation/simulator/SolutionSimulator.js';

export const ValidationErrorCode = {
  STRUCTURE_ERROR: 'STRUCTURE_ERROR',
  LAYER_ERROR: 'LAYER_ERROR',
  OBJECT_ERROR: 'OBJECT_ERROR',
  TRIO_ERROR: 'TRIO_ERROR',
  BLOCKED_OBJECT_ERROR: 'BLOCKED_OBJECT_ERROR',
  UNSOLVABLE_ERROR: 'UNSOLVABLE_ERROR',
  VICTORY_ERROR: 'VICTORY_ERROR'
};

export class LevelValidator {
  /**
   * @param {Object} options
   * @param {number} options.maxSimulationMoves - Límite para el simulador de validación
   */
  constructor(options = {}) {
    this.maxSimulationMoves = options.maxSimulationMoves || 200;
  }

  /**
   * Valida un LevelState inicial
   * @param {LevelState} levelState 
   * @returns {ValidationResult}
   */
  validate(levelState) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      metrics: null
    };

    const addError = (code, message) => {
      result.valid = false;
      result.errors.push({ code, message });
    };

    // 1. Validación Estructural (§72)
    this._validateStructures(levelState, addError);

    // 2. Validación de Capas (§73, §21)
    this._validateLayers(levelState, addError);

    // 3. Validación de Objetos y Regla de Bloqueados (§74, §75, §32)
    this._validateObjectsAndBlocked(levelState, addError);

    // 4. Validación de Tríos Iniciales (§76, §19.1)
    this._validateInitialTrios(levelState, addError);

    // 5. Validación de Solvabilidad (§77, §78, §80)
    // Solo se ejecuta si no hay errores estructurales previos
    if (result.valid) {
      this._validateSolvability(levelState, result, addError);
    }

    return result;
  }

  _validateStructures(levelState, addError) {
    if (!levelState.board.structures || levelState.board.structures.length === 0) {
      addError(ValidationErrorCode.STRUCTURE_ERROR, 'El tablero debe tener al menos una estructura');
      return;
    }

    for (const structure of levelState.board.structures) {
      if (!structure.shelves || structure.shelves.length === 0) {
        addError(ValidationErrorCode.STRUCTURE_ERROR, `Estructura ${structure.id} sin estantes`);
        continue;
      }

      // Verificar homogeneidad de tipo de estante (§9)
      const types = new Set(structure.shelves.map(s => s.type));
      if (types.size > 1) {
        addError(ValidationErrorCode.STRUCTURE_ERROR, 
          `Estructura ${structure.id} mezcla tipos de estante (NORMAL/SPECIAL)`);
      }

      for (const shelf of structure.shelves) {
        if (shelf.type !== ShelfType.NORMAL && shelf.type !== ShelfType.SPECIAL) {
          addError(ValidationErrorCode.STRUCTURE_ERROR, 
            `Estante ${shelf.id} tiene tipo inválido: ${shelf.type}`);
        }
        if (shelf.layers.length === 0) {
          addError(ValidationErrorCode.STRUCTURE_ERROR, 
            `Estante ${shelf.id} no tiene capas`);
        }
      }
    }
  }

  _validateLayers(levelState, addError) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        let foundTop = false;
        
        for (let i = 0; i < shelf.layers.length; i++) {
          const layer = shelf.layers[i];
          
          // Verificar estado válido
          if (![LayerState.TOP, LayerState.SHADED, LayerState.INVISIBLE].includes(layer.state)) {
            addError(ValidationErrorCode.LAYER_ERROR, 
              `Capa ${layer.id} tiene estado inválido: ${layer.state}`);
          }

          if (layer.state === LayerState.TOP) {
            foundTop = true;
          }

          // §21: Capas no-TOP no pueden comenzar completamente vacías
          if (layer.state !== LayerState.TOP && layer.allEmpty()) {
            addError(ValidationErrorCode.LAYER_ERROR, 
              `Capa no-TOP ${layer.id} comienza completamente vacía`);
          }

          // Verificar capacidad de slots según tipo de estante
          const expectedCapacity = shelf.type === ShelfType.NORMAL ? 3 : 1;
          if (layer.slots.length !== expectedCapacity) {
            addError(ValidationErrorCode.LAYER_ERROR, 
              `Capa ${layer.id} tiene ${layer.slots.length} slots, se esperaban ${expectedCapacity} para estante ${shelf.type}`);
          }
        }

        // Debe haber al menos una capa TOP
        if (!foundTop) {
          addError(ValidationErrorCode.LAYER_ERROR, 
            `Estante ${shelf.id} no tiene capa TOP`);
        }
      }
    }
  }

  _validateObjectsAndBlocked(levelState, addError) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        // Rastrear identidades de objetos bloqueados vistos en capas anteriores
        const blockedIdentities = new Set();

        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            if (!slot.objectId) continue;
            
            const obj = levelState.dynamicState.get(slot.objectId);
            if (!obj) {
              addError(ValidationErrorCode.OBJECT_ERROR, 
                `Slot ${slot.id} referencia objeto inexistente: ${slot.objectId}`);
              continue;
            }

            // §34: Objetos especiales de recompensa no pueden estar bloqueados
            if (obj.special && obj.specialType === 'REWARD' && obj.blocked) {
              addError(ValidationErrorCode.OBJECT_ERROR, 
                `Objeto especial de recompensa ${obj.id} no puede estar bloqueado`);
            }

            // §32, §75: Regla de objetos bloqueados
            const identityKey = `${obj.type}:${obj.color}`;
            
            if (obj.blocked) {
              // Si este objeto está bloqueado, su identidad no puede aparecer en capas posteriores
              // (Lo comprobamos mirando si ya vimos esta identidad bloqueada en una capa anterior)
              // Nota: La regla dice "si una capa contiene un objeto bloqueado... esa identidad 
              // no puede aparecer en capas posteriores". 
              // Implementación: registramos las identidades bloqueadas y verificamos en capas posteriores.
            }

            // Verificar si este objeto tiene una identidad que fue marcada como bloqueada en una capa anterior
            if (blockedIdentities.has(identityKey)) {
              addError(ValidationErrorCode.BLOCKED_OBJECT_ERROR, 
                `Objeto ${obj.id} (${identityKey}) aparece en capa posterior a un objeto bloqueado con la misma identidad en estante ${shelf.id}`);
            }

            // Registrar esta identidad si está bloqueada para verificar capas posteriores
            if (obj.blocked) {
              blockedIdentities.add(identityKey);
            }
          }
        }
      }
    }
  }

  _validateInitialTrios(levelState, addError) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          if (layer.state !== LayerState.TOP) continue;

          // §76: No puede existir un trío completo en una capa TOP al inicio
          const trio = TrioRules.detectTrio(shelf, layer, levelState.dynamicState);
          if (trio) {
            addError(ValidationErrorCode.TRIO_ERROR, 
              `Capa TOP ${layer.id} en estante ${shelf.id} comienza con un trío completo formado`);
          }
        }
      }
    }
  }

  _validateSolvability(levelState, result, addError) {
    const simulator = new SolutionSimulator({
      maxMoves: this.maxSimulationMoves,
      maxStates: 10000
    });

    const isSolvable = simulator.isSolvable(levelState);
    
    if (!isSolvable) {
      addError(ValidationErrorCode.UNSOLVABLE_ERROR, 
        'El nivel no es resoluble mediante movimientos válidos sin power-ups');
    } else {
      // Calcular métricas básicas usando el simulador
      const solution = simulator.solve(levelState);
      if (solution) {
        result.metrics = {
          minimumMoves: solution.metrics.totalMoves,
          triosCompleted: solution.metrics.triosCompleted
        };
      }
    }
  }
}