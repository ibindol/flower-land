// 가게 꽃다발 목록(사진 정보)을 Vercel Blob 저장 공간에 보관합니다.
// 목록은 바꿀 때마다 새 이름(data/shop-시간.json)으로 저장하고, 가장 최근 것을 읽습니다.
const { put, list, del } = require('@vercel/blob');
const crypto = require('crypto');
const SEED = require('./_seed.json');

const TONES = ['red', 'pink', 'yellow', 'purple', 'pastel', 'mix'];
const KINDS = ['basket', 'bouquet'];

async function latest() {
  const r = await list({ prefix: 'data/shop-', limit: 1000 });
  const bl = r.blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return bl;
}

async function readShop() {
  const bl = await latest();
  if (!bl.length) return JSON.parse(JSON.stringify(SEED));
  const res = await fetch(bl[0].url, { cache: 'no-store' });
  if (!res.ok) throw new Error('목록을 읽지 못했어요');
  return res.json();
}

async function writeShop(data) {
  const name = 'data/shop-' + Date.now() + '.json';
  await put(name, JSON.stringify(data), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60,
  });
  // 예전 목록은 최근 5개만 남기고 지웁니다
  const bl = await latest();
  const old = bl.filter(b => b.pathname !== name).slice(4).map(b => b.url);
  if (old.length) await del(old);
}

function checkKey(req) {
  const want = process.env.ADMIN_PASSWORD || '';
  const got = String(req.headers['x-admin-key'] || '');
  if (!want) return false;
  const a = crypto.createHash('sha256').update(want).digest();
  const b = crypto.createHash('sha256').update(got).digest();
  return crypto.timingSafeEqual(a, b);
}

function cleanMeta(x) {
  const name = String(x.name || '').replace(/[<>]/g, '').trim().slice(0, 40);
  const kind = KINDS.includes(x.kind) ? x.kind : 'basket';
  const tones = Array.isArray(x.tones) ? x.tones.filter(t => TONES.includes(t)).slice(0, 6) : [];
  return { name: name || '꽃바구니', kind, tones };
}

module.exports = { readShop, writeShop, checkKey, cleanMeta, put, del };
