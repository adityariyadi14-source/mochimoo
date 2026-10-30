const CART_KEY='mochimoo_cart_v1';
const money=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)||'[]')
    }
    catch(e) {
        return []
    }
}
function saveCart(cart) {
    localStorage.setItem(CART_KEY,JSON.stringify(cart));
    updateCartCount();
    renderBasket();
    renderDrawer()
}
function updateCartCount() {
    const count=getCart().reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count)
}
function showToast(msg) {
    let t=document.getElementById('toast');
    if(!t) {
        t=document.createElement('div');
        t.id='toast';
        t.className='toast';
        t.setAttribute('role','status');
        document.body.appendChild(t)
    }
    t.textContent=msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1800)
}
function addItem(card,qty=1) {
    const p= {
        id:card.dataset.id,name:card.dataset.name,price:Number(card.dataset.price),unit:card.dataset.unit||'pack',image:card.dataset.image,desc:card.dataset.desc||''
    }
    ;
    const cart=getCart();
    const found=cart.find(i=>i.id===p.id);
    if(found)found.qty+=qty;
    else {
        p.qty=qty;
        cart.push(p)
    }
    saveCart(cart);
    showToast(p.name+' added to your basket!')
}
document.querySelectorAll('.add-to-cart').forEach(btn=>btn.addEventListener('click',e=> {
    e.stopPropagation();const card=btn.closest('[data-id]');if(card)addItem(card)
}
));
function buildDrawer() {
    if(document.getElementById('cart-drawer'))return;
    const d=document.createElement('div');
    d.id='cart-drawer';
    d.className='cart-drawer';
    d.innerHTML=`<button class="drawer-backdrop" aria-label="Close basket"></button><aside class="drawer-panel" aria-label="Basket preview"><div class="drawer-head"><div><span class="eyebrow">YOUR LITTLE TREATS</span><h2 class="cute-font">Your basket</h2></div><button class="drawer-close" aria-label="Close basket">×</button></div><div id="drawer-items" class="drawer-items"></div><div class="drawer-foot"><div class="drawer-total"><span>Subtotal</span><strong id="drawer-total">Rp 0</strong></div><a class="btn" href="basket.html" style="width:100%">Go to checkout →</a><a class="drawer-continue" href="products.html">Continue shopping</a></div></aside>`;
    document.body.appendChild(d);
    d.querySelector('.drawer-backdrop').addEventListener('click',closeDrawer);
    d.querySelector('.drawer-close').addEventListener('click',closeDrawer)
}
function openDrawer() {
    buildDrawer();
    document.getElementById('cart-drawer').classList.add('open');
    renderDrawer()
}
function closeDrawer() {
    const d=document.getElementById('cart-drawer');
    if(d)d.classList.remove('open')
}
function renderDrawer() {
    const host=document.getElementById('drawer-items');
    if(!host)return;
    const cart=getCart();
    if(!cart.length) {
        host.innerHTML='<div class="drawer-empty"><img src="images/basket.png" alt=""><h3>Your basket is empty</h3><p>Pick a treat to start your order.</p><a class="btn" href="products.html">Browse treats</a></div>'
    }
    else {
        host.innerHTML=cart.map(i=>`<div class="drawer-item"><img src="${i.image}" alt=""><div class="drawer-item-info"><strong>${i.name}</strong><span>${money(i.price)} / ${i.unit}</span><div class="quantity-controls"><button type="button" data-drawer-action="minus" data-id="${i.id}">−</button><strong>${i.qty}</strong><button type="button" data-drawer-action="plus" data-id="${i.id}">+</button><button type="button" class="remove-btn" data-drawer-action="remove" data-id="${i.id}">Remove</button></div></div><b>${money(i.price*i.qty)}</b></div>`).join('');
        host.querySelectorAll('[data-drawer-action]').forEach(b=>b.addEventListener('click',()=> {
            let c=getCart(),i=c.find(x=>x.id===b.dataset.id);if(!i)return;if(b.dataset.drawerAction==='plus')i.qty++;else if(b.dataset.drawerAction==='minus')i.qty--;if(b.dataset.drawerAction==='remove'||i.qty<1)c=c.filter(x=>x.id!==b.dataset.id);saveCart(c)
        }
        ))
    }
    const total=getCart().reduce((s,i)=>s+i.price*i.qty,0);
    const el=document.getElementById('drawer-total');
    if(el)el.textContent=money(total)
}
document.querySelectorAll('.basket-link').forEach(a=>a.addEventListener('click',e=> {
    e.preventDefault();openDrawer()
}
));
function renderBasket() {
    const host=document.getElementById('basket-items');
    if(!host)return;
    const cart=getCart();
    host.innerHTML='';
    if(!cart.length) {
        host.innerHTML='<div class="empty-basket"><img src="images/basket.png" alt=""><h3>Your basket is waiting</h3><p>Add a few treats to get started.</p><a class="btn" style="margin-top:16px" href="products.html">Explore the menu</a></div>';
        document.getElementById('basket-total').textContent=money(0);
        return
    }
    cart.forEach(item=> {
        const row=document.createElement('div');row.className='basket-line';row.innerHTML=`<img src="${item.image}" alt=""><div><h3>${item.name}</h3><p>${money(item.price)} / ${item.unit}</p><div class="quantity-controls"><button type="button" data-action="minus">−</button><strong>${item.qty}</strong><button type="button" data-action="plus">+</button></div><button type="button" class="remove-btn" data-action="remove">Remove</button></div><strong>${money(item.price*item.qty)}</strong>`;row.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=> {
            let next=getCart();const target=next.find(i=>i.id===item.id);if(!target)return;if(b.dataset.action==='plus')target.qty++;if(b.dataset.action==='minus')target.qty--;if(b.dataset.action==='remove'||target.qty<=0)next=next.filter(i=>i.id!==item.id);saveCart(next)
        }
        ));host.appendChild(row)
    }
    );
    document.getElementById('basket-total').textContent=money(cart.reduce((s,i)=>s+i.price*i.qty,0))
}
const checkout=document.getElementById('checkout-form');
if(checkout)checkout.addEventListener('submit',e=> {
    e.preventDefault();const cart=getCart();if(!cart.length) {
        showToast('Add a product before checkout.');return
    }
    const d=new FormData(checkout);const lines=cart.map(i=>`- ${i.qty} x ${i.name} (${money(i.price*i.qty)})`);const total=cart.reduce((s,i)=>s+i.price*i.qty,0);const msg=`Halo mochimoo! Aku mau order:\n\n${lines.join('\n')}\n\nTOTAL: ${money(total)}\n\nNAMA: ${d.get('name')}\nNO. HP: ${d.get('phone')||'-'}\nALAMAT: ${d.get('address')}\nPENGIRIMAN: ${d.get('delivery')}\nPEMBAYARAN: ${d.get('payment')}\nCATATAN: ${d.get('notes')||'-'}\n\nMohon konfirmasi ketersediaan dan detail pesananku ya. Terima kasih!`;window.open('https://wa.me/628989900049?text='+encodeURIComponent(msg),'_blank','noopener')
}
);
function buildProductModal() {
    if(document.getElementById('product-modal'))return;
    const m=document.createElement('div');
    m.id='product-modal';
    m.className='product-modal';
    m.innerHTML='<button class="modal-shade" aria-label="Close details"></button><div class="product-modal-card" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close details">×</button><img class="modal-product-img" alt=""><div class="modal-product-copy"><span class="eyebrow">A MOCHIMOO FAVOURITE</span><h2></h2><p class="modal-desc"></p><strong class="modal-price"></strong><button class="btn modal-add">Add to basket +</button></div></div>';
    document.body.appendChild(m);
    m.querySelector('.modal-shade').onclick=()=>m.classList.remove('open');
    m.querySelector('.modal-close').onclick=()=>m.classList.remove('open');
    m.querySelector('.modal-add').onclick=()=> {
        const card=document.querySelector(`[data-id="${m.dataset.id}"]`);
        if(card)addItem(card);
        m.classList.remove('open')
    }
}
function showProduct(card) {
    buildProductModal();
    const m=document.getElementById('product-modal');
    m.dataset.id=card.dataset.id;
    m.querySelector('.modal-product-img').src=card.dataset.image;
    m.querySelector('.modal-product-img').alt=card.dataset.name;
    m.querySelector('h2').textContent=card.dataset.name;
    m.querySelector('.modal-desc').textContent=card.dataset.desc||'A little treat made for your happy moments.';
    m.querySelector('.modal-price').textContent=money(card.dataset.price);
    m.classList.add('open')
}
document.querySelectorAll('.product-detail-card').forEach(card=> {
    card.querySelector('.product-image-frame')?.addEventListener('click',()=>showProduct(card));card.querySelector('.product-card-title')?.addEventListener('click',()=>showProduct(card));card.querySelector('.product-image-frame')?.setAttribute('role','button');card.querySelector('.product-image-frame')?.setAttribute('tabindex','0');card.querySelector('.product-image-frame')?.addEventListener('keydown',e=> {
        if(e.key==='Enter'||e.key===' ') {
            e.preventDefault();showProduct(card)
        }
    }
    )
}
);
updateCartCount();
renderBasket();
buildDrawer();
renderDrawer();
// Wishlist, search, and category filters.
const WISHLIST_KEY='mochimoo_wishlist_v1';
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)||'[]')
    }
    catch(e) {
        return []
    }
}
function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY,JSON.stringify(items));
    syncWishlistButtons();
    renderWishlistPage()
}
function cardSnapshot(card) {
    return  {
        id:card.dataset.id,name:card.dataset.name,price:Number(card.dataset.price||0),unit:card.dataset.unit||'pack',image:card.dataset.image,desc:card.dataset.desc||'',seasonal:card.classList.contains('seasonal-product')
    }
}
function syncWishlistButtons() {
    const saved=new Set(getWishlist().map(i=>i.id));
    document.querySelectorAll('.product-detail-card[data-id]').forEach(card=> {
        const btn=card.querySelector('.wishlist-toggle');if(!btn)return;const yes=saved.has(card.dataset.id);btn.classList.toggle('is-saved',yes);btn.setAttribute('aria-pressed',String(yes));btn.setAttribute('aria-label',yes?'Remove from wishlist':'Save to wishlist');btn.textContent=yes?'♥':'♡'
    }
    )
}
function addWishlistButtons() {
    document.querySelectorAll('.product-detail-card[data-id]').forEach(card=> {
        if(card.classList.contains('seasonal-product')||card.querySelector('.wishlist-toggle'))return;const add=card.querySelector('.add-to-cart');if(!add)return;const wrap=document.createElement('div');wrap.className='product-card-actions';add.parentNode.insertBefore(wrap,add);wrap.appendChild(add);const b=document.createElement('button');b.type='button';b.className='wishlist-toggle';b.textContent='♡';b.setAttribute('aria-label','Save to wishlist');b.addEventListener('click',()=> {
            const list=getWishlist(),idx=list.findIndex(i=>i.id===card.dataset.id);if(idx>=0) {
                list.splice(idx,1);showToast('Removed from wishlist')
            }
            else {
                list.push(cardSnapshot(card));showToast('Saved to wishlist')
            }
            saveWishlist(list)
        }
        );wrap.appendChild(b)
    }
    )
}
function renderWishlistPage() {
    const host=document.getElementById('wishlist-items');
    const empty=document.getElementById('wishlist-empty');
    if(!host||!empty)return;
    const items=getWishlist();
    host.innerHTML='';
    empty.style.display=items.length?'none':'block';
    items.forEach(item=> {
        const card=document.createElement('article');card.className='product-detail-card';card.dataset.id=item.id;card.dataset.name=item.name;card.dataset.price=item.price;card.dataset.unit=item.unit;card.dataset.image=item.image;card.dataset.desc=item.desc;card.innerHTML=`<div class="product-image-frame"><img src="${item.image}" alt="${item.name}" loading="lazy"></div><p class="product-price">${item.price?money(item.price):'Price on request'}</p><h3 class="product-card-title">${item.name}</h3><p class="product-desc">${item.desc||''}</p><div class="product-card-actions"><button class="order-btn" type="button">Add to basket +</button><button class="wishlist-toggle is-saved" type="button" aria-label="Remove from wishlist">♥</button></div>`;card.querySelector('.order-btn').addEventListener('click',()=> {
            const source=document.querySelector(`.product-detail-card[data-id="${item.id}"]`);if(source)addItem(source);else {
                const cart=getCart(),found=cart.find(i=>i.id===item.id);if(found)found.qty++;else cart.push( {
                    ...item,qty:1
                }
                );saveCart(cart);showToast(item.name+' added to your basket!')
            }
        }
        );card.querySelector('.wishlist-toggle').addEventListener('click',()=>saveWishlist(getWishlist().filter(x=>x.id!==item.id)));host.appendChild(card)
    }
    )
}
function initProductFilters() {
    const input=document.getElementById('product-search');
    const chips=[...document.querySelectorAll('[data-filter]')];
    const cards=[...document.querySelectorAll('.product-detail-card[data-id]')].filter(c=>!c.classList.contains('seasonal-product'));
    let filter='all';
    function apply() {
        const q=(input?.value||'').trim().toLowerCase();
        let visible=0;
        cards.forEach(card=> {
            const category=card.closest('.product-category')?.id||'all';const matchesCategory=filter==='all'||category===filter;const matchesQuery=(card.dataset.name+' '+card.dataset.desc).toLowerCase().includes(q);const show=matchesCategory&&matchesQuery;card.style.display=show?'':'none';if(show)visible++
        }
        );
        const count=document.getElementById('product-results-count');
        if(count)count.textContent=visible+' product'+(visible===1?'':'s')+' found';
        document.querySelectorAll('.product-category').forEach(section=> {
            if(section.id==='desserts')return;const visibleCards=[...section.querySelectorAll('.product-detail-card')].some(c=>c.style.display!=='none');section.style.display=visibleCards?'':'none'
        }
        )
    }
    if(input)input.addEventListener('input',apply);
    chips.forEach(chip=>chip.addEventListener('click',()=> {
        filter=chip.dataset.filter;chips.forEach(c=>c.classList.toggle('active',c===chip));apply()
    }
    ));
    apply()
}
addWishlistButtons();
syncWishlistButtons();
renderWishlistPage();
initProductFilters();
