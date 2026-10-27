// DB 백업: data/backups/sprout-YYYY-MM-DD-HHMM.db 로 저장하고 오래된 백업(기본 14개 초과)을 지운다
// 사용: npm run backup   (deploy/install-pi.sh가 매일 03:30 cron으로 등록)
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../lib/db.js';
import { config } from '../lib/env.js';

const dir = path.join(config.dataDir, 'backups');
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
const file = path.join(dir, `sprout-${stamp}.db`);
db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
const keep = Number(process.env.BACKUP_KEEP || 14);
const old = fs.readdirSync(dir).filter(f => f.endsWith('.db')).sort().reverse().slice(keep);
old.forEach(f => fs.rmSync(path.join(dir, f)));
console.log(`백업 완료: ${file} (${Math.round(fs.statSync(file).size / 1024)}KB), 오래된 백업 ${old.length}개 삭제`);
db.close();
