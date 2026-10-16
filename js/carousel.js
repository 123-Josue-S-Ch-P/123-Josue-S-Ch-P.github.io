document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.track');
  const prevBtn = carousel.querySelector('.btn.prev');
  const nextBtn = carousel.querySelector('.btn.next');
  let currentIndex = 0;
  const total = track.children.length;

  function goTo(index) {
    // Bucle infinito
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Iniciar en la primera imagen
  goTo(0);
});