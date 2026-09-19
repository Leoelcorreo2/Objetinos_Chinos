/**
 * VictorySystem - Verifica la condición de victoria.
 * Según Plan de Implementación §7.5
 */
import { VictoryRules } from '../rules/VictoryRules.js';
import { EventType } from '../core/events/Events.js';

export class VictorySystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(levelState) {
    if (VictoryRules.isVictory(levelState)) {
      this.eventBus.emit(EventType.LEVEL_COMPLETED, {});
      return true;
    }
    return false;
  }
}