// js/admin.js

document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication
    if (!sessionStorage.getItem('nohva_admin_logged_in')) {
        window.location.href = 'admin.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    
    // Form elements
    const addForm = document.getElementById('addForm');
    const pName = document.getElementById('product-name');
    const pCategory = document.getElementById('core-category');
    const pType = document.getElementById('item-type');
    const pSize = document.getElementById('available-size');
    const pPrice = document.getElementById('retail-price');

    // UI Elements for Upload
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const previewImage = document.getElementById('previewImage');
    const uploadProgress = document.getElementById('uploadProgress');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    const imageUrlInput = document.getElementById('imageUrlInput');
    const loadUrlBtn = document.getElementById('loadUrlBtn');
    const urlPreviewImage = document.getElementById('urlPreviewImage');
    const urlPlaceholder = document.getElementById('urlPlaceholder');
    const imageResult = document.getElementById('imageResult');

    // Table elements
    const inventoryList = document.getElementById('inventoryList');

    // CSV Import elements
    const csvFileInput = document.getElementById('csvFileInput');
    const selectCsvBtn = document.getElementById('selectCsvBtn');
    const csvStatus = document.getElementById('csvStatus');
    const csvFileName = document.getElementById('csvFileName');
    const importBtn = document.getElementById('importBtn');

    // Initialize Database
    try {
        const success = await DB.init();
        if (!success) {
            throw new Error("Supabase initialization failed. Check your API settings.");
        }
        loadInventory();
    } catch (e) {
        console.error("Failed to load DB", e);
        alert("Database Connection Error: " + e.message);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('nohva_admin_logged_in');
            window.location.href = 'admin.html';
        });
    }

    /* --- Tab Switching Logic --- */
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Switch tabs UI
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Reset state if needed
            // Keep the imageResult value if it exists, though it might be confusing
        });
    });

    /* --- File Upload Logic --- */
    uploadZone.addEventListener('click', () => fileInput.click());
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    changeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFileUpload();
        imageResult.value = '';
    });

    function resetFileUpload() {
        previewImage.src = '';
        previewImage.classList.remove('visible');
        uploadZone.classList.remove('has-image');
        uploadProgress.style.width = '0%';
        fileInput.value = '';
    }

    fileInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
        }

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.classList.add('visible');
            uploadZone.classList.add('has-image');
        }
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append('image', file);

        try {
            uploadProgress.style.width = '30%';
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            const data = await response.json();
            uploadProgress.style.width = '100%';
            imageResult.value = data.imageUrl; // Current server URL
            console.log("Uploaded to:", data.imageUrl);
        } catch (error) {
            console.error(error);
            alert("Failed to upload image to server.");
            resetFileUpload();
        }
    });

    /* --- Drag & Drop --- */
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    uploadZone.addEventListener('dragover', () => uploadZone.classList.add('dragover'));
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });

    /* --- URL Load Logic --- */
    function loadUrlPreview() {
        const url = imageUrlInput.value.trim();
        if (!url) {
            urlPreviewImage.classList.remove('visible');
            urlPlaceholder.style.display = 'block';
            imageResult.value = '';
            return;
        }

        urlPlaceholder.style.display = 'none';
        urlPreviewImage.src = url;
        urlPreviewImage.classList.add('visible');
        
        urlPreviewImage.onerror = () => {
            urlPreviewImage.classList.remove('visible');
            urlPlaceholder.textContent = "Failed to load image. Check URL.";
            urlPlaceholder.style.display = 'block';
            urlPlaceholder.classList.add('text-error');
            imageResult.value = '';
        };
        
        urlPreviewImage.onload = () => {
            urlPlaceholder.classList.remove('text-error');
            urlPlaceholder.textContent = "Preview will appear here";
            imageResult.value = url;
            console.log("Using External URL:", url);
        };
    }

    loadUrlBtn.addEventListener('click', loadUrlPreview);
    
    // Auto-load on paste/input with debounce
    let urlTimeout;
    imageUrlInput.addEventListener('input', () => {
        clearTimeout(urlTimeout);
        urlTimeout = setTimeout(loadUrlPreview, 500);
    });

    imageUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadUrlPreview();
        }
    });

    /* --- Tab Switching Logic (Updated) --- */
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Clear result when switching to avoid confusion
            imageResult.value = '';
            // Reset both previews if preferred, or keep them? 
            // Let's reset the other one to be safe.
            if (tabId === 'url') resetFileUpload();
            else {
                imageUrlInput.value = '';
                urlPreviewImage.classList.remove('visible');
                urlPlaceholder.style.display = 'block';
            }
        });
    });

    /* --- CSV Import Logic --- */
    selectCsvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            if (!file.name.endsWith('.csv')) {
                alert("Please select a CSV file.");
                return;
            }
            csvFileName.textContent = file.name;
            csvStatus.classList.remove('hidden');
            importBtn.classList.remove('hidden');
        }
    });

    importBtn.addEventListener('click', () => {
        alert("Import functionality not yet implemented.");
    });

    /* --- Add Form Submission --- */
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const imgVal = imageResult.value;
        if(!imgVal) {
            alert("Please provide a product image (upload or URL)!");
            return;
        }

        const product = {
            name: pName.value.trim(),
            category: pCategory.value,
            type: pType.value.trim(),
            size: pSize.value.trim(),
            price: parseFloat(pPrice.value),
            imageBase64: imgVal // We use imageBase64 as the field name to stay compatible with existing DB logic
        };

        const submitBtn = document.getElementById('commit-btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;
        
        try {
            await DB.addProduct(product);
            
            // Success reset
            alert("Product added successfully!");
            addForm.reset();
            imageResult.value = '';
            resetFileUpload();
            
            imageUrlInput.value = '';
            urlPreviewImage.classList.remove('visible');
            urlPlaceholder.style.display = 'block';
            
            await loadInventory();
        } catch (e) {
            console.error("Error saving to database", e);
            alert("Failed to save product.");
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    /* --- Inventory Table & Stats --- */
    const totalProductsStat = document.getElementById('totalProductsStat');
    const totalRevenueStat = document.getElementById('totalRevenueStat');

    async function loadInventory() {
        if (!inventoryList) return;
        inventoryList.innerHTML = '';
        const items = await DB.getAllProducts();
        
        // Sort newest first
        items.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Update Stats
        if (totalProductsStat) {
            totalProductsStat.innerText = items.length;
        }
        if (totalRevenueStat) {
            const revenue = items.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
            totalRevenueStat.innerText = 'LKR ' + (revenue > 1000 ? (revenue/1000).toFixed(1) + 'K' : revenue.toLocaleString());
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-surface-container-low transition-colors duration-300 group";
            tr.innerHTML = `
                <td class="px-8 py-4">
                    <div class="w-12 h-16 bg-surface-container relative">
                        <img class="w-full h-full object-cover" src="${item.imageBase64}" alt="img" onerror="this.src='https://placehold.co/100x150?text=No+Image'">
                    </div>
                </td>
                <td class="px-8 py-4">
                    <p class="text-xs font-bold uppercase tracking-tight">${item.name}</p>
                    <p class="text-[10px] text-secondary uppercase font-light tracking-widest">${item.id || 'NVA'}</p>
                </td>
                <td class="px-8 py-4">
                    <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-surface-container-high">${item.category}</span>
                </td>
                <td class="px-8 py-4">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-secondary">${item.type || 'N/A'}</p>
                </td>
                <td class="px-8 py-4">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-secondary">${item.size}</p>
                </td>
                <td class="px-8 py-4">
                    <p class="text-xs font-bold">LKR ${parseFloat(item.price).toLocaleString()}</p>
                </td>
                <td class="px-8 py-4 text-right">
                    <div class="flex justify-end space-x-4">
                        <button class="delete-btn text-secondary hover:text-error transition-colors" data-id="${item.id}">
                            <span class="material-symbols-outlined text-sm pointer-events-none">delete</span>
                        </button>
                    </div>
                </td>
            `;
            inventoryList.appendChild(tr);
        });
    }

    // Delegation for delete buttons
    inventoryList.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            const id = btn.dataset.id;
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    await DB.deleteProduct(id);
                    await loadInventory();
                } catch (err) {
                    console.error('Delete error:', err);
                    alert('Error deleting product.');
                }
            }
        }
    });
});
