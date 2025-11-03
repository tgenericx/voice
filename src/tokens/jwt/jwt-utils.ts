import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { generateAndSaveKeys } from 'src/utils/generate-keys.util';

/**
 * Load existing RSA key pair or generate new ones if missing.
 *
 * Keys are stored under:
 *   /etc/secrets/<prefix>/<prefix>-private.pem
 *   /etc/secrets/<prefix>/<prefix>-public.pem
 */
export const loadOrGenerateKeys = (
  logger: Logger,
  prefix = '',
): { privateKey: string; publicKey: string } => {
  const normalizedPrefix = prefix.replace(/-+$/, '');
  const secretsBase = '/etc/secrets';

  try {
    if (!fs.existsSync(secretsBase)) {
      fs.mkdirSync(secretsBase, { recursive: true });
    }
  } catch (err) {
    logger.error(`❌ Failed to ensure ${secretsBase}: ${err}`);
  }

  const secretsDir = path.join(secretsBase, normalizedPrefix);
  fs.mkdirSync(secretsDir, { recursive: true });

  const privatePath = path.join(secretsDir, `${normalizedPrefix}-private.pem`);
  const publicPath = path.join(secretsDir, `${normalizedPrefix}-public.pem`);

  try {
    const privateKey = fs.readFileSync(privatePath, 'utf8');
    const publicKey = fs.readFileSync(publicPath, 'utf8');
    logger.log(`✅ Keys loaded from ${secretsDir}`);
    return { privateKey, publicKey };
  } catch {
    logger.warn(`⚠️ No keys found for prefix="${prefix}". Generating new keypair...`);
  }

  generateAndSaveKeys(`${normalizedPrefix}-`, normalizedPrefix);

  const privateKey = fs.readFileSync(privatePath, 'utf8');
  const publicKey = fs.readFileSync(publicPath, 'utf8');
  logger.log(`✅ New keys generated at ${secretsDir}`);

  return { privateKey, publicKey };
};
