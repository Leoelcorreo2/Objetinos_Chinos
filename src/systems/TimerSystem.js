/**
 * TimerSystem - Gestiona el temporizador del nivel.
 * Según Modelo de Datos §17, §45, §94
 */
import { EventType } from '../core/events/Events.js';
import { GamePhase } from '../core/state/GamePhase.js';

export class TimerSystem {
  constructor(eventBus, gameState) {
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.intervalId = null;
    this.currentTime = 0;
    this.isPaused = false;
  }

  /**
   * Inicia el temporizador con el tiempo del nivel.
   * @param {Object} levelState - Estado del nivel con el tiempo inicial
   */
  start(levelState) {
    console.log('⏰ [TimerSystem] start llamado');
    console.log('   levelState.timer:', levelState?.timer);
    
    // Detener cualquier timer anterior para evitar múltiples intervalos
    this.stop();
    
    // CRÍTICO: Usar el tiempo del levelState, no un valor por defecto
    this.currentTime = levelState?.timer || 60;
    this.isPaused = false;
    
    console.log('   currentTime establecido a:', this.currentTime);
    
    // Emitir tick inicial para actualizar la UI inmediatamente
    this.eventBus.emit(EventType.TIMER_TICK, { time: this.currentTime });
    
    // Iniciar intervalo de 1 segundo
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.gameState.gamePhase === GamePhase.READY) {
        this.currentTime--;
        this.eventBus.emit(EventType.TIMER_TICK, { time: this.currentTime });
        
        if (this.currentTime <= 0) {
          console.log('⏰ [TimerSystem] Tiempo agotado');
          this.stop();
          this.eventBus.emit(EventType.TIME_EXPIRED, {});
        }
      }
    }, 1000);
    
    console.log('✅ [TimerSystem] Timer iniciado correctamente');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pause() {
    this.isPaused = true;
    this.eventBus.emit(EventType.TIMER_PAUSED, {});
  }

  resume() {
    this.isPaused = false;
    this.eventBus.emit(EventType.TIMER_RESUMED, {});
  }

  addTime(seconds) {
    this.currentTime += seconds;
    this.eventBus.emit(EventType.TIMER_TICK, { time: this.currentTime });
  }

  getCurrentTime() {
    return this.currentTime;
  }
}