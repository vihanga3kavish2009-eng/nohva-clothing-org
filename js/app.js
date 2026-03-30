// js/app.js
document.addEventListener("DOMContentLoaded", async () => {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('productsGrid');

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('nohvaCart')) || [];

    // Initialize Database
    try {
        await window.DB.init();
        allProducts = await window.DB.getAllProducts();
        // Sort newest first
        allProducts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 
    } catch (e) {
        console.error("Failed to load products:", e);
    } finally {
        if (loader) loader.style.display = 'none';
    }

    // Cart functions
    function addToCart(product) {
        cart.push(product);
        updateCartCount();
        saveCart();
    }

    function updateCartCount() {
        const cartBtn = document.querySelector('button.relative');
        const countEl = cartBtn.querySelector('span:last-child');
        countEl.textContent = cart.length;
    }

    function saveCart() {
        localStorage.setItem('nohvaCart', JSON.stringify(cart));
    }

    function renderCart() {
        const cartItemsEl = document.getElementById('cartItems');
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            return;
        }
        cartItemsEl.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.imageBase64}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Rs. ${parseFloat(item.price).toLocaleString()}</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: red; cursor: pointer;">&times;</button>
            </div>
        `).join('');
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartCount();
        saveCart();
        renderCart();
    };

    // Modal functions
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    document.querySelector('button.relative').addEventListener('click', () => {
        renderCart();
        cartModal.classList.add('show');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });

    checkoutBtn.addEventListener('click', () => {
        alert('Checkout functionality not implemented yet.');
    });

    const renderSliderProducts = () => {
        if (!grid) return;
        
        // Take top 6 newest arrivals for the slider
        const displayProducts = allProducts.slice(0, 6);

        if (displayProducts.length === 0) {
            // Keep the skeleton placeholder items if db is empty
            return;
        }

        grid.innerHTML = '';

        displayProducts.forEach(p => {
            const card = document.createElement('div');
            card.className = 'min-w-[70vw] md:min-w-[260px] lg:min-w-[280px] flex-shrink-0 snap-start group cursor-pointer';
            
            // Format price: assuming LKR but showing visually as a nice number
            const priceVal = parseFloat(p.price);
            
            card.innerHTML = `
                <div class="bg-nohvaGray aspect-[4/5] overflow-hidden mb-6 flex items-center justify-center p-8 relative">
                    <span class="absolute top-4 left-4 text-[10px] font-bold tracking-widest px-2 py-1 bg-white text-black uppercase shadow-sm">
                        ${p.category || 'Core'}
                    </span>
                    <img src="${p.imageBase64}" alt="${p.name}" class="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700">
                    <button onclick="addToCartFromSlider(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="absolute bottom-4 left-4 right-4 bg-nohvaYellow text-black text-[10px] font-bold uppercase tracking-widest py-2 opacity-0 group-hover:opacity-100 transition-opacity">ADD TO CART</button>
                </div>
                <div class="flex justify-between items-start pt-2">
                    <div class="pr-4">
                        <h3 class="font-heading font-black text-lg md:text-xl uppercase tracking-tight text-white group-hover:text-nohvaYellow transition-colors line-clamp-1">${p.name}</h3>
                        <p class="text-[10px] font-body text-gray-400 uppercase tracking-widest mt-1">${p.type || 'MONOLITH EDITION'}</p>
                    </div>
                    <p class="font-heading font-black text-sm text-nohvaYellow whitespace-nowrap">Rs. ${priceVal.toLocaleString()}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    window.addToCartFromSlider = function(product) {
        addToCart(product);
    };

    // Initial render
    renderSliderProducts();
    updateCartCount();
    
    
    // Auto-scroll slider feature (optional subtle movement)
    /*
    if(grid && allProducts.length > 2) {
        setInterval(() => {
            if(window.innerWidth > 768) {
                // grid.scrollBy({ left: 1, behavior: 'auto' });
            }
        }, 50);
    }
    */
});
