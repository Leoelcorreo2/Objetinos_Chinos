/**
 * SaveSlot - Representa un slot de guardado.
 */
export class SaveSlot {
  constructor(slotIndex, data, version = '1.0.0', timestamp = Date.now()) {
    this.slotIndex = slotIndex;
    this.data = data;
    this.version = version;
    this.timestamp = timestamp;
  }

  isEmpty() {
    return this.data === null || this.data === undefined;
  }

  getFormattedDate() {
    const date = new Date(this.timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toJSON() {
    return {
      slotIndex: this.slotIndex,
      data: this.data,
      version: this.version,
      timestamp: this.timestamp
    };
  }

  static fromJSON(json) {
    return new SaveSlot(json.slotIndex, json.data, json.version, json.timestamp);
  }
}