
const express = require('express');
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv3 = require('dotenv');
dotenv3.config();
const searchRouter = require('./routes/search');
const pricesRouter = require('./routes/prices');
const authRouter = require('./routes/auth');




const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


app.use(express.static("public"));

app.use((req,res,next)=>{
res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
res.header('Access-Control-Allow-Credentials', 'true');
res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
if(req.method === 'OPTIONS') return res.sendStatus(204);
next();
});


const limiter = rateLimit({ windowMs: 1000*60, max: 120 });
app.use(limiter);


app.use('/api/search', searchRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/auth', authRouter);





app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Server listening on http://localhost:${port}`));