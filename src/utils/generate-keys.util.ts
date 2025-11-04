import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates and saves RSA private and public keys.
 * Keys are always named "<prefix>-private.pem" and "<prefix>-public.pem".
 * Creates directory if missing, never overwrites unless force = true.
 */
export function generateAndSaveKeys(prefix: string, baseDir: string, force = false): void {
  prefix = prefix.trim().replace(/-+$/, '');

  fs.mkdirSync(baseDir, { recursive: true });

  const privatePath = path.join(baseDir, `${prefix}-private.pem`);
  const publicPath = path.join(baseDir, `${prefix}-public.pem`);

  if (!force && fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
    console.log(`⚠️ Keys already exist for "${prefix}", skipping generation.`);
    return;
  }

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicPath, publicKey);

  console.log(`✅ RSA keys generated for "${prefix}" in ${baseDir}`);
}
