// Simple Express server to store accounts in accounts.json
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'accounts.json');

app.use(express.json());
app.use(express.static(__dirname));

function loadAccounts(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]'); } catch { return []; }
}
function saveAccounts(list){ fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2)); }

app.post('/api/signup', (req, res)=>{
  const { name, email, password } = req.body || {};
  if(!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  // Very naive uniqueness check
  const accounts = loadAccounts();
  if(accounts.some(a=> a.email.toLowerCase() === String(email).toLowerCase())){
    return res.status(409).json({ message: 'Email already exists' });
  }
  // WARNING: In a real app, never store raw passwords. Use hashing (bcrypt) and validation.
  const record = { id: Date.now(), name, email, password };
  accounts.push(record);
  saveAccounts(accounts);
  res.json({ ok: true, id: record.id });
});

// Login requires an existing account with matching password
app.post('/api/login', (req, res)=>{
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const accounts = loadAccounts();
  const acc = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase());
  if(!acc || acc.password !== password){
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  // Return user profile without password
  const { id, name } = acc;
  res.json({ id, name, email: acc.email });
});

app.get('/api/accounts', (req, res)=>{ res.json(loadAccounts()); });

app.listen(PORT, ()=> console.log(`Auth server running at http://localhost:${PORT}`));
