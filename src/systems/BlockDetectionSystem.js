/**
 * BlockDetectionSystem - Verifica si la partida está bloqueada.
 * Según Plan de Implementación §7.6
 */
import { BlockDetectionRules } from '../rules/BlockDetectionRules.js';
import { EventType } from '../core/events/Events.js';

export class BlockDetectionSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(levelState) {
    if (BlockDetectionRules.isBlocked(levelState)) {
      this.eventBus.emit(EventType.BLOCK_DETECTED, {});
      return true;
    }
    return false;
  }
}