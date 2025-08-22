

// const axios = require('axios');
// const dotenv = require('dotenv');
// dotenv.config();
// const API_KEY = process.env.TWELVEDATA_API_KEY;


// exports.search = async (q) => {
// if(!API_KEY) throw new Error('Twelve Data API key not configured');
// const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(q)}&apikey=${API_KEY}`;
// const res = await axios.get(url);
// const data = res.data.data || res.data;
// return (data||[]).map(d=>({ symbol: d.symbol, name: d.instrument_name || d.name || '' }));
// };


// exports.prices = async (symbols) => {
// if(!API_KEY) throw new Error('Twelve Data API key not configured');
// const out = {};
// for(const s of symbols){
// const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(s)}&interval=1h&outputsize=24&format=JSON&apikey=${API_KEY}`;
// const res = await axios.get(url);
// const series = res.data.values || [];
// out[s] = series.reverse().map(v=>({ ts: new Date(v.datetime).getTime(), price: Number(v.close) }));
// }
// return out;
// };