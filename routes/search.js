

const express3 = require('express');
const routerSearch = express3.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 5 });

function getProvider(name){
if(name === 'twelvedata') return require('../providers/twelvedata');
return require('../providers/dummy');
}


routerSearch.get('/', async (req,res)=>{
const q = String(req.query.q || '').trim();
const providerName = String(req.query.provider || 'dummy');
if(!q) return res.json([]);
const cacheKey = `search:${providerName}:${q.toLowerCase()}`;
try{
const cached = cache.get(cacheKey);
if(cached) return res.json(cached);
const provider = getProvider(providerName);
const results = await provider.search(q);
cache.set(cacheKey, results, 60*5); 
res.json(results);
}catch(err){
console.error('search error', err.message || err);
res.status(500).json([]);
}
});


module.exports = routerSearch;