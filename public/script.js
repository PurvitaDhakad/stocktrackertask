

const API_BASE = "http://localhost:4000";
    const $ = (sel) => document.querySelector(sel);
    const qs = (sel) => Array.from(document.querySelectorAll(sel));

    const state = {
      selected: JSON.parse(localStorage.getItem('selectedSymbols')||'[]'),
      provider: localStorage.getItem('provider')||'dummy',
      dark: localStorage.getItem('dark')==='1',
      authed: false
    }
if (state.authed) doSignOut();
else showLogin();

    const searchInput = $('#searchInput');
    const searchDropdown = $('#searchDropdown');
    const chipsEl = $('#selectedChips');
    const providerLabel = $('#providerLabel');
    const providerSelect = $('#providerSelect');
    const providerApply = $('#applyProvider');
    const exportBtn = $('#exportBtn');
    const refreshBtn = $('#refreshBtn');
    const clearBtn = $('#clearBtn');
    const loginBtn = $('#loginBtn');
    const loginModal = $('#loginModal');
    const doLogin = $('#doLogin');
    const cancelLogin = $('#cancelLogin');
    const darkToggle = $('#darkToggle');
    let chart;

    function init(){
      document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : '');
      darkToggle.checked = state.dark;
      providerSelect.value = state.provider;
      providerLabel.textContent = capitalize(state.provider);
      renderChips();
      attachListeners();
      initChart();
      updateAuthUI();
      if(state.selected.length) fetchAndRenderPrices();
    }

    function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}

    function attachListeners(){
      let searchTimer = null;
      searchInput.addEventListener('input', (e)=>{
        const q = e.target.value.trim();
        if(searchTimer) clearTimeout(searchTimer);
        if(!q){ searchDropdown.style.display='none'; return }
        searchTimer = setTimeout(()=>doSearch(q), 250);
      });

      document.addEventListener('click', (ev)=>{
        if(!ev.target.closest('.results') && !ev.target.closest('#searchInput')) searchDropdown.style.display='none';
      });

      providerApply.addEventListener('click', ()=>{
        state.provider = providerSelect.value;
        localStorage.setItem('provider', state.provider);
        providerLabel.textContent = capitalize(state.provider);
        fetchAndRenderPrices();
      });

      exportBtn.addEventListener('click', exportCSV);
      refreshBtn.addEventListener('click', fetchAndRenderPrices);
      clearBtn.addEventListener('click', ()=>{ state.selected=[]; saveState(); renderChips(); fetchAndRenderPrices(); });

      loginBtn.addEventListener('click', ()=>{
        if(state.authed){ doSignOut(); } else { loginModal.style.display='flex' }
      });
      cancelLogin.addEventListener('click', ()=>{ loginModal.style.display='none' });
      doLogin.addEventListener('click', doSignUp);
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('doSignup').addEventListener('click', doSignUp);
});

      darkToggle.addEventListener('change', ()=>{
        state.dark = darkToggle.checked; localStorage.setItem('dark', state.dark? '1':'0');
        document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : '');
      });
    }

async function doSearch(q){
  console.log('Searching for:', q, 'provider:', state.provider);
  try{
    const res = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(q)}&provider=${state.provider}`, 
      { credentials: 'include' }
    );

    console.log('Search response status:', res.status);
    const items = await res.json();
    console.log('Search results:', items);
    renderDropdown(items.slice(0,20));
  } catch(err){
    console.error('Search failed, using fallback:', err);

    const fallback = [q.toUpperCase(), q.slice(0,3).toUpperCase()]
      .filter(Boolean)
      .map(s=>({symbol:s,name:'Fallback company'}));

    console.log('Fallback items:', fallback);
    renderDropdown(fallback);
  }
}

function renderDropdown(items){
  console.log('Rendering dropdown:', items);
  if(!items || !items.length){ 
    searchDropdown.style.display = 'none';
    return;
  }

  searchDropdown.innerHTML = items.map(it => `
    <button data-symbol="${it.symbol}">
      <strong>${it.symbol}</strong> 
      <small style="color:var(--muted);margin-left:8px">${it.name||''}</small>
    </button>
  `).join('');

  searchDropdown.style.display = 'block';

  searchDropdown.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', ()=>{
      addSymbol(btn.dataset.symbol); 
      searchInput.value = '';
      searchDropdown.style.display = 'none';
    });
  });
}

   function addSymbol(symbol){
  symbol = symbol.toUpperCase();
  if(state.selected.includes(symbol)) return;

  state.selected.push(symbol);
  saveState();
  renderChips();    
  fetchAndRenderPrices(); 
}


    function removeSymbol(symbol){
      state.selected = state.selected.filter(s=>s!==symbol);
      saveState(); renderChips(); fetchAndRenderPrices();
    }

    function renderChips(){
      chipsEl.innerHTML = state.selected.map(s=>`<div class="chip">${s}<button data-remove="${s}">✕</button></div>`).join('');
      chipsEl.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click', (e)=>{ removeSymbol(e.target.dataset.remove) }));
    }

    function saveState(){ localStorage.setItem('selectedSymbols', JSON.stringify(state.selected)); }
    function initChart(){
      const ctx = document.getElementById('priceChart');
      chart = new Chart(ctx, {
        type:'line',
        data:{labels:[], datasets:[]},
        options:{
          maintainAspectRatio:false,
          interaction:{mode:'index', intersect:false},
          plugins:{legend:{display:true}},
          scales:{x:{type:'time', time:{unit:'hour', tooltipFormat:'MMM d, h:mm a'}}, y:{beginAtZero:false}}
        }
      });
    }

async function fetchAndRenderPrices(){
  if(!state.selected.length){ 
    console.log('No symbols selected');
    updateTable({});
    chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
    return;
  }

  const symbols = state.selected.join(',');
  console.log('Fetching prices for:', symbols);

  try {
    const res = await fetch(`${API_BASE}/api/prices?symbols=${encodeURIComponent(symbols)}&provider=${state.provider}`, { credentials:'include' });
    const data = await res.json();
    console.log('Prices data:', data);

    renderChartFromData(data); 
    updateTable(data);         
  } catch(err) {
    console.error('Error fetching prices:', err);
  }
}


    function renderChartFromData(data){
    
      const allTimestamps = new Set();
      for(const s in data) data[s].forEach(p=>allTimestamps.add(p.ts));
      const labels = Array.from(allTimestamps).sort((a,b)=>a-b).map(v=>new Date(v));

      const datasets = [];
      const palette = ["#2563eb","#ef4444","#10b981","#f59e0b","#8b5cf6","#e11d48","#06b6d4"]
      let i = 0;
      for(const s of state.selected){
        const arr = data[s] || [];
        const map = new Map(arr.map(p=>[p.ts, p.price]));
        const points = labels.map(dt => {
          const t = dt.getTime();
          return map.has(t) ? map.get(t) : null;
        });
        datasets.push({label:s,data:points,spanGaps:true,borderColor:palette[i%palette.length],tension:0.2});
        i++;
      }

      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    }

    function updateTable(data){
      const tbody = $('#priceTable tbody'); tbody.innerHTML='';
      for(const s of state.selected){
        const arr = data[s] || [];
        const last = arr.length ? arr[arr.length-1].price : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s}</td><td>${last}</td>`;
        tbody.appendChild(tr);
      }
    }

   
 async function exportCSV(){
  if(!state.selected.length){ alert('Select at least one symbol to export'); return }
  try{
    const symbols = state.selected.join(',');
    const res = await fetch(
      `${API_BASE}/api/prices?symbols=${encodeURIComponent(symbols)}&provider=${state.provider}`, 
      { credentials: 'include' } 
    );
    if(!res.ok) throw new Error('Failed to fetch for export');
    const data = await res.json();
    const csv = buildCSV(data);
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href=url; 
    a.download = `stock-export-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(url);
  }catch(err){ alert('Export failed, try again') }
}
    function buildCSV(data){
 
      const rows = ['symbol,timestamp_iso,price'];
      for(const s of Object.keys(data)){
        for(const p of data[s]){
          const ts = new Date(p.ts).toISOString();
          rows.push(`${s},${ts},${p.price}`);
        }
      }
      return rows.join('\n');
    }

document.addEventListener('DOMContentLoaded', async () => {
    const signupBtn = document.getElementById('doSignup');
    const authBtn = document.getElementById('loginBtn');
    const cancelBtn = document.getElementById('cancelLogin');

    if (signupBtn) signupBtn.addEventListener('click', doSignUp);
    if (authBtn) authBtn.addEventListener('click', () => {
        if (state.authed) doSignOut();
        else showLogin();
    });
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        document.getElementById('signupForm').style.display = 'none';
    });

    // Check if user is already signed in
    await checkAuthStatus();

    updateAuthUI();
});

// Check if user is signed in
async function checkAuthStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/status`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        state.authed = data.authed; // API should return { authed: true/false }
    } catch (err) {
        state.authed = false;
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('loginBtn');
    const signupForm = document.getElementById('signupForm');
    if (!authBtn || !signupForm) return;

    if (state.authed) {
        authBtn.textContent = 'Sign Out';
        signupForm.style.display = 'none';
    } else {
        authBtn.textContent = 'Sign In';
        // ❌ don't auto-show here
        signupForm.style.display = 'none';  
    }
}

function showLogin() {
    document.getElementById('signupForm').style.display = 'block';
}


// SIGNUP
async function doSignUp() {
    try {
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!username || !password) {
            alert('Username and password cannot be empty');
            return;
        }

        const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');

        alert('Account created!');
        state.authed = true;
        updateAuthUI();
    } catch (err) {
        alert(err.message);
        console.error('Signup failed', err);
    }
}

// SIGNOUT
async function doSignOut() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Logout failed');

        state.authed = false;
        updateAuthUI();
        alert('Signed out');
    } catch (err) {
        alert(err.message);
    }
}



  async function searchStock(symbol) {
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(symbol)}`, {
      credentials:'include' 
    });
    if(!res.ok) throw new Error('search failed');
    const data = await res.json();
    console.log("Search result:", data);
    return data;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

async function getPrices(symbols) {
  try{
    const list = Array.isArray(symbols) ? symbols.join(',') : symbols;
    const res = await fetch(`${API_BASE}/api/prices?symbols=${encodeURIComponent(list)}`, {
      credentials:'include' 
    });
    if(!res.ok) throw new Error('prices fetch failed');
    const data = await res.json();
    console.log("Prices:", data);
    return data;
  }catch(err){ 
    console.error('Error fetching prices', err); 
    return null 
  }
}

    init();