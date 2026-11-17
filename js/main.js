// ===== Portafolio David Sánchez — interacciones =====

// --- Casos completos (dialog) ---
document.querySelectorAll('[data-abrir]').forEach((boton) => {
  boton.addEventListener('click', () => {
    document.getElementById(boton.dataset.abrir).showModal();
  });
});

document.querySelectorAll('dialog.caso').forEach((dialogo) => {
  dialogo.querySelector('[data-cerrar]').addEventListener('click', () => dialogo.close());

  // Cerrar al hacer clic fuera, en navegadores sin soporte de closedby
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialogo.addEventListener('click', (e) => {
      if (e.target !== dialogo) return;
      const r = dialogo.getBoundingClientRect();
      const dentro = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!dentro) dialogo.close();
    });
  }
});

// --- Marcar la sección visible en la navegación ---
const enlacesNav = document.querySelectorAll('.hero-nav a');
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    enlacesNav.forEach((a) => {
      a.setAttribute('aria-current', a.getAttribute('href') === '#' + entrada.target.id ? 'true' : 'false');
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section').forEach((s) => observador.observe(s));

// --- Validación del formulario de contacto ---
const form = document.getElementById('form-contacto');
const campos = form.querySelectorAll('input, select, textarea');
const estado = document.getElementById('estado-form');

function validar(campo) {
  const valor = campo.value.trim();
  let ok = campo.checkValidity() && valor.length > 0;
  if (campo.minLength > 0 && valor.length < campo.minLength) ok = false;

  const error = document.getElementById(campo.dataset.error);
  error.hidden = ok;
  campo.setAttribute('aria-invalid', ok ? 'false' : 'true');

  // El mensaje de error se anuncia junto con la pista mientras el campo es inválido
  const pistas = (campo.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== error.id);
  if (!ok) pistas.push(error.id);
  if (pistas.length) campo.setAttribute('aria-describedby', pistas.join(' '));
  else campo.removeAttribute('aria-describedby');
  return ok;
}

// Validar solo después de que la persona terminó de usar el campo
campos.forEach((campo) => {
  campo.addEventListener('blur', () => { if (campo.value !== '') validar(campo); });
  campo.addEventListener('input', () => { if (campo.hasAttribute('aria-invalid')) validar(campo); });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  estado.textContent = '';
  const invalidos = [...campos].filter((c) => !validar(c));
  if (invalidos.length) {
    invalidos[0].focus();
    return;
  }

  // Sitio estático: el mensaje se envía desde el programa de correo
  const datos = new FormData(form);
  const asunto = encodeURIComponent(`[Portafolio] ${datos.get('asunto')} - ${datos.get('nombre')}`);
  const cuerpo = encodeURIComponent(`${datos.get('mensaje')}\n\n${datos.get('nombre')}\n${datos.get('correo')}`);
  window.location.href = `mailto:alejandrosanch3z010@gmail.com?subject=${asunto}&body=${cuerpo}`;

  estado.textContent = 'Listo. Se abrió tu correo con el mensaje; solo presiona Enviar.';
  form.reset();
  campos.forEach((c) => c.removeAttribute('aria-invalid'));
});
