// 사장님 전용: 사진 올리기, 고치기, 지우기, 순서 바꾸기
const crypto = require('crypto');
const { readShop, writeShop, checkKey, cleanMeta, put, del } = require('./_lib');

const MAX_IMG = 2.5 * 1024 * 1024;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function jpeg(b64) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b64 || ''));
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length < 100 || buf.length > MAX_IMG || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  return buf;
}
const isBlobUrl = u => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(u || '');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '잘못된 요청이에요' });
  if (!checkKey(req)) { await sleep(1200); return res.status(401).json({ error: '비밀번호가 맞지 않아요' }); }
  const body = req.body || {};
  try {
    if (body.action === 'check') return res.json({ ok: true });

    const d = await readShop();
    const find = no => d.items.findIndex(x => x.no === Number(no));

    if (body.action === 'upload') {
      const big = jpeg(body.big), small = jpeg(body.small);
      if (!big || !small) return res.status(400).json({ error: '사진 파일을 읽지 못했어요' });
      const no = d.next || (Math.max(0, ...d.items.map(x => x.no)) + 1);
      const key = String(no).padStart(2, '0') + '-' + crypto.randomBytes(4).toString('hex');
      const o = { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false };
      const [b, s] = await Promise.all([put('shop/' + key + '.jpg', big, o), put('shop/' + key + '_s.jpg', small, o)]);
      const w = Math.max(1, Math.min(2000, Number(body.w) || 560)), h = Math.max(1, Math.min(2000, Number(body.h) || 420));
      const item = Object.assign({ no, w, h, s: s.url, b: b.url }, cleanMeta(body));
      d.items.unshift(item);
      d.next = no + 1;
      await writeShop(d);
      return res.json({ ok: true, item, items: d.items });
    }

    const i = find(body.no);
    if (i < 0) return res.status(404).json({ error: '그 번호의 사진이 없어요' });

    if (body.action === 'update') {
      Object.assign(d.items[i], cleanMeta(body));
    } else if (body.action === 'replace') {
      const big = jpeg(body.big), small = jpeg(body.small);
      if (!big || !small) return res.status(400).json({ error: '사진 파일을 읽지 못했어요' });
      const it = d.items[i];
      const key = String(it.no).padStart(2, '0') + '-' + crypto.randomBytes(4).toString('hex');
      const o = { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false };
      const [b, s] = await Promise.all([put('shop/' + key + '.jpg', big, o), put('shop/' + key + '_s.jpg', small, o)]);
      const oldUrls = [it.s, it.b].filter(isBlobUrl);
      it.s = s.url; it.b = b.url;
      it.w = Math.max(1, Math.min(2000, Number(body.w) || it.w)); it.h = Math.max(1, Math.min(2000, Number(body.h) || it.h));
      if (oldUrls.length) await del(oldUrls).catch(() => {});
    } else if (body.action === 'move') {
      const j = i + (Number(body.dir) < 0 ? -1 : 1);
      if (j >= 0 && j < d.items.length) { const t = d.items[i]; d.items[i] = d.items[j]; d.items[j] = t; }
    } else if (body.action === 'top') {
      d.items.unshift(d.items.splice(i, 1)[0]);
    } else if (body.action === 'delete') {
      const it = d.items.splice(i, 1)[0];
      const urls = [it.s, it.b].filter(isBlobUrl);
      if (urls.length) await del(urls).catch(() => {});
    } else {
      return res.status(400).json({ error: '잘못된 요청이에요' });
    }
    await writeShop(d);
    return res.json({ ok: true, items: d.items });
  } catch (e) {
    return res.status(500).json({ error: '처리하지 못했어요. 잠시 뒤 다시 해 주세요.' });
  }
};
