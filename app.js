/* E-Shop Demo JS (no external dependencies) */
(function(){
  const STORAGE_KEY = 'eshop-cart-v1';
  const CATALOG = [
    { id: 'chair-1', name: 'Elegant Chair', price: 99, category: 'Furniture', featured: true, img: 'https://picsum.photos/300/200?chair' },
    { id: 'lamp-1', name: 'Smart Lamp', price: 49, category: 'Lighting', featured: true, img: 'https://picsum.photos/300/200?lamp' },
    { id: 'desk-1', name: 'Modern Desk', price: 199, category: 'Furniture', featured: true, img: 'https://picsum.photos/300/200?desk' },
    { id: 'headphones-1', name: 'Wireless Headphones', price: 149, category: 'Electronics', featured: false, img: 'https://picsum.photos/300/200?headphones' },
    { id: 'plant-1', name: 'Decorative Plant', price: 25, category: 'Decor', featured: false, img: 'https://picsum.photos/300/200?plant' },
    { id: 'mug-1', name: 'Ceramic Mug', price: 15, category: 'Kitchen', featured: false, img: 'https://picsum.photos/300/200?mug' },
    { id: 'notebook-1', name: 'Premium Notebook', price: 12, category: 'Stationery', featured: false, img: 'https://picsum.photos/300/200?notebook' },
    { id: 'backpack-1', name: 'Urban Backpack', price: 89, category: 'Accessories', featured: false, img: 'https://picsum.photos/300/200?backpack' },
    { id: 'bottle-1', name: 'Steel Water Bottle', price: 29, category: 'Accessories', featured: false, img: 'https://picsum.photos/300/200?bottle' }
  ];

  function loadCart(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; }
  }
  function saveCart(cart){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); updateCartCount(cart); }
  function updateCartCount(cart){
    const el = document.getElementById('cart-count');
    if(el) el.textContent = cart.reduce((a,i)=>a+i.qty,0);
  }
  function formatMoney(n){ return `$${n.toFixed(2)}`; }
  function getProduct(id){ return CATALOG.find(p=>p.id===id); }

  // Shared state
  let CART = loadCart();

  function addToCart(id){
    const existing = CART.find(i=>i.id===id);
    if(existing) existing.qty++; else CART.push({id, qty:1});
    saveCart(CART);
  }
  function removeFromCart(id){
    CART = CART.filter(i=>i.id!==id); saveCart(CART);
  }
  function setQty(id, qty){
    const item = CART.find(i=>i.id===id); if(!item) return; item.qty = Math.max(1, qty); saveCart(CART);
  }
  function clearCart(){ CART = []; saveCart(CART); }

  function productCard(product){
    return `<div class="col-sm-6 col-md-4 col-lg-3"><div class="card h-100 shadow-sm">
      <img src="${product.img}" class="card-img-top" alt="${product.name}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mb-1">${product.name}</h5>
        <p class="text-primary fw-semibold mb-2">${formatMoney(product.price)}</p>
        <button data-add="${product.id}" class="btn btn-sm btn-primary mt-auto">Add to Cart</button>
      </div>
    </div></div>`;
  }

  function bindAddButtons(container){
    container.querySelectorAll('[data-add]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        addToCart(btn.getAttribute('data-add'));
        btn.blur();
      });
    });
  }

  function renderFeatured(){
    const wrap = document.getElementById('featured-products'); if(!wrap) return;
    const featured = CATALOG.filter(p=>p.featured).slice(0,3);
    wrap.innerHTML = featured.map(productCard).join('');
    bindAddButtons(wrap);
  }

  function renderCatalog(){
    const grid = document.getElementById('product-grid'); if(!grid) return;
    const search = document.getElementById('search');
    const catSel = document.getElementById('filter-category');
    const sortSel = document.getElementById('sort');
    const noRes = document.getElementById('no-results');

    // Populate categories
    const cats = [...new Set(CATALOG.map(p=>p.category))];
    cats.sort().forEach(c=>{ if(![...catSel.options].some(o=>o.value===c)) catSel.append(new Option(c,c)); });

    function apply(){
      let list = [...CATALOG];
      const q = (search.value||'').trim().toLowerCase();
      const cat = catSel.value;
      if(q) list = list.filter(p=>p.name.toLowerCase().includes(q));
      if(cat) list = list.filter(p=>p.category===cat);
      switch(sortSel.value){
        case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
        case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
        case 'alpha': list.sort((a,b)=>a.name.localeCompare(b.name)); break;
        default: list.sort((a,b)=> (b.featured?1:0)-(a.featured?1:0));
      }
      grid.innerHTML = list.map(productCard).join('');
      bindAddButtons(grid);
      noRes.classList.toggle('d-none', list.length>0);
    }

    ['input','change'].forEach(ev=>{
      search.addEventListener(ev, apply);
      catSel.addEventListener(ev, apply);
      sortSel.addEventListener(ev, apply);
    });
    document.getElementById('reset').addEventListener('click', ()=>{ search.value=''; catSel.value=''; sortSel.value='featured'; apply(); });
    apply();
  }

  function renderCart(){
    const wrap = document.getElementById('cart-items'); if(!wrap) return;
    const empty = document.getElementById('cart-empty');
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout');
    const clearBtn = document.getElementById('clear-cart');
    const checkoutMsg = document.getElementById('checkout-msg');

    function draw(){
      if(CART.length===0){
        wrap.innerHTML='';
        empty.classList.remove('d-none');
        checkoutBtn.disabled = clearBtn.disabled = true;
      } else {
        empty.classList.add('d-none');
        wrap.innerHTML = CART.map(item=>{
          const p = getProduct(item.id); if(!p) return '';
          return `<div class="card shadow-sm"><div class="card-body d-flex align-items-center gap-3 flex-wrap">
            <img src="${p.img}" alt="${p.name}" class="rounded" style="width:90px;height:60px;object-fit:cover;">
            <div class="flex-grow-1">
              <h5 class="mb-1">${p.name}</h5>
              <div class="small text-muted">${formatMoney(p.price)} each</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <input type="number" min="1" value="${item.qty}" data-qty="${item.id}" class="form-control form-control-sm" style="width:80px;" />
              <button class="btn btn-outline-danger btn-sm" data-remove="${item.id}">×</button>
            </div>
            <div class="ms-auto fw-semibold">${formatMoney(p.price*item.qty)}</div>
          </div></div>`;
        }).join('');
        checkoutBtn.disabled = clearBtn.disabled = false;
      }
      const subtotal = CART.reduce((a,i)=> a + (getProduct(i.id)?.price||0)*i.qty, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      subtotalEl.textContent = formatMoney(subtotal);
      taxEl.textContent = formatMoney(tax);
      totalEl.textContent = formatMoney(total);
      updateCartCount(CART);
    }

    wrap.addEventListener('input', e=>{
      const id = e.target.getAttribute('data-qty');
      if(id) setQty(id, parseInt(e.target.value,10)||1);
      draw();
    });
    wrap.addEventListener('click', e=>{
      const btn = e.target.closest('[data-remove]');
      if(btn){ removeFromCart(btn.getAttribute('data-remove')); draw(); }
    });
    clearBtn.addEventListener('click', ()=>{ clearCart(); draw(); });
    checkoutBtn.addEventListener('click', ()=>{ checkoutMsg.classList.remove('d-none'); clearCart(); draw(); setTimeout(()=> checkoutMsg.classList.add('d-none'), 2500); });
    draw();
  }

  function aboutStats(){
    const pEl = document.getElementById('stat-products');
    const cEl = document.getElementById('stat-categories');
    const ciEl = document.getElementById('stat-cart-items');
    if(pEl) pEl.textContent = CATALOG.length;
    if(cEl) cEl.textContent = new Set(CATALOG.map(p=>p.category)).size;
    if(ciEl) ciEl.textContent = CART.reduce((a,i)=>a+i.qty,0);
  }

  function contactForm(){
    const form = document.getElementById('contact-form'); if(!form) return;
    // If jQuery Validation is present, let it manage submission/validation to avoid duplicate handlers
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.validate) {
      return;
    }
    form.addEventListener('submit', e=>{
      e.preventDefault();
      // Form submission logic would go here
      form.reset();
    });
  }

  // Page initializers
  window.Eshop = {
    pages: {
      home(){ renderFeatured(); updateCartCount(CART); },
      products(){ renderCatalog(); updateCartCount(CART); },
      cart(){ renderCart(); },
      about(){ aboutStats(); updateCartCount(CART); },
      contact(){ contactForm(); updateCartCount(CART); }
    }
  };

  // Auto-detect page by body data attribute in future (simpler: look for known anchor)
  document.addEventListener('DOMContentLoaded', ()=>{
    // If featured products container exists treat as home
    if(document.getElementById('featured-products')) window.Eshop.pages.home();
  });

  // Initial badge update
  updateCartCount(CART);
})();
