

const express4 = require('express');
const routerPrices = express4.Router();
const NodeCache = require("node-cache");
const cache2 = new NodeCache({ stdTTL: 60 * 5 });

function getProvider2(name){
if(name === 'twelvedata') return require('../providers/twelvedata');
return require('../providers/dummy');
}

routerPrices.get('/', async (req,res)=>{
const raw = String(req.query.symbols || '');
const providerName = String(req.query.provider || 'dummy');
if(!raw) return res.status(400).json({ error: 'missing symbols' });
const symbols = raw.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
if(!symbols.length) return res.status(400).json({ error: 'missing symbols' });


const cacheKey = `prices:${providerName}:${symbols.join(',')}`;
try{
const cached = cache2.get(cacheKey);
if(cached) return res.json(cached);
const provider = getProvider2(providerName);
const data = await provider.prices(symbols);

cache2.set(cacheKey, data, 60*2);
res.json(data);
}catch(err){
console.error('prices error', err.message || err);
res.status(500).json({ error: 'failed to fetch prices' });
}
});


module.exports = routerPrices;