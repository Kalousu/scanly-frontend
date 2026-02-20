<template>
  <div class="page">
    <div class="card">
      <div class="empty-state">
        <div class="icon">🧾</div>
        <h2>Noch keine Artikel gescannt</h2>
        <p>Scanne ein Produkt, um es hier anzuzeigen.</p>
      </div>
    </div>

    <div class="paying">
  <div class="top-actions">
    <button class="action-btn">❓ Hilfe</button>
    <button class="action-btn">🌍 Sprache</button>
  </div>

  <div class="category-buttons">
  <button class="category-btn">
    🥦
    <span>Gemüse / Obst</span>
  </button>

  <button class="category-btn">
    🥐
    <span>Backwaren</span>
  </button>
</div>

  <div class="buttons">
    <button class="btn cancel">Abbrechen</button>
    <button class="btn pay">Zahlen</button>
  </div>
</div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden; 
}
body {
  background: linear-gradient(to bottom, #7A5CC2, #6E4FB3);
}
</style>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7%;            
  padding: 150px;
  box-sizing: border-box;
}

.card, .paying {
  background: #F4F4F6;
  border-radius: 25px;
  min-height: 80vh;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.card {
  width: 25vw;         
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-buttons {
  flex: 1; 
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
}

.category-buttons {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: auto;
  margin-bottom: 120px; 
}


.category-btn {
  width: 360px;     
  height: 210px;    
  border-radius: 26px;
  border: none;
  cursor: pointer;

  font-size: 24px;
  font-weight: 700;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;

  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;

  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.35);
  transition: all 0.25s ease;
}

.category-btn span {
  font-size: 20px;
}

.category-btn:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 60px rgba(124, 58, 237, 0.5);
}

.category-btn:active {
  transform: scale(0.96);
}

.empty-state {
  text-align: center;
  color: #6b6b6b;
}

.empty-state .icon {
  font-size: 50px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-state h2 {
  font-weight: 600;
  margin: 0;
  font-size: 22px;
}

.empty-state p {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.paying {
  width: 60vw;
  position: relative;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; 
}

/* Top right container */
.top-actions {
  position: absolute;
  top: 25px;
  right: 30px;
  display: flex;
  gap: 15px;
}

/* Fancy small buttons */
.action-btn {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  border: none;
  cursor: pointer;

  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;

  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

.action-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.btn {
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:active {
  transform: scale(0.97);
}

.cancel {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.cancel:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-2px);
}

.pay {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.pay:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.6);
}
</style>