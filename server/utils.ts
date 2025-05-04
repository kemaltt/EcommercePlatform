import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Compares a supplied password with a stored password hash (including salt).
 * Uses scrypt for hashing and timingSafeEqual for comparison to prevent timing attacks.
 * @param storedPasswordHash The hash string stored in the database (format: hash.salt).
 * @param suppliedPassword The plain text password supplied by the user.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export async function comparePasswords(storedPasswordHash: string, suppliedPassword: string): Promise<boolean> {
  try {
    // storedPasswordHash formatının 'hash.salt' olduğundan emin ol
    if (!storedPasswordHash || !storedPasswordHash.includes('.')) {
        console.error("Invalid stored password format. Expected 'hash.salt'.");
        return false;
    }

    const [hashedPassword, salt] = storedPasswordHash.split('.');
    if (!hashedPassword || !salt) {
        console.error("Invalid stored password format after split.");
        return false; // Invalid format after split
    }

    // scrypt'in 64 byte (512 bit) çıktı verdiğinden emin ol
    const keylen = 64; 
    const buf = (await scryptAsync(suppliedPassword, salt, keylen)) as Buffer;
    
    // Veritabanındaki hash'i (hex string) Buffer'a çevir
    let suppliedPasswordBuf: Buffer;
    try {
        suppliedPasswordBuf = Buffer.from(hashedPassword, 'hex');
    } catch (e) {
        console.error("Error converting stored hash from hex:", e);
        return false; // Invalid hex string in DB
    }

    // Buffer uzunluklarını kontrol et (scrypt çıktısı ile aynı olmalı)
    if (buf.length !== suppliedPasswordBuf.length) {
        console.error(`Buffer length mismatch: derived key length ${buf.length}, stored key length ${suppliedPasswordBuf.length}`);
        return false; // Length mismatch indicates non-matching passwords or hash corruption
    }

    // Zamanlama saldırılarına karşı güvenli karşılaştırma yap
    return timingSafeEqual(buf, suppliedPasswordBuf);

  } catch (error) {
    // Genel scrypt veya diğer hataları yakala
    console.error("Error comparing passwords:", error);
    return false; // Hata durumunda eşleşmiyor olarak kabul et
  }
}

// Gerekirse buraya başka yardımcı fonksiyonlar da eklenebilir. 