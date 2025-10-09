/* Auth modal + signup navigation */
(function(){
  const LOGIN_KEY = 'eshop-user';
  const $ = window.jQuery || function(sel, ctx){ return (ctx||document).querySelector(sel); };

  function currentUser(){
    try { return JSON.parse(localStorage.getItem(LOGIN_KEY)||'null'); } catch { return null; }
  }
  function setUser(u){ localStorage.setItem(LOGIN_KEY, JSON.stringify(u)); document.dispatchEvent(new CustomEvent('eshop:user', {detail:u})); }
  function clearUser(){ localStorage.removeItem(LOGIN_KEY); document.dispatchEvent(new CustomEvent('eshop:user', {detail:null})); }

  function ensureModal(){
    if(document.getElementById('auth-overlay')) return document.getElementById('auth-overlay');
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.className = 'auth-overlay d-none';
    overlay.innerHTML = `
      <div class="auth-backdrop"></div>
      <div class="card auth-modal surface-card">
        <div class="card-header bg-transparent">
          <h5 class="mb-0">Log In</h5>
          <button type="button" class="btn-close" aria-label="Close" data-auth-close></button>
        </div>
        <div class="card-body">
          <form id="login-form" novalidate>
            <div class="mb-3">
              <label class="form-label fw-semibold" for="login-email">Email</label>
              <input id="login-email" name="email" type="email" class="form-control" required placeholder="you@example.com" />
              <div class="invalid-feedback">Please enter a valid email.</div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold" for="login-password">Password</label>
              <input id="login-password" name="password" type="password" class="form-control" required minlength="6" />
              <div class="invalid-feedback">Password is required (min 6 chars).</div>
            </div>
            <button class="btn btn-primary w-100" type="submit">Log In</button>
            <div class="text-danger small mt-2 d-none" id="login-error">Invalid email or password.</div>
          </form>
          <div class="text-center mt-3 small">
            No account yet? <a href="#" id="open-signup">Sign Up</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    // Close handlers
    overlay.addEventListener('click', (e)=>{
      if(e.target.matches('.auth-backdrop') || e.target.closest('[data-auth-close]')) hide();
    });

    // Validation: use jQuery validate if available, else native
    function setupValidation(){
      const form = overlay.querySelector('#login-form');
      if(window.jQuery && window.jQuery.fn && window.jQuery.fn.validate){
        window.jQuery(form).validate({
          errorPlacement: function(error, element){
            error.attr('style', 'font-style: italic; color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; display: block;');
            error.insertAfter(element);
          },
          rules:{ email:{ required:true, email:true }, password:{ required:true, minlength:6 } },
          submitHandler: function(frm, ev){ ev.preventDefault(); doLogin(frm); }
        });
      } else {
        form.addEventListener('submit', (e)=>{
          e.preventDefault();
          if(!form.checkValidity()){ form.classList.add('was-validated'); return; }
          doLogin(form);
        });
      }
    }

    function doLogin(form){
      const email = form.email.value.trim();
      const password = form.password.value;
      const errEl = document.getElementById('login-error');
      if(errEl) errEl.classList.add('d-none');
      fetch('/api/login', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
        .then(r=> r.ok ? r.json() : r.json().then(x=>Promise.reject(x)))
        .then(user=>{ setUser(user); hide(); showToast('Logged in as '+user.email); })
        .catch(()=>{ if(errEl) errEl.classList.remove('d-none'); });
    }

    setupValidation();

    overlay.querySelector('#open-signup').addEventListener('click', (e)=>{
      e.preventDefault(); hide(); window.location.href = 'signup.html';
    });

    return overlay;
  }

  function show(){ ensureModal(); document.getElementById('auth-overlay').classList.remove('d-none'); document.body.classList.add('auth-modal-open'); }
  function hide(){ const el = document.getElementById('auth-overlay'); if(!el) return; el.classList.add('d-none'); document.body.classList.remove('auth-modal-open'); }

  function showToast(msg){
    let t = document.getElementById('auth-toast');
    if(!t){
      t = document.createElement('div'); t.id='auth-toast'; t.className='position-fixed bottom-0 end-0 p-3'; t.style.zIndex=1081;
      t.innerHTML = `<div class="toast align-items-center text-bg-success border-0 show" role="status" aria-live="polite" aria-atomic="true"><div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
      document.body.appendChild(t);
    }
    t.querySelector('.toast-body').textContent = msg;
    const toastEl = t.querySelector('.toast');
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), 2500);
  }

  function wireLoginButton(){
    const btn = document.getElementById('login-btn'); if(!btn) return;
    // Reflect current user state
    const user = currentUser();
    if(user){ btn.textContent = 'Log Out'; }
    btn.addEventListener('click', ()=>{
      const u = currentUser();
      if(u){ clearUser(); btn.textContent='Log In'; showToast('Logged out'); }
      else { show(); }
    });
    document.addEventListener('eshop:user', (e)=>{ btn.textContent = e.detail ? 'Log Out' : 'Log In'; });
  }

  document.addEventListener('DOMContentLoaded', ()=>{ ensureModal(); wireLoginButton(); });
})();
