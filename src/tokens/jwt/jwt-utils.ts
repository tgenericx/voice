import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { generateAndSaveKeys } from 'src/utils/generate-keys.util';
import { findRoot } from 'src/utils/find-root.util';

/**
 * Loads RSA keys from `/etc/secrets` (preferred).
 * If not found, falls back to `<projectRoot>/secrets` and generates them.
 */
export const loadOrGenerateKeys = (
  logger: Logger,
  prefix: string,
): { privateKey: string; publicKey: string } => {
  const systemDir = '/etc/secrets';
  const privateFile = `${prefix}-private.pem`;
  const publicFile = `${prefix}-public.pem`;

  const systemPrivatePath = path.join(systemDir, privateFile);
  const systemPublicPath = path.join(systemDir, publicFile);

  // 🧭 1️⃣ Try loading from /etc/secrets (no generation)
  if (fs.existsSync(systemPrivatePath) && fs.existsSync(systemPublicPath)) {
    logger.log(`✅ Loaded keys for "${prefix}" from ${systemDir}`);
    return {
      privateKey: fs.readFileSync(systemPrivatePath, 'utf8'),
      publicKey: fs.readFileSync(systemPublicPath, 'utf8'),
    };
  }

  // 🧭 2️⃣ Fallback: use <projectRoot>/secrets
  const projectRoot = findRoot(process.cwd());
  const fallbackDir = path.join(projectRoot, 'secrets');
  const fallbackPrivate = path.join(fallbackDir, privateFile);
  const fallbackPublic = path.join(fallbackDir, publicFile);

  if (fs.existsSync(fallbackPrivate) && fs.existsSync(fallbackPublic)) {
    logger.log(`✅ Loaded keys for "${prefix}" from ${fallbackDir}`);
    return {
      privateKey: fs.readFileSync(fallbackPrivate, 'utf8'),
      publicKey: fs.readFileSync(fallbackPublic, 'utf8'),
    };
  }

  // 🛠️ 3️⃣ Generate new ones in <projectRoot>/secrets
  logger.warn(
    `⚠️ No keys found for "${prefix}", generating under ${fallbackDir}`,
  );
  generateAndSaveKeys(prefix, fallbackDir);

  return {
    privateKey: fs.readFileSync(fallbackPrivate, 'utf8'),
    publicKey: fs.readFileSync(fallbackPublic, 'utf8'),
  };
};
