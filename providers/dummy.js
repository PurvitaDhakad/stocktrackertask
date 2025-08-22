exports.search = async (q) => {

const s = q.toUpperCase();
return [
{ symbol: s.substring(0, 6), name: `${s} Inc.` },
{ symbol: s.substring(0, 4) + 'X', name: `${s}X Corp.` },
{ symbol: 'AAPL', name: 'Apple Inc.' },
{ symbol: 'TSLA', name: 'Tesla, Inc.' }
];
};


exports.prices = async (symbols) => {
const now = Date.now();
const out = {};
for (const s of symbols){
out[s] = Array.from({length: 24}).map((_,i)=>({ ts: now - (23-i)*60*60*1000, price: Math.round((50 + Math.random()*150)*100)/100 }));
}
return out;
};