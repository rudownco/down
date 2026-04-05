/**
 * Syncs shared definitions from common into Supabase Edge Function _shared.
 *
 * 1. permissions.ts — full copy of common/src/utils/permissions.ts
 * 2. constants.ts  — RSVP_STATUSES, EVENT_STATUSES, GROUP_ROLES from common/src/types/index.ts
 *
 * Usage: tsx scripts/sync-permissions.ts [--check]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PERM_SOURCE = join(ROOT, 'common/src/utils/permissions.ts');
const TYPES_SOURCE = join(ROOT, 'common/src/types/index.ts');
const DEST_DIR = join(ROOT, 'backend/supabase/functions/_shared');
const DEST_PERMISSIONS = join(DEST_DIR, 'permissions.ts');
const DEST_CONSTANTS = join(DEST_DIR, 'constants.ts');

const HEADER = (src: string) =>
  `// AUTO-GENERATED from ${src} — DO NOT EDIT\n// Sync: npm run sync:shared\n\n`;

/**
 * Extract lines matching `export const FOO = [...] as const;` and
 * derive a type from each.
 */
function buildConstantsFile(typesSource: string): string {
  const names = ['RSVP_STATUSES', 'EVENT_STATUSES', 'GROUP_ROLES'];
  const lines: string[] = [];

  for (const name of names) {
    // Match: export const NAME = ['a', 'b'] as const;
    const re = new RegExp(`^export const ${name}\\s*=\\s*\\[([^\\]]+)\\]\\s*as const;`, 'm');
    const m = typesSource.match(re);
    if (!m) {
      throw new Error(`Could not find "export const ${name}" in types/index.ts`);
    }
    lines.push(`export const ${name} = [${m[1]}] as const;`);

    // Derive a type for RSVP_STATUSES and EVENT_STATUSES (useful for Edge Functions)
    if (name === 'RSVP_STATUSES') {
      lines.push(`export type RSVPStatus = (typeof ${name})[number];`);
    } else if (name === 'EVENT_STATUSES') {
      lines.push(`export type EventStatus = (typeof ${name})[number];`);
    }
    lines.push('');
  }

  return HEADER('@down/common types') + lines.join('\n');
}

function buildPermissionsFile(source: string): string {
  return HEADER('common/src/utils/permissions.ts') + source.replace(/^\uFEFF/, '');
}

function normalizeEol(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

const check = process.argv.includes('--check');

const permSource = normalizeEol(readFileSync(PERM_SOURCE, 'utf8'));
const typesSource = normalizeEol(readFileSync(TYPES_SOURCE, 'utf8'));

const nextPermissions = normalizeEol(buildPermissionsFile(permSource));
const nextConstants = normalizeEol(buildConstantsFile(typesSource));

if (check) {
  const curPerm = normalizeEol(readFileSync(DEST_PERMISSIONS, 'utf8'));
  const curConst = normalizeEol(readFileSync(DEST_CONSTANTS, 'utf8'));
  const drift: string[] = [];
  if (curPerm !== nextPermissions) drift.push(DEST_PERMISSIONS);
  if (curConst !== nextConstants) drift.push(DEST_CONSTANTS);
  if (drift.length) {
    console.error('Shared backend files are out of sync with common:');
    for (const p of drift) console.error(`  - ${p}`);
    console.error('Run: npm run sync:shared');
    process.exit(1);
  }
  console.log('Shared backend files match common.');
  process.exit(0);
}

writeFileSync(DEST_PERMISSIONS, nextPermissions, 'utf8');
writeFileSync(DEST_CONSTANTS, nextConstants, 'utf8');
console.log(`Wrote ${DEST_PERMISSIONS}`);
console.log(`Wrote ${DEST_CONSTANTS}`);
