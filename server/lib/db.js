// SQLite (Node 내장 node:sqlite) — 라즈베리파이에서 네이티브 빌드 없이 동작
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { config } from './env.js';

fs.mkdirSync(config.dataDir, { recursive: true });
export const dbFile = path.join(config.dataDir, 'sprout.db');
export const db = new DatabaseSync(dbFile);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

const MIGRATIONS = [
  `CREATE TABLE users (
     id TEXT PRIMARY KEY, email TEXT UNIQUE, parent_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'parent',
     created_at INTEGER NOT NULL, last_login INTEGER, trial_start INTEGER, trial_bonus INTEGER NOT NULL DEFAULT 0,
     marketing INTEGER NOT NULL DEFAULT 0, customer_key TEXT NOT NULL,
     state TEXT NOT NULL DEFAULT '{}', settings TEXT NOT NULL DEFAULT '{}');
   CREATE TABLE identities (provider TEXT NOT NULL, provider_uid TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at INTEGER NOT NULL, PRIMARY KEY (provider, provider_uid));
   CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, user_agent TEXT);
   CREATE TABLE login_codes (email TEXT PRIMARY KEY, code_hash TEXT NOT NULL, sent_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
     tries INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE memberships (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, kids TEXT NOT NULL, months INTEGER NOT NULL,
     since INTEGER NOT NULL, until INTEGER NOT NULL, auto_renew INTEGER NOT NULL DEFAULT 1, monthly INTEGER NOT NULL DEFAULT 0,
     granted INTEGER NOT NULL DEFAULT 0, billing_key TEXT, renew_fail INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE payments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, order_id TEXT UNIQUE,
     at INTEGER NOT NULL, amount INTEGER NOT NULL, description TEXT NOT NULL, kids TEXT, months INTEGER,
     coupon_id TEXT, coupon_label TEXT, status TEXT NOT NULL, payment_key TEXT, method TEXT, raw TEXT);
   CREATE TABLE coupons (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL,
     rate REAL NOT NULL, welcome INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, text TEXT NOT NULL,
     kind TEXT NOT NULL, at INTEGER NOT NULL, read INTEGER NOT NULL DEFAULT 0);
   CREATE INDEX notifications_user ON notifications(user_id, at DESC);
   CREATE TABLE reviews (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, rating INTEGER NOT NULL,
     name TEXT NOT NULL, text TEXT NOT NULL, date TEXT NOT NULL, created_at INTEGER NOT NULL);
   CREATE TABLE kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);`,
];

db.exec('CREATE TABLE IF NOT EXISTS schema_version (v INTEGER NOT NULL)');
const row = db.prepare('SELECT v FROM schema_version').get();
let version = row ? row.v : 0;
if (!row) db.prepare('INSERT INTO schema_version (v) VALUES (0)').run();
for (; version < MIGRATIONS.length; version++) {
  db.exec('BEGIN');
  try { db.exec(MIGRATIONS[version]); db.prepare('UPDATE schema_version SET v = ?').run(version + 1); db.exec('COMMIT'); }
  catch (err) { db.exec('ROLLBACK'); throw err; }
}

export const id = () => crypto.randomUUID();
export const now = () => Date.now();
export const DAY = 86400000;
export const json = (s, d) => { try { return JSON.parse(s); } catch { return d; } };

export function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (err) { db.exec('ROLLBACK'); throw err; }
}

export const kv = {
  get: (k, d) => { const r = db.prepare('SELECT v FROM kv WHERE k = ?').get(k); return r ? json(r.v, d) : d; },
  set: (k, v) => db.prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').run(k, JSON.stringify(v)),
};
