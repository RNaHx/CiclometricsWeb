/**
 * passwordService.js
 * Servicio de hashing criptográfico seguro para contraseñas de CicloMetrics Web.
 * 
 * Implementación basada en OWASP Password Storage y cumplimiento de la Ley N° 19.628 / 21.719
 * (Protección de Datos Personales en Chile).
 * Utiliza scrypt con salt criptográfico de 16 bytes y comparación inmune a timing attacks.
 */

const crypto = require('crypto');

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

/**
 * Genera un hash seguro para la contraseña en texto plano utilizando salt aleatorio.
 * Retorna en formato: <salt_hex>:<hash_hex>
 */
function hashPassword(plainPassword) {
  if (typeof plainPassword !== 'string' || !plainPassword) {
    throw new Error('La contraseña debe ser una cadena de texto no vacía.');
  }

  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifica si una contraseña en texto plano coincide con el valor almacenado.
 * Soporta formato moderno (<salt>:<hash>) y migración transparente de contraseñas legadas en texto plano.
 * 
 * @param {string} plainPassword - Contraseña ingresada por el usuario
 * @param {string} storedHash - Contraseña o hash almacenado en la base de datos
 * @returns {{ isValid: boolean, needsRehash: boolean }}
 */
function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) {
    return { isValid: false, needsRehash: false };
  }

  // 1. Verificar si está en formato moderno con salt (<salt>:<hash>)
  if (storedHash.includes(':')) {
    const [salt, expectedHashHex] = storedHash.split(':');
    if (salt && expectedHashHex && salt.length === SALT_BYTES * 2) {
      try {
        const actualKey = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
        const expectedKey = Buffer.from(expectedHashHex, 'hex');

        if (actualKey.length === expectedKey.length && crypto.timingSafeEqual(actualKey, expectedKey)) {
          return { isValid: true, needsRehash: false };
        }
        return { isValid: false, needsRehash: false };
      } catch {
        return { isValid: false, needsRehash: false };
      }
    }
  }

  // 2. Fallback de compatibilidad para contraseñas heredadas en texto plano
  const isMatchLegacy = plainPassword === storedHash;
  return {
    isValid: isMatchLegacy,
    needsRehash: isMatchLegacy // Indica que debe migrarse al formato seguro con salt
  };
}

module.exports = {
  hashPassword,
  verifyPassword
};
