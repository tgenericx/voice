import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { findRoot } from './find-root.util';

/**
 * Generates and saves RSA private and public keys.
 *
 * Keys are stored under one of:
 * - /etc/secrets/<subDir>/<prefix>private.pem  (default, container-safe)
 * - <project-root>/secrets/<subDir>/<prefix>private.pem (fallback)
 *
 * @param prefix - Optional prefix for filenames, e.g. 'access-' or 'refresh-'
 * @param subDir - Optional subdirectory under secrets (e.g. orgId or token type)
 * @param force  - If true overwrites existing keys
 */
export function generateAndSaveKeys(
  prefix = '',
  subDir = '',
  force = false,
): void {
  const etcSecrets = '/etc/secrets';
  let secretsBase: string;

  if (fs.existsSync(etcSecrets)) {
    secretsBase = etcSecrets;
  } else {
    try {
      fs.mkdirSync(etcSecrets, { recursive: true });
      secretsBase = etcSecrets;
    } catch {
      const root = findRoot(process.cwd());
      secretsBase = path.join(root, 'secrets');
    }
  }

  const targetDir = subDir ? path.join(secretsBase, subDir) : secretsBase;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
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
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicPath, publicKey);

  console.log('✅ RSA keys generated successfully:');
  console.log(`🔐 Private Key: ${privatePath}`);
  console.log(`🔓 Public Key:  ${publicPath}`);
}
