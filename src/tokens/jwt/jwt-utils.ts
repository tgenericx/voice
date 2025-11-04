import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { generateAndSaveKeys } from 'src/utils/generate-keys.util';
import { findRoot } from 'src/utils/find-root.util';

/**
 * Loads RSA keys from `/etc/secrets` (preferred).
 * Falls back to `<projectRoot>/secrets` and generates if missing.
 */
export const loadOrGenerateKeys = (
  logger: Logger,
  prefix: string,
): { privateKey: string; publicKey: string } => {
  prefix = prefix.trim().replace(/-+$/, '');

  const systemDir = '/etc/secrets';
  const privateFile = `${prefix}-private.pem`;
  const publicFile = `${prefix}-public.pem`;
  const projectRoot = findRoot(process.cwd());
  const fallbackDir = path.join(projectRoot, 'secrets');

  const systemPrivate = path.join(systemDir, privateFile);
  const systemPublic = path.join(systemDir, publicFile);
  if (fs.existsSync(systemPrivate) && fs.existsSync(systemPublic)) {
    logger.log(`✅ Loaded keys for "${prefix}" from ${systemDir}`);
    return {
      privateKey: fs.readFileSync(systemPrivate, 'utf8'),
      publicKey: fs.readFileSync(systemPublic, 'utf8'),
    };
  }

  const fallbackPrivate = path.join(fallbackDir, privateFile);
  const fallbackPublic = path.join(fallbackDir, publicFile);

  if (!fs.existsSync(fallbackPrivate) || !fs.existsSync(fallbackPublic)) {
    logger.warn(`⚠️ No keys found for "${prefix}", generating under ${fallbackDir}`);
    generateAndSaveKeys(prefix, fallbackDir);
  }

  return {
    privateKey: fs.readFileSync(fallbackPrivate, 'utf8'),
    publicKey: fs.readFileSync(fallbackPublic, 'utf8'),
  };
};
