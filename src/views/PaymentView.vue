<template>
  <div class="page">
    <!-- LINKER CONTAINER (wie am Anfang) -->
    <div class="card">
      <div class="empty-state">
        <div class="icon">🧾</div>
        <h2>Noch keine Artikel gescannt</h2>
        <p>Scanne ein Produkt, um es hier anzuzeigen.</p>
      </div>
    </div>

    <!-- RECHTER CONTAINER -->
    <div class="paying">
      <div class="actions">
        <button class="card-payment">Kartenzahlung</button>

        <div class="bottom-buttons">
          <button class="primary">Hilfe holen</button>
          <button class="secondary">Zurück zum Einkauf</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7%;
  padding: 120px;
  box-sizing: border-box;
}

.card,
.paying {
  background: #f4f4f6;
  border-radius: 25px;
  min-height: 80vh;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

/* LINKER CONTAINER */
.card {
  width: 25vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-state {
  text-align: center;
  color: #555;
}

.empty-state h2 {
  margin: 20px 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: #444;
}

.empty-state p {
  font-size: 14px;
  color: #777;
}

.icon {
  font-size: 36px;
  opacity: 0.6;
}

/* RECHTER CONTAINER */
.paying {
  width: 60vw;
  padding: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

/* Hauptbutton */
.card-payment {
  width: 30vw;
  padding: 16px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #7a5cc2, #6e4fb3);
  color: white;
  box-shadow: 0 8px 20px rgba(110, 79, 179, 0.35);
  transition: all 0.2s ease;
}

.card-payment:hover {
  transform: translateY(-2px);
}

/* Untere Buttons */
.bottom-buttons {
  display: flex;
  gap: 18px;
}

.bottom-buttons button {
  width: 200px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  background: #6e4fb3;
  color: white;
  border: none;
}

.secondary {
  background: transparent;
  color: #6e4fb3;
  border: 2px solid #6e4fb3;
}

.primary:hover,
.secondary:hover {
  transform: translateY(-2px);
}
</style>
