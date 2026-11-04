// DB 백업: data/backups/sprout-YYYY-MM-DD-HHMM.db 로 저장하고 오래된 백업(기본 14개 초과)을 지운다
// 사용: npm run backup   (deploy/install-pi.sh가 매일 03:30 cron으로 등록)
// BACKUP_COPY_DIR가 있으면 같은 파일을 그 폴더에도 복사한다 (Mac 등 바깥으로 가져가는 용도, deploy/set-backup.sh)
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
const copyDir = process.env.BACKUP_COPY_DIR;
if (copyDir) {
  try {
    // copyFileSync는 원본 그룹(sprout)을 따라가서 바깥에서 못 읽음 → 새로 써서 폴더 그룹(setgid)을 받게 함
    const dirGid = fs.statSync(copyDir).gid;
    const put = (src, dest) => {
      const tmp = `${dest}.tmp`;
      fs.writeFileSync(tmp, fs.readFileSync(src), { mode: 0o640 });
      fs.renameSync(tmp, dest);
    };
    const dest = path.join(copyDir, path.basename(file));
    put(file, dest);
    fs.readdirSync(copyDir).filter(f => /^sprout-.*\.db$/.test(f)).map(f => path.join(copyDir, f))
      .filter(f => fs.statSync(f).gid !== dirGid).forEach(f => put(f, f));
    fs.readdirSync(copyDir).filter(f => /^sprout-.*\.db$/.test(f)).sort().reverse().slice(keep)
      .forEach(f => fs.rmSync(path.join(copyDir, f)));
    console.log(`바깥 보관용 복사: ${dest}`);
  } catch (err) { console.error(`바깥 보관용 복사 실패: ${err.message}`); }
}
console.log(`백업 완료: ${file} (${Math.round(fs.statSync(file).size / 1024)}KB), 오래된 백업 ${old.length}개 삭제`);
db.close();
