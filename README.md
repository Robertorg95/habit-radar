# 📊 Habit Radar

Aplicación **PWA** para llevar el control de tus hábitos, visualizar tu progreso
y mantener la motivación — funciona 100 % sin conexión.

<p align="center">
  <img src="docs/screen-light.png" width="190">
  <img src="docs/screen-dark.png" width="190">
</p>

---

## ✨ Características

| Función | Descripción |
|---------|-------------|
| ➕ / ➖ registro | Suma o resta eventos diarios (modo *Daily* o *Multi*) |
| Gráfica de línea | Evolución acumulada con Chart.js |
| Heat-grid semanal | Panel de 8 × 7 celdas (color positivo / negativo) |
| Métricas | Racha, Score, Goal, Total de eventos |
| Tema claro / oscuro | Cambio instantáneo |
| Offline-first | Datos en **IndexedDB**; todo funciona sin Internet |
| Auto-actualización | `vite-plugin-pwa` con `registerType: "autoUpdate"` |

---

## 🔧 Tecnologías

* **React 18** + **Vite**
* **TailwindCSS** (UI)
* **Dexie** (IndexedDB)
* **Chart.js** + **react-chartjs-2**
* **vite-plugin-pwa**

---
