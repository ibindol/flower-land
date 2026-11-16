// 누구나 볼 수 있는 가게 꽃다발 목록
const { readShop } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const d = await readShop();
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    res.status(200).json({ items: d.items });
  } catch (e) {
    res.status(500).json({ error: '목록을 불러오지 못했어요' });
  }
};
