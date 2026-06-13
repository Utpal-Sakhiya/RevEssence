const STORAGE_KEYS = {
  leads: 'revessence-leads',
  products: 'revessence-products',
  adminLoggedIn: 'revessence-admin-logged-in'
};

const adminCredentials = {
  username: 'admin',
  password: 'revessence2026'
};

const defaultProducts = [
  {
    id: 'product-1',
    title: 'Barrier B3 Cleanser',
    kicker: 'Barrier support focused daily cleanser',
    image: 'p1.jpeg',
    audience: 'Dry to normal sensitive skin',
    description: 'A soft-foam cleanser designed to cleanse effectively while supporting barrier comfort in hard water conditions.'
  },
  {
    id: 'product-2',
    title: 'Clarity B3 Cleanser',
    kicker: 'Gentle cleansing for oilier skin',
    image: 'p2.jpeg',
    audience: 'Oily + combination sensitive skin',
    description: 'A cleaner-feeling daily cleanser tuned for oily and combination skin that still needs barrier-friendly care.'
  },
  {
    id: 'product-3',
    title: 'CeraFluid Balance Spray Moisturiser',
    kicker: 'Barrier milk technology',
    image: 'p3.jpeg',
    audience: 'Oil control · Barrier support · Hydration',
    description: 'A lightweight spray moisturiser for everyday balance, comfort, and quick hydration without heaviness.'
  },
  {
    id: 'product-4',
    title: 'CeraFluid Restore Spray Moisturiser',
    kicker: 'Barrier milk technology',
    image: 'p4.jpeg',
    audience: 'Dehydrated skin',
    description: 'A restore-focused spray moisturiser for skin that needs more cushion, hydration, and barrier repair support.'
  }
];

const state = {
  leads: loadJson(STORAGE_KEYS.leads, []),
  products: loadJson(STORAGE_KEYS.products, defaultProducts),
  adminLoggedIn: sessionStorage.getItem(STORAGE_KEYS.adminLoggedIn) === 'true'
};

const elements = {
  heroProductStack: document.getElementById('heroProductStack'),
  productGrid: document.getElementById('productGrid'),
  waitlistForm: document.getElementById('waitlistForm'),
  formNote: document.getElementById('formNote'),
  openAdminButton: document.getElementById('openAdminButton'),
  closeAdminButton: document.getElementById('closeAdminButton'),
  adminOverlay: document.getElementById('adminOverlay'),
  loginView: document.getElementById('loginView'),
  dashboardView: document.getElementById('dashboardView'),
  adminLoginForm: document.getElementById('adminLoginForm'),
  adminUsername: document.getElementById('adminUsername'),
  adminPassword: document.getElementById('adminPassword'),
  leadCount: document.getElementById('leadCount'),
  productCount: document.getElementById('productCount'),
  leadTableBody: document.getElementById('leadTableBody'),
  productEditor: document.getElementById('productEditor'),
  addProductButton: document.getElementById('addProductButton'),
  saveProductsButton: document.getElementById('saveProductsButton'),
  exportLeadsButton: document.getElementById('exportLeadsButton'),
  resetDemoButton: document.getElementById('resetDemoButton'),
  logoutButton: document.getElementById('logoutButton')
};

renderProducts();
renderHeroStack();
renderAdminState();
bindEvents();

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderProducts() {
  elements.productGrid.innerHTML = '';

  state.products.forEach((product) => {
    const template = document.getElementById('productCardTemplate');
    const node = template.content.cloneNode(true);

    node.querySelector('.product-image').src = product.image;
    node.querySelector('.product-image').alt = product.title;
    node.querySelector('.product-kicker').textContent = product.kicker;
    node.querySelector('h3').textContent = product.title;
    node.querySelector('.product-description').textContent = `${product.description} ${product.audience ? `Best suited for ${product.audience}.` : ''}`;

    elements.productGrid.appendChild(node);
  });
}

function renderHeroStack() {
  elements.heroProductStack.innerHTML = '';

  state.products.forEach((product) => {
    const image = document.createElement('img');
    image.className = 'stack-item';
    image.src = product.image;
    image.alt = product.title;
    elements.heroProductStack.appendChild(image);
  });
}

function renderAdminState() {
  elements.leadCount.textContent = state.leads.length;
  elements.productCount.textContent = state.products.length;

  if (state.adminLoggedIn) {
    showDashboard();
    renderLeads();
    renderProductEditor();
  } else {
    showLogin();
  }
}

function showLogin() {
  elements.loginView.classList.remove('hidden');
  elements.dashboardView.classList.add('hidden');
}

function showDashboard() {
  elements.loginView.classList.add('hidden');
  elements.dashboardView.classList.remove('hidden');
}

function bindEvents() {
  elements.waitlistForm.addEventListener('submit', handleWaitlistSubmit);
  elements.openAdminButton.addEventListener('click', openAdminModal);
  elements.closeAdminButton.addEventListener('click', closeAdminModal);
  elements.adminOverlay.addEventListener('click', handleOverlayClick);
  elements.adminLoginForm.addEventListener('submit', handleAdminLogin);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.addProductButton.addEventListener('click', addProduct);
  elements.saveProductsButton.addEventListener('click', saveProducts);
  elements.exportLeadsButton.addEventListener('click', exportLeads);
  elements.resetDemoButton.addEventListener('click', resetDemoData);

  window.addEventListener('keydown', handleEscape);
}

function handleWaitlistSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const entry = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    skinType: String(formData.get('skinType') || '').trim(),
    city: String(formData.get('city') || '').trim()
  };

  state.leads = [entry, ...state.leads];
  saveJson(STORAGE_KEYS.leads, state.leads);
  elements.waitlistForm.reset();
  elements.formNote.textContent = 'Thanks. Your waitlist response was saved locally and is now visible in admin.';

  if (state.adminLoggedIn) {
    renderLeads();
    elements.leadCount.textContent = state.leads.length;
  }
}

function openAdminModal() {
  elements.adminOverlay.classList.add('open');
  elements.adminOverlay.setAttribute('aria-hidden', 'false');
  if (!state.adminLoggedIn) {
    elements.adminUsername.focus();
  }
}

function closeAdminModal() {
  elements.adminOverlay.classList.remove('open');
  elements.adminOverlay.setAttribute('aria-hidden', 'true');
}

function handleOverlayClick(event) {
  if (event.target === elements.adminOverlay) {
    closeAdminModal();
  }
}

function handleEscape(event) {
  if (event.key === 'Escape' && elements.adminOverlay.classList.contains('open')) {
    closeAdminModal();
  }
}

function handleAdminLogin(event) {
  event.preventDefault();

  const username = elements.adminUsername.value.trim();
  const password = elements.adminPassword.value;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    state.adminLoggedIn = true;
    sessionStorage.setItem(STORAGE_KEYS.adminLoggedIn, 'true');
    renderAdminState();
    elements.adminPassword.value = '';
    return;
  }

  elements.adminLoginForm.querySelector('.form-note').textContent = 'Invalid credentials. Try admin / revessence2026.';
}

function handleLogout() {
  state.adminLoggedIn = false;
  sessionStorage.removeItem(STORAGE_KEYS.adminLoggedIn);
  renderAdminState();
}

function renderLeads() {
  elements.leadTableBody.innerHTML = '';

  if (!state.leads.length) {
    elements.leadTableBody.innerHTML = '<tr><td colspan="6">No waitlist submissions yet.</td></tr>';
    return;
  }

  state.leads.forEach((lead, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.phone)}</td>
      <td>${escapeHtml(lead.skinType || '—')}</td>
      <td>${escapeHtml(lead.city || '—')}</td>
      <td><button class="ghost-button small danger-button" type="button" data-lead-index="${index}">Delete</button></td>
    `;
    elements.leadTableBody.appendChild(row);
  });

  elements.leadTableBody.querySelectorAll('[data-lead-index]').forEach((button) => {
    button.addEventListener('click', () => deleteLead(Number(button.dataset.leadIndex)));
  });
}

function deleteLead(index) {
  state.leads.splice(index, 1);
  saveJson(STORAGE_KEYS.leads, state.leads);
  renderLeads();
  elements.leadCount.textContent = state.leads.length;
}

function renderProductEditor() {
  elements.productEditor.innerHTML = '';

  state.products.forEach((product, index) => {
    const block = document.createElement('article');
    block.className = 'editor-item';
    block.dataset.productIndex = index;
    block.innerHTML = `
      <div class="editor-fields">
        <div class="editor-grid-2">
          <label>
            Title
            <input type="text" data-field="title" value="${escapeAttribute(product.title)}" />
          </label>
          <label>
            Kicker
            <input type="text" data-field="kicker" value="${escapeAttribute(product.kicker)}" />
          </label>
        </div>
        <div class="editor-grid-2">
          <label>
            Image Path
            <input type="text" data-field="image" value="${escapeAttribute(product.image)}" />
          </label>
          <label>
            Audience
            <input type="text" data-field="audience" value="${escapeAttribute(product.audience)}" />
          </label>
        </div>
        <label>
          Description
          <textarea rows="4" data-field="description">${escapeHtml(product.description)}</textarea>
        </label>
      </div>
      <div class="editor-actions">
        <button class="ghost-button small danger-button" type="button" data-action="remove-product">Remove</button>
      </div>
    `;
    elements.productEditor.appendChild(block);
  });

  elements.productEditor.querySelectorAll('[data-action="remove-product"]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.editor-item');
      const index = Number(item.dataset.productIndex);
      state.products.splice(index, 1);
      renderProductEditor();
    });
  });
}

function addProduct() {
  state.products.push({
    id: crypto.randomUUID(),
    title: 'New Product',
    kicker: 'Describe the positioning',
    image: 'p1.jpeg',
    audience: 'Skin type / use case',
    description: 'Edit this copy in the admin panel.'
  });
  renderProductEditor();
  elements.productCount.textContent = state.products.length;
}

function saveProducts() {
  const editedProducts = Array.from(elements.productEditor.querySelectorAll('.editor-item')).map((item, index) => ({
    id: state.products[index]?.id || crypto.randomUUID(),
    title: item.querySelector('[data-field="title"]').value.trim(),
    kicker: item.querySelector('[data-field="kicker"]').value.trim(),
    image: item.querySelector('[data-field="image"]').value.trim(),
    audience: item.querySelector('[data-field="audience"]').value.trim(),
    description: item.querySelector('[data-field="description"]').value.trim()
  }));

  state.products = editedProducts;
  saveJson(STORAGE_KEYS.products, state.products);
  renderProducts();
  renderHeroStack();
  elements.productCount.textContent = state.products.length;
  elements.formNote.textContent = 'Products saved. The live page now uses the updated list from local storage.';
}

function exportLeads() {
  const blob = new Blob([JSON.stringify(state.leads, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'revessence-leads.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetDemoData() {
  state.products = structuredClone(defaultProducts);
  state.leads = [];
  saveJson(STORAGE_KEYS.products, state.products);
  saveJson(STORAGE_KEYS.leads, state.leads);
  renderProducts();
  renderHeroStack();
  renderLeads();
  renderProductEditor();
  elements.leadCount.textContent = state.leads.length;
  elements.productCount.textContent = state.products.length;
  elements.formNote.textContent = 'Demo data restored.';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}
