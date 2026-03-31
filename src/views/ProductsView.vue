<template>
  <div class="products-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="prod-navbar">
      <div class="prod-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="prod-logo" alt="Scanly" />
        <span class="prod-badge">Admin</span>
        <span class="prod-breadcrumb">/ Produkte</span>
      </div>
      <button type="button" class="prod-back-btn" @click="$router.push('/admin')">
        <svg viewBox="0 0 24 24" class="prod-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="prod-main">
      <div class="prod-header">
        <h1 class="prod-title">Produkte verwalten</h1>
        <p class="prod-subtitle">Produkte hinzufügen, bearbeiten oder entfernen</p>
      </div>

      <!-- Action Cards -->
      <div class="prod-actions">
        <div class="prod-action-card prod-action-card--add" @click="openModal('add')">
          <div class="prod-action-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <h3 class="prod-action-title">Produkt hinzufügen</h3>
          <p class="prod-action-desc">Neues Produkt zum Katalog hinzufügen</p>
        </div>

        <div class="prod-action-card prod-action-card--edit" @click="openModal('edit')">
          <div class="prod-action-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          <h3 class="prod-action-title">Produkt bearbeiten</h3>
          <p class="prod-action-desc">Bestehende Produkte und Preise ändern</p>
        </div>

        <div class="prod-action-card prod-action-card--remove" @click="openModal('remove')">
          <div class="prod-action-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </div>
          <h3 class="prod-action-title">Produkt entfernen</h3>
          <p class="prod-action-desc">Produkte aus dem Katalog löschen</p>
        </div>

        <div class="prod-action-card prod-action-card--db" @click="loadAllProducts">
          <div class="prod-action-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zM6 17v-2.42c1.23.8 3.38 1.42 6 1.42s4.77-.62 6-1.42V17c0 .5-2.13 2-6 2s-6-1.5-6-2zm0-5v-2.42c1.23.8 3.38 1.42 6 1.42s4.77-.62 6-1.42V12c0 .5-2.13 2-6 2s-6-1.5-6-2z"/>
            </svg>
          </div>
          <h3 class="prod-action-title">Produktdatenbank</h3>
          <p class="prod-action-desc">Komplette Produktliste anzeigen und durchsuchen</p>
        </div>
      </div>

      <!-- Product Database Section -->
      <Transition name="db-fade">
        <div v-if="showDatabase" class="prod-db-section">
          <div class="prod-db-header">
            <h2 class="prod-db-title">
              <svg viewBox="0 0 24 24" fill="currentColor" class="prod-db-title-icon">
                <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zM6 17v-2.42c1.23.8 3.38 1.42 6 1.42s4.77-.62 6-1.42V17c0 .5-2.13 2-6 2s-6-1.5-6-2zm0-5v-2.42c1.23.8 3.38 1.42 6 1.42s4.77-.62 6-1.42V12c0 .5-2.13 2-6 2s-6-1.5-6-2z"/>
              </svg>
              Produktdatenbank
              <span class="prod-db-count">{{ filteredProducts.length }} Produkte</span>
            </h2>
            <button class="prod-btn prod-btn--secondary prod-db-close-btn" @click="showDatabase = false">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              Schließen
            </button>
          </div>

          <!-- Filters -->
          <div class="prod-db-filters">
            <div class="prod-db-search">
              <svg viewBox="0 0 24 24" fill="currentColor" class="prod-db-search-icon"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input
                v-model="dbSearchQuery"
                type="text"
                class="prod-db-search-input"
                placeholder="Nach Produktname oder EAN suchen…"
              />
              <button v-if="dbSearchQuery" class="prod-db-search-clear" @click="dbSearchQuery = ''">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div class="prod-db-category-filter">
              <button
                v-for="cat in dbCategories"
                :key="cat.value"
                class="prod-db-cat-btn"
                :class="{ 'prod-db-cat-btn--active': dbCategoryFilter === cat.value }"
                @click="dbCategoryFilter = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="dbLoading" class="prod-db-loading">
            <span class="prod-spinner prod-spinner--lg"></span>
            <p>Produkte werden geladen…</p>
          </div>

          <!-- Error -->
          <div v-else-if="dbError" class="prod-search-error" style="margin-top: 0;">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <p>{{ dbError }}</p>
          </div>

          <!-- Table -->
          <div v-else-if="filteredProducts.length > 0" class="prod-db-table-wrap">
            <table class="prod-db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produktname</th>
                  <th>EAN / Barcode</th>
                  <th>Kategorie</th>
                  <th>Nettopreis</th>
                  <th>Steuersatz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, idx) in filteredProducts" :key="product.id || product.ean || idx">
                  <td class="prod-db-td-num">{{ idx + 1 }}</td>
                  <td class="prod-db-td-name">{{ product.name }}</td>
                  <td class="prod-db-td-ean">{{ product.code || product.ean || product.barcode}}</td>
                  <td>{{ categoryLabelMap[product.category] || product.category }}</td>
                  <td class="prod-db-td-price">{{ (product.price ?? product.priceNet ?? 0).toFixed(2) }} €{{ product.category === 'FRUITS_VEGETABLES' ? '/kg' : '' }}</td>
                  <td class="prod-db-td-tax">{{ formatTaxRate(product.taxRate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty -->
          <div v-else class="prod-db-empty">
            <svg viewBox="0 0 24 24" fill="currentColor" class="prod-db-empty-icon"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <p>Keine Produkte gefunden.</p>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Modal Overlay -->
    <Transition name="modal-fade">
      <div v-if="activeModal" class="prod-modal-overlay" @click.self="closeModal">
        <div class="prod-modal">
          <div class="prod-modal-header">
            <div class="prod-modal-header-icon" :class="'prod-modal-header-icon--' + activeModal">
              <svg v-if="activeModal === 'add'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <svg v-else-if="activeModal === 'edit'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
            <h2 class="prod-modal-title">{{ modalTitle }}</h2>
            <button class="prod-modal-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <!-- Add Product Form -->
          <div v-if="activeModal === 'add'" class="prod-modal-body">
            <div class="prod-form-group">
              <label class="prod-label">Produktname</label>
              <input v-model="form.name" type="text" class="prod-input" placeholder="z.B. Monster White" />
            </div>
            <div class="prod-form-group">
              <label class="prod-label">Kategorie</label>
              <select v-model="form.category" class="prod-input">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="prod-form-row">
              <div class="prod-form-group">
                <label class="prod-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="prod-input" :placeholder="pricePlaceholder" />
              </div>
              <div class="prod-form-group">
                <label class="prod-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="prod-input">
                  <option value="1.19">19%</option>
                  <option value="1.07">7%</option>
                  <option value="1.00">0%</option>
                </select>
              </div>
            </div>
            <div class="prod-form-group">
              <label class="prod-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="prod-input" placeholder="z.B. 4006381333634" />
            </div>
            <!-- Add Error -->
            <div v-if="addError" class="prod-search-error">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <p>{{ addError }}</p>
            </div>

            <!-- Add Success -->
            <div v-if="addSuccess" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Produkt erfolgreich hinzugefügt!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--add" @click="addProduct" :disabled="addLoading">
                <span v-if="addLoading" class="prod-spinner"></span>
                <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                {{ addLoading ? 'Wird hinzugefügt…' : 'Produkt hinzufügen' }}
              </button>
            </div>
          </div>

          <!-- Edit Product Form -->
          <div v-if="activeModal === 'edit'" class="prod-modal-body">
            <div class="prod-form-group">
              <label class="prod-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="prod-input"
                  placeholder="EAN / Barcode eingeben…"
                  @keyup.enter="searchByBarcode"
                />
                <button class="prod-btn prod-btn--search" @click="searchByBarcode" :disabled="searchLoading">
                  <svg v-if="!searchLoading" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  <span v-if="searchLoading" class="prod-spinner"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <!-- Search Error -->
            <div v-if="searchError" class="prod-search-error">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <p>{{ searchError }}</p>
            </div>

            <!-- Found Product Info -->
            <div v-if="foundProduct" class="prod-found-card">
              <div class="prod-found-header">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Produkt gefunden</span>
              </div>
              <div class="prod-found-details">
                <div class="prod-found-row">
                  <span class="prod-found-label">Name</span>
                  <span class="prod-found-value">{{ foundProduct.name }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">EAN</span>
                  <span class="prod-found-value prod-found-ean">{{ foundProduct.ean || foundProduct.barcode || searchQuery.trim() }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Kategorie</span>
                  <span class="prod-found-value">{{ categoryLabelMap[foundProduct.category] || foundProduct.category }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Nettopreis</span>
                  <span class="prod-found-value">{{ (foundProduct.priceNet ?? foundProduct.price ?? 0).toFixed(2) }} €{{ foundProduct.category === 'FRUITS_VEGETABLES' ? '/kg' : '' }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">MwSt-Satz</span>
                  <span class="prod-found-value">{{ foundProduct.taxRate !== undefined ? foundProduct.taxRate : '—' }}</span>
                </div>
              </div>
            </div>

            <div class="prod-divider"></div>

            <p v-if="!foundProduct" class="prod-hint">Gib eine EAN ein und klicke auf „Suchen", um das Produkt zu laden. Die Felder werden dann vorausgefüllt.</p>

            <div class="prod-form-group">
              <label class="prod-label">Produktname</label>
              <input v-model="form.name" type="text" class="prod-input" placeholder="Produktname" :disabled="!foundProduct" />
            </div>
            <div class="prod-form-group">
              <label class="prod-label">Kategorie</label>
              <select v-model="form.category" class="prod-input" :disabled="!foundProduct">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="prod-form-row">
              <div class="prod-form-group">
                <label class="prod-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="prod-input" :placeholder="pricePlaceholder" :disabled="!foundProduct" />
              </div>
              <div class="prod-form-group">
                <label class="prod-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="prod-input" :disabled="!foundProduct">
                  <option value="1.19">19%</option>
                  <option value="1.07">7%</option>
                  <option value="1.00">0%</option>
                </select>
              </div>
            </div>
            <div class="prod-form-group">
              <label class="prod-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="prod-input" placeholder="EAN / Barcode" :disabled="!foundProduct" />
            </div>
            <!-- Edit Error -->
            <div v-if="editError" class="prod-search-error">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <p>{{ editError }}</p>
            </div>

            <!-- Edit Success -->
            <div v-if="editSuccess" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Produkt erfolgreich aktualisiert!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--edit" :disabled="!foundProduct || editLoading" @click="editProduct">
                <span v-if="editLoading" class="prod-spinner"></span>
                <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                {{ editLoading ? 'Wird gespeichert…' : 'Änderungen speichern' }}
              </button>
            </div>
          </div>

          <!-- Remove Product -->
          <div v-if="activeModal === 'remove'" class="prod-modal-body">
            <div class="prod-form-group">
              <label class="prod-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="prod-input"
                  placeholder="EAN / Barcode eingeben…"
                  @keyup.enter="searchByBarcode"
                />
                <button class="prod-btn prod-btn--search" @click="searchByBarcode" :disabled="searchLoading">
                  <svg v-if="!searchLoading" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  <span v-if="searchLoading" class="prod-spinner"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <!-- Search Error -->
            <div v-if="searchError" class="prod-search-error">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <p>{{ searchError }}</p>
            </div>

            <!-- Found Product Info -->
            <div v-if="foundProduct" class="prod-found-card prod-found-card--remove">
              <div class="prod-found-header">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Produkt gefunden</span>
              </div>
              <div class="prod-found-details">
                <div class="prod-found-row">
                  <span class="prod-found-label">Name</span>
                  <span class="prod-found-value">{{ foundProduct.name }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">EAN</span>
                  <span class="prod-found-value prod-found-ean">{{ foundProduct.ean || foundProduct.barcode || searchQuery.trim() }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Kategorie</span>
                  <span class="prod-found-value">{{ categoryLabelMap[foundProduct.category] || foundProduct.category }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Nettopreis</span>
                  <span class="prod-found-value">{{ (foundProduct.priceNet ?? foundProduct.price ?? 0).toFixed(2) }} €{{ foundProduct.category === 'FRUITS_VEGETABLES' ? '/kg' : '' }}</span>
                </div>
              </div>
            </div>

            <div class="prod-divider"></div>
            <div class="prod-remove-warning">
              <svg viewBox="0 0 24 24" fill="currentColor" class="prod-warning-icon">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <div>
                <p class="prod-warning-title">Achtung</p>
                <p class="prod-warning-text">Das Entfernen eines Produkts kann nicht rückgängig gemacht werden. Stellen Sie sicher, dass Sie das richtige Produkt ausgewählt haben.</p>
              </div>
            </div>
            <!-- Remove Error -->
            <div v-if="removeError" class="prod-search-error">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <p>{{ removeError }}</p>
            </div>

            <!-- Remove Success -->
            <div v-if="removeSuccess" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span>Produkt erfolgreich entfernt!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--remove" :disabled="!foundProduct || removeLoading" @click="removeProduct">
                <span v-if="removeLoading" class="prod-spinner"></span>
                <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                {{ removeLoading ? 'Wird entfernt…' : 'Produkt entfernen' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { fetchProductByBarcode, fetchAllProducts, createProduct, updateProduct, deleteProduct } from '../services/api'

const activeModal = ref(null)
const searchQuery = ref('')
const searchLoading = ref(false)
const searchError = ref('')
const foundProduct = ref(null)
const addLoading = ref(false)
const addError = ref('')
const addSuccess = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editSuccess = ref(false)
const removeLoading = ref(false)
const removeError = ref('')
const removeSuccess = ref(false)

const categories = [
  { value: '', label: 'Kategorie wählen…' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

const categoryLabelMap = {
  FRUITS_VEGETABLES: 'Obst/Gemüse',
  BAKERY: 'Backwaren',
  OTHERS: 'Others',
}

// Database state
const showDatabase = ref(false)
const allProducts = ref([])
const dbLoading = ref(false)
const dbError = ref('')
const dbSearchQuery = ref('')
const dbCategoryFilter = ref('ALL')

const dbCategories = [
  { value: 'ALL', label: 'Alle' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (dbCategoryFilter.value !== 'ALL') {
    list = list.filter(p => p.category === dbCategoryFilter.value)
  }
  const q = dbSearchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && String(p.code).toLowerCase().includes(q)) ||
      (p.ean && String(p.ean).toLowerCase().includes(q)) ||
      (p.barcode && String(p.barcode).toLowerCase().includes(q))
    )
  }
  return list
})

function formatTaxRate(rate) {
  if (rate === undefined || rate === null) return '—'
  if (rate === 1.19 || rate === 19 || rate === 0.19) return '19 %'
  if (rate === 1.07 || rate === 7 || rate === 0.07) return '7 %'
  if (rate === 1.0 || rate === 0) return '0 %'
  return String(rate)
}

async function loadAllProducts() {
  showDatabase.value = true
  dbLoading.value = true
  dbError.value = ''
  try {
    const data = await fetchAllProducts()
    allProducts.value = Array.isArray(data) ? data : (data.products || data.content || [])
  } catch (err) {
    dbError.value = 'Fehler beim Laden der Produkte. Bitte versuche es erneut.'
    console.error('loadAllProducts error:', err)
  } finally {
    dbLoading.value = false
  }
}

const form = ref({
  name: '',
  priceNet: '',
  taxRate: '1.19',
  category: '',
  ean: '',
})

const priceLabel = computed(() => {
  return form.value.category === 'FRUITS_VEGETABLES' ? 'Nettopreis pro Kilo (€)' : 'Nettopreis (€)'
})

const pricePlaceholder = computed(() => {
  return form.value.category === 'FRUITS_VEGETABLES' ? '0.00 €/kg' : '0.00'
})

const modalTitle = computed(() => {
  switch (activeModal.value) {
    case 'add': return 'Produkt hinzufügen'
    case 'edit': return 'Produkt bearbeiten'
    case 'remove': return 'Produkt entfernen'
    default: return ''
  }
})

function openModal(type) {
  activeModal.value = type
  resetForm()
  resetSearch()
  addError.value = ''
  addSuccess.value = false
  editError.value = ''
  editSuccess.value = false
  removeError.value = ''
  removeSuccess.value = false
}

function closeModal() {
  activeModal.value = null
  searchQuery.value = ''
  resetForm()
  resetSearch()
  addError.value = ''
  addSuccess.value = false
  editError.value = ''
  editSuccess.value = false
  removeError.value = ''
  removeSuccess.value = false
}

function resetForm() {
  form.value = {
    name: '',
    priceNet: '',
    taxRate: '1.19',
    category: '',
    ean: '',
  }
}

function resetSearch() {
  searchLoading.value = false
  searchError.value = ''
  foundProduct.value = null
}

function getTaxRateValue(taxRate) {
  if (taxRate === 19 || taxRate === 0.19) return '1.19'
  if (taxRate === 7 || taxRate === 0.07) return '1.07'
  if (taxRate === 0) return '1.00'
  // Try to match from multiplier
  if (taxRate === 1.19) return '1.19'
  if (taxRate === 1.07) return '1.07'
  if (taxRate === 1.0) return '1.00'
  return '1.19'
}

async function addProduct() {
  if (!form.value.name || !form.value.category || !form.value.priceNet || !form.value.ean) {
    addError.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  addLoading.value = true
  addError.value = ''
  addSuccess.value = false

  try {
    const body = {
      name: form.value.name,
      category: form.value.category,
      price: parseFloat(form.value.priceNet),
      taxRate: parseFloat(form.value.taxRate),
      code: form.value.ean,
    }
    await createProduct(body)
    addSuccess.value = true
    setTimeout(() => {
      closeModal()
      addSuccess.value = false
    }, 1200)
  } catch (err) {
    console.error('Error adding product:', err)
    addError.value = 'Fehler beim Hinzufügen des Produkts. Bitte versuche es erneut.'
  } finally {
    addLoading.value = false
  }
}

async function editProduct() {
  if (!form.value.name || !form.value.category || !form.value.priceNet || !form.value.ean) {
    editError.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  const barcode = foundProduct.value?.ean || foundProduct.value?.barcode || foundProduct.value?.code || searchQuery.value.trim()
  if (!barcode) {
    editError.value = 'Kein Barcode vorhanden.'
    return
  }

  editLoading.value = true
  editError.value = ''
  editSuccess.value = false

  try {
    const body = {
      name: form.value.name,
      code: form.value.ean,
      price: parseFloat(form.value.priceNet),
      taxRate: parseFloat(form.value.taxRate),
      productCategory: form.value.category,
    }
    await updateProduct(barcode, body)
    editSuccess.value = true
    setTimeout(() => {
      closeModal()
      editSuccess.value = false
    }, 1200)
  } catch (err) {
    console.error('Error updating product:', err)
    editError.value = 'Fehler beim Aktualisieren des Produkts. Bitte versuche es erneut.'
  } finally {
    editLoading.value = false
  }
}

async function removeProduct() {
  const barcode = foundProduct.value?.ean || foundProduct.value?.barcode || foundProduct.value?.code || searchQuery.value.trim()
  if (!barcode) {
    removeError.value = 'Kein Produkt ausgewählt.'
    return
  }

  removeLoading.value = true
  removeError.value = ''
  removeSuccess.value = false

  try {
    await deleteProduct(barcode)
    removeSuccess.value = true
    setTimeout(() => {
      closeModal()
      removeSuccess.value = false
    }, 1200)
  } catch (err) {
    console.error('Error deleting product:', err)
    removeError.value = 'Fehler beim Entfernen des Produkts. Bitte versuche es erneut.'
  } finally {
    removeLoading.value = false
  }
}

async function searchByBarcode() {
  const barcode = searchQuery.value.trim()
  if (!barcode) {
    searchError.value = 'Bitte eine EAN / Barcode eingeben.'
    return
  }

  searchLoading.value = true
  searchError.value = ''
  foundProduct.value = null
  resetForm()

  try {
    const product = await fetchProductByBarcode(barcode)
    foundProduct.value = product

    // Fill form with product data
    form.value.name = product.name || ''
    form.value.priceNet = product.priceNet ?? product.price ?? ''
    form.value.taxRate = getTaxRateValue(product.taxRate ?? product.tax_rate ?? 19)
    form.value.category = product.category || ''
    form.value.ean = product.ean || product.barcode || barcode
  } catch (err) {
    if (err.response && err.response.status === 404) {
      searchError.value = 'Kein Produkt mit dieser EAN gefunden.'
    } else {
      searchError.value = 'Fehler bei der Suche. Bitte versuche es erneut.'
    }
    foundProduct.value = null
  } finally {
    searchLoading.value = false
  }
}
</script>

<style scoped>
.products-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

/* Navbar */
.prod-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.92);
  backdrop-filter: blur(10px);
}

.prod-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.prod-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.prod-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: linear-gradient(90deg, #00D4E8, #6EF0F9);
  border-radius: 999px;
}

.prod-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.prod-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s;
}

.prod-back-btn:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.1);
  border-color: rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.prod-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.prod-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 4rem;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}

.prod-header {
  margin-bottom: 2.5rem;
}

.prod-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.prod-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

/* Action Cards */
.prod-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.prod-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.22s;
}

.prod-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.prod-action-card--add:hover {
  background: rgba(110, 240, 180, 0.06);
  border-color: rgba(110, 240, 180, 0.25);
}

.prod-action-card--edit:hover {
  background: rgba(0, 212, 232, 0.06);
  border-color: rgba(0, 212, 232, 0.25);
}

.prod-action-card--remove:hover {
  background: rgba(255, 107, 138, 0.06);
  border-color: rgba(255, 107, 138, 0.25);
}

.prod-action-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin-bottom: 1.25rem;
}

.prod-action-icon svg {
  width: 30px;
  height: 30px;
}

.prod-action-card--add .prod-action-icon {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.prod-action-card--edit .prod-action-icon {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.prod-action-card--remove .prod-action-icon {
  background: rgba(255, 107, 138, 0.12);
  color: #FF6B8A;
}

.prod-action-title {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.prod-action-desc {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.38);
  line-height: 1.4;
  max-width: 20ch;
}

/* Modal */
.prod-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.prod-modal {
  width: min(560px, 94vw);
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(160deg, #0B2C44, #092538);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.prod-modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.prod-modal-header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.prod-modal-header-icon svg {
  width: 20px;
  height: 20px;
}

.prod-modal-header-icon--add {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.prod-modal-header-icon--edit {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.prod-modal-header-icon--remove {
  background: rgba(255, 107, 138, 0.12);
  color: #FF6B8A;
}

.prod-modal-title {
  flex: 1;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.prod-modal-close {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.18s;
  flex-shrink: 0;
}

.prod-modal-close:hover {
  background: rgba(255,100,100,0.12);
  border-color: rgba(255,100,100,0.3);
  color: #ff6b6b;
}

.prod-modal-close svg {
  width: 16px;
  height: 16px;
}

.prod-modal-body {
  padding: 1.5rem 1.75rem;
}

/* Form */
.prod-form-group {
  margin-bottom: 1rem;
}

.prod-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.prod-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 0.35rem;
}

.prod-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.18s;
  box-sizing: border-box;
}

.prod-input:focus {
  border-color: rgba(0, 212, 232, 0.5);
}

.prod-input:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.prod-input::placeholder {
  color: rgba(255,255,255,0.25);
}

select.prod-input {
  appearance: none;
  cursor: pointer;
}

.prod-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 1.25rem 0;
}

.prod-hint {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.35);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.prod-search-results {
  margin-top: 0.5rem;
}

.prod-search-empty {
  padding: 1rem;
  text-align: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}

.prod-search-empty p {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.3);
}

/* Search Row */
.prod-search-row {
  display: flex;
  gap: 0.6rem;
  align-items: stretch;
}

.prod-search-row .prod-input {
  flex: 1;
}

.prod-btn--search {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 212, 232, 0.15);
  border: 1px solid rgba(0, 212, 232, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  flex-shrink: 0;
}

.prod-btn--search svg {
  width: 16px;
  height: 16px;
}

.prod-btn--search:hover:not(:disabled) {
  background: rgba(0, 212, 232, 0.25);
  border-color: rgba(0, 212, 232, 0.5);
  transform: translateY(-1px);
}

.prod-btn--search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner */
.prod-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #00D4E8;
  border-radius: 50%;
  animation: prod-spin 0.6s linear infinite;
}

@keyframes prod-spin {
  to { transform: rotate(360deg); }
}

/* Search Error */
.prod-search-error {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  background: rgba(255, 107, 138, 0.08);
  border: 1px solid rgba(255, 107, 138, 0.2);
  border-radius: 10px;
}

.prod-search-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #FF6B8A;
}

.prod-search-error p {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
}

/* Found Product Card */
.prod-found-card {
  margin-top: 0.75rem;
  background: rgba(0, 212, 232, 0.06);
  border: 1px solid rgba(0, 212, 232, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.prod-found-card--remove {
  background: rgba(255, 107, 138, 0.06);
  border-color: rgba(255, 107, 138, 0.2);
}

.prod-found-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: rgba(0, 212, 232, 0.08);
  border-bottom: 1px solid rgba(0, 212, 232, 0.12);
}

.prod-found-card--remove .prod-found-header {
  background: rgba(255, 107, 138, 0.08);
  border-bottom-color: rgba(255, 107, 138, 0.12);
}

.prod-found-header svg {
  width: 18px;
  height: 18px;
  color: #6EF0B4;
}

.prod-found-card--remove .prod-found-header svg {
  color: #FF6B8A;
}

.prod-found-header span {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
}

.prod-found-details {
  padding: 0.75rem 1rem;
}

.prod-found-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;
}

.prod-found-row + .prod-found-row {
  border-top: 1px solid rgba(255,255,255,0.05);
}

.prod-found-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.4);
}

.prod-found-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
}

.prod-found-ean {
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.82rem;
  color: #00D4E8;
  letter-spacing: 0.04em;
}

.prod-found-card--remove .prod-found-ean {
  color: #FF6B8A;
}

/* Remove warning */
.prod-remove-warning {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 107, 138, 0.06);
  border: 1px solid rgba(255, 107, 138, 0.15);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.prod-warning-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #FF6B8A;
  margin-top: 0.1rem;
}

.prod-warning-title {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #FF6B8A;
}

.prod-warning-text {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.45;
}

/* Footer */
.prod-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 1rem;
}

.prod-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s;
  border: 1px solid transparent;
}

.prod-btn svg {
  width: 16px;
  height: 16px;
}

.prod-btn--secondary {
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}

.prod-btn--secondary:hover {
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.1);
}

.prod-btn--primary {
  color: #071A2A;
  font-weight: 700;
}

.prod-btn--primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.prod-btn--add {
  background: linear-gradient(90deg, #6EF0B4, #4CD99A);
}

.prod-btn--add:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(110, 240, 180, 0.3);
  transform: translateY(-1px);
}

.prod-btn--edit {
  background: linear-gradient(90deg, #00D4E8, #00B8D4);
}

.prod-btn--edit:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.prod-btn--remove {
  background: linear-gradient(90deg, #FF6B8A, #FF4D6D);
  color: #fff;
}

.prod-btn--remove:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(255, 107, 138, 0.3);
  transform: translateY(-1px);
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Database Card */
.prod-action-card--db:hover {
  background: rgba(168, 130, 255, 0.06);
  border-color: rgba(168, 130, 255, 0.25);
}

.prod-action-card--db .prod-action-icon {
  background: rgba(168, 130, 255, 0.12);
  color: #A882FF;
}

/* Database Section */
.prod-db-section {
  margin-top: 2.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.75rem;
}

.prod-db-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.prod-db-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.prod-db-title-icon {
  width: 24px;
  height: 24px;
  color: #A882FF;
  flex-shrink: 0;
}

.prod-db-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.06);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  margin-left: 0.25rem;
}

.prod-db-close-btn svg {
  width: 14px;
  height: 14px;
}

/* Filters */
.prod-db-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.prod-db-search {
  position: relative;
  display: flex;
  align-items: center;
}

.prod-db-search-icon {
  position: absolute;
  left: 0.85rem;
  width: 18px;
  height: 18px;
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}

.prod-db-search-input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 2.75rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.18s;
  box-sizing: border-box;
}

.prod-db-search-input:focus {
  border-color: rgba(168, 130, 255, 0.5);
}

.prod-db-search-input::placeholder {
  color: rgba(255,255,255,0.25);
}

.prod-db-search-clear {
  position: absolute;
  right: 0.6rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.15s;
}

.prod-db-search-clear:hover {
  background: rgba(255,100,100,0.15);
  color: #FF6B8A;
}

.prod-db-search-clear svg {
  width: 14px;
  height: 14px;
}

.prod-db-category-filter {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.prod-db-cat-btn {
  padding: 0.4rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s;
}

.prod-db-cat-btn:hover {
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}

.prod-db-cat-btn--active {
  color: #A882FF;
  background: rgba(168, 130, 255, 0.1);
  border-color: rgba(168, 130, 255, 0.35);
}

/* Loading */
.prod-db-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
}

.prod-spinner--lg {
  width: 28px;
  height: 28px;
  border-width: 3px;
}

/* Table */
.prod-db-table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}

.prod-db-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.prod-db-table thead {
  background: rgba(255,255,255,0.04);
}

.prod-db-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  white-space: nowrap;
}

.prod-db-table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.75);
}

.prod-db-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}

.prod-db-table tbody tr:last-child td {
  border-bottom: none;
}

.prod-db-td-num {
  color: rgba(255,255,255,0.25);
  font-size: 0.78rem;
  width: 40px;
}

.prod-db-td-name {
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.prod-db-td-ean {
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.03em;
}

.prod-db-td-price {
  font-weight: 600;
  color: #6EF0B4;
  white-space: nowrap;
}

.prod-db-td-tax {
  color: rgba(255,255,255,0.45);
  font-size: 0.8rem;
}


/* Empty State */
.prod-db-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.35);
  font-size: 0.85rem;
}

.prod-db-empty-icon {
  width: 36px;
  height: 36px;
  opacity: 0.4;
}

/* DB Transition */
.db-fade-enter-active,
.db-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.db-fade-enter-from,
.db-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Responsive */
@media (max-width: 768px) {
  .prod-navbar {
    padding: 1rem 1.25rem;
  }
  .prod-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .prod-actions {
    grid-template-columns: 1fr;
  }
  .prod-title {
    font-size: 1.6rem;
  }
  .prod-form-row {
    grid-template-columns: 1fr;
  }
}
</style>