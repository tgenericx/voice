import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates and saves RSA private and public keys.
 *
 * Keys are stored under:
 *   /etc/secrets/<subDir>/<prefix>private.pem
 *
 * - Creates /etc/secrets if missing (when writable)
 * - Creates subdirectories as needed
 * - Does NOT overwrite existing keys unless force = true
 */
export function generateAndSaveKeys(
  prefix = '',
  subDir = '',
  force = false,
): void {
  const secretsBase = '/etc/secrets';

  try {
    if (!fs.existsSync(secretsBase)) {
      fs.mkdirSync(secretsBase, { recursive: true });
    }
  } catch (err) {
    console.warn(`⚠️ Could not create ${secretsBase}: ${err}`);
  }

  const targetDir = subDir ? path.join(secretsBase, subDir) : secretsBase;
  try {
    fs.mkdirSync(targetDir, { recursive: true });
  } catch (err) {
    console.error(`❌ Failed to create target directory ${targetDir}: ${err}`);
    throw err;
  }

  const privatePath = path.join(targetDir, `${prefix}private.pem`);
  const publicPath = path.join(targetDir, `${prefix}public.pem`);

  if (!force && fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
    console.log('⚠️ Keys already exist, skipping generation.');
    console.log(`🔐 Private Key: ${privatePath}`);
    console.log(`🔓 Public Key:  ${publicPath}`);
    return;
  }

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicPath, publicKey);

  console.log('✅ RSA keys generated successfully:');
  console.log(`🔐 Private Key: ${privatePath}`);
  console.log(`🔓 Public Key:  ${publicPath}`);
}
