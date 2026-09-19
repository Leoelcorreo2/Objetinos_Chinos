/**
 * Tema: Peluches 02
 * Objetos: 15 animales de peluche numerados del 01 al 15
 * Color fijo: 01
 * Archivos: 01.png, 02.png, ..., 15.png
 */
import { ObjectTheme } from '../ObjectTheme.js';

export const Peluches02 = new ObjectTheme(
  'peluches_02',
  'Peluches 02',
  [
    // Cerdo
    { type: '01', color: '01', glyph: '🐷' },
    // Cabra
    { type: '02', color: '01', glyph: '🐐' },
    // Burro
    { type: '03', color: '01', glyph: '' },
    // Caballo
    { type: '04', color: '01', glyph: '🐴' },
    // Llama
    { type: '05', color: '01', glyph: '🦙' },
    // Alpaca
    { type: '06', color: '01', glyph: '🦙' },
    // Gallina
    { type: '07', color: '01', glyph: '🐔' },
    // Pato
    { type: '08', color: '01', glyph: '🦆' },
    // Pulpo
    { type: '09', color: '01', glyph: '🐙' },
    // Tiburón
    { type: '10', color: '01', glyph: '' },
    // Tortuga
    { type: '11', color: '01', glyph: '🐢' },
    // Delfín
    { type: '12', color: '01', glyph: '🐬' },
    // Orca
    { type: '13', color: '01', glyph: '🐋' },
    // Narval
    { type: '14', color: '01', glyph: '🦄' },
    // Morsa
    { type: '15', color: '01', glyph: '' }
  ],
  {
    category: 'peluches',
    difficulty: 2,
    description: 'Peluches de animales variados (01-15)'
  }
);