/* ÍNDICE: Configuración · 1 Carrusel · 2 Menú celular · 3 Animación al scroll · 4 Números y enlace activo */


/* === CONFIGURACIÓN === */
const AUTOPLAY_MS = 5000;   // milisegundos entre imágenes (0 = sin avance automático)

// true si la persona pidió "reducir movimiento" en su equipo
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* === 1. CARRUSEL (funciona para todos los .carousel de la página) === */
document.querySelectorAll('.carousel').forEach(carousel => {

  // Elementos del carrusel
  const track   = carousel.querySelector('.track');
  const prevBtn = carousel.querySelector('.btn.prev');
  const nextBtn = carousel.querySelector('.btn.next');
  const slides  = Array.from(track.children);   // todas las imágenes
  const total   = slides.length;

  let currentIndex = 0;   // imagen actual (0 = primera)
  let timer = null;       // temporizador del avance automático

  // Crea el título y la caja de puntitos debajo del carrusel
  const caption = document.createElement('p');
  caption.className = 'carousel-caption';

  const dotsBox = document.createElement('div');
  dotsBox.className = 'carousel-dots';

  carousel.after(caption, dotsBox);

  // Crea un puntito por imagen; al tocarlo va a esa imagen
  const dots = slides.map((img, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Ir a la imagen ' + (i + 1));
    dot.addEventListener('click', () => {
      goTo(i);
      startAutoplay();
    });
    dotsBox.appendChild(dot);
    return dot;
  });

  // Va a una imagen (con bucle infinito)
  function goTo(index) {
    if (index < 0) index = total - 1;    // antes de la primera -> última
    if (index >= total) index = 0;       // después de la última -> primera
    currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;   // desliza el track
    caption.textContent = slides[currentIndex].alt;                  // título = texto alt
    dots.forEach((dot, i) => dot.classList.toggle('activo', i === currentIndex));
  }

  // Detiene el avance automático
  function stopAutoplay() {
    clearInterval(timer);
  }

  // Inicia (o reinicia) el avance automático
  function startAutoplay() {
    stopAutoplay();
    if (AUTOPLAY_MS > 0 && !reducirMovimiento) {
      timer = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_MS);
    }
  }

  // Flechas
  prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); startAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); startAutoplay(); });

  // Pausa el avance cuando el mouse está encima
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Deslizar con el dedo en el celular
  let toqueInicioX = 0;

  carousel.addEventListener('touchstart', (e) => {
    toqueInicioX = e.touches[0].clientX;   // dónde puso el dedo
    stopAutoplay();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diferencia = e.changedTouches[0].clientX - toqueInicioX;   // cuánto se movió
    if (diferencia < -50) goTo(currentIndex + 1);   // izquierda -> siguiente
    if (diferencia > 50)  goTo(currentIndex - 1);   // derecha -> anterior
    startAutoplay();
  }, { passive: true });

  // Inicia en la primera imagen
  goTo(0);
  startAutoplay();
});


/* === 2. MENÚ DEL CELULAR Y SOMBRA DEL HEADER === */
const header    = document.querySelector('header');
const botonMenu = document.querySelector('.menu-toggle');
const menu      = document.querySelector('nav');

// Botón ☰: abre o cierra el menú
botonMenu.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto');
  botonMenu.setAttribute('aria-expanded', abierto);
});

// Al tocar un enlace, el menú se cierra
menu.querySelectorAll('a').forEach(enlace => {
  enlace.addEventListener('click', () => {
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
  });
});

// Sombra en el header al bajar la página
window.addEventListener('scroll', () => {
  header.classList.toggle('con-sombra', window.scrollY > 10);
});


/* === 3. ANIMACIÓN AL HACER SCROLL (agrega selectores a la lista para animar más cosas) === */
if (!reducirMovimiento && 'IntersectionObserver' in window) {

  // Elementos que aparecen suavemente
  const aAnimar = document.querySelectorAll(
    '.content-box, .stat, .experiencia-card, .carousel, .skill-card, ' +
    '.cursos, .proyecto-card, .contact-info, .contact-item'
  );

  // Vigila cuándo cada elemento entra en pantalla
  const observadorAparecer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const el = entrada.target;
        el.classList.add('visible');          // dispara la animación del CSS
        observadorAparecer.unobserve(el);     // ya no se vigila

        // Al terminar, quita las clases para no estorbar al hover
        setTimeout(() => {
          el.classList.remove('animar', 'visible');
          el.style.transitionDelay = '';
        }, 1000);
      }
    });
  }, { threshold: 0.15 });   // se activa al verse el 15%

  aAnimar.forEach(el => {
    el.classList.add('animar');   // lo oculta antes de aparecer

    // Retraso escalonado: la 1.ª tarjeta primero, luego la 2.ª...
    const posicion = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = (posicion % 3) * 100 + 'ms';

    observadorAparecer.observe(el);
  });
}


/* === 4. NÚMEROS QUE CUENTAN Y ENLACE ACTIVO DEL MENÚ === */

// Cuenta de 0 hasta el número (HTML: data-contador="380" data-sufijo=" h")
function contarHasta(elemento) {
  const meta     = Number(elemento.dataset.contador);   // número final
  const sufijo   = elemento.dataset.sufijo || '';       // texto después del número
  const duracion = 1200;                                // milisegundos
  const inicio   = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);   // de 0 a 1
    elemento.textContent = Math.round(meta * progreso) + sufijo;
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

// Inicia la cuenta cuando el número se ve en pantalla
if (!reducirMovimiento && 'IntersectionObserver' in window) {
  const observadorNumeros = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        contarHasta(entrada.target);
        observadorNumeros.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-contador]').forEach(n => observadorNumeros.observe(n));
}

// Marca en el menú la sección donde estás
if ('IntersectionObserver' in window) {
  const enlacesMenu = document.querySelectorAll('nav a');

  const observadorSecciones = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        enlacesMenu.forEach(enlace => {
          // Pinta el enlace cuyo href coincide con el id de la sección visible
          enlace.classList.toggle('activo', enlace.getAttribute('href') === '#' + entrada.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });   // cuenta como visible a la mitad de la pantalla

  document.querySelectorAll('section[id]').forEach(s => observadorSecciones.observe(s));
}
