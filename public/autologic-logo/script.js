// Script para la animación del logo
document.addEventListener('DOMContentLoaded', function() {
  // La animación se ejecuta automáticamente gracias al CSS
  // Este script puede usarse para reiniciar la animación o añadir interactividad
});

// Función para reiniciar la animación
function resetAnimation() {
  const logo = document.querySelector('.terminal-logo');
  if (logo) {
    const newLogo = logo.cloneNode(true);
    logo.parentNode.replaceChild(newLogo, logo);
  }
}