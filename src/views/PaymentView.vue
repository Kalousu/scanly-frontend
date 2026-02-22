<template>
  <div class="page">
    <div class="card"></div>
    <div class="paying"></div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
}

body {
  background: linear-gradient(to bottom, #7a5cc2, #6e4fb3);
}
</style>

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

.card {
  width: 25vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paying {
  width: 60vw;
  position: relative;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
