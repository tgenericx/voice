import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { findRoot } from 'src/utils/find-root.util';
import { generateAndSaveKeys } from 'src/utils/generate-keys.util';

/**
 * Load existing RSA key pair or generate new ones if missing.
 * 
 * Keys default to /etc/secrets/<prefix>/.
 * Fallback: <project-root>/secrets/<prefix>/.
 */
export const loadOrGenerateKeys = (
  logger: Logger,
  prefix = '',
): { privateKey: string; publicKey: string } => {
  const normalizedPrefix = prefix.replace(/-+$/, '');

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

  const secretsDir = path.join(secretsBase, normalizedPrefix);

  const privatePath = path.join(secretsDir, `${normalizedPrefix}-private.pem`);
  const publicPath = path.join(secretsDir, `${normalizedPrefix}-public.pem`);

  try {
    const privateKey = fs.readFileSync(privatePath, 'utf8');
    const publicKey = fs.readFileSync(publicPath, 'utf8');
    logger.log(`✅ Keys loaded from ${secretsDir}`);
    return { privateKey, publicKey };
  } catch (err) {
    logger.warn(`⚠️ Keys not found in ${secretsDir}: ${err}`);
  }

  logger.warn(`⚠️ No keys found for prefix="${prefix}". Generating new keypair...`);
  generateAndSaveKeys(`${normalizedPrefix}-`, normalizedPrefix);

  const privateKey = fs.readFileSync(privatePath, 'utf8');
  const publicKey = fs.readFileSync(publicPath, 'utf8');
  logger.log(`✅ New keys generated at ${secretsDir}`);

  return { privateKey, publicKey };
};
