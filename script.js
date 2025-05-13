const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const tileSize = 50;
let offset = 0;

function drawTiles() {
  const cols = Math.ceil(canvas.width / tileSize);
  const rows = Math.ceil(canvas.height / tileSize);
  const isDark = document.body.classList.contains('dark-mode');
  const baseShade = isDark ? 30 : 220;
  const variation = 30;
  const speed = isDark ? 0.005 : 0.01;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const shade = Math.floor(((Math.sin((x + y + offset) * 0.5) + 1) / 2) * variation) + baseShade;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  offset += speed;
  requestAnimationFrame(drawTiles);
}

drawTiles();

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  document.querySelectorAll('section, .hero').forEach(el => observer.observe(el));

  const header  = document.querySelector('header');
  const toggle  = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.overlay');
  toggle.addEventListener('click', () => header.classList.toggle('open'));
  overlay.addEventListener('click', () => header.classList.remove('open'));
  document.querySelectorAll('nav a').forEach(link =>
    link.addEventListener('click', () => header.classList.remove('open'))
  );

  if (!('ontouchstart' in window)) {
    const img       = document.getElementById('draggable-img');
    const container = document.querySelector('.hero-img-container');

    let velocityX = 0, velocityY = 0;
    const gravity       = 0.5;
    const restitution   = 0.6;
    const floorFriction = 0.4;
    let falling = false, animId = null, isDragging = false;

    function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

    function cancelFall() {
      falling = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    }

    function resetImage() {
      cancelFall();
      img.style.position = '';
      img.style.left     = '';
      img.style.top      = '';
      img.style.width    = '';
      img.style.height   = '';
      img.style.zIndex   = '';
      container.classList.remove('empty');
      container.appendChild(img);
    }

    function startFall() {
      if (falling) return;
      falling = true;
      const pageW = document.documentElement.scrollWidth - img.offsetWidth;

      (function fall() {
        velocityY += gravity;
        let x = parseFloat(img.style.left)  || 0;
        let y = parseFloat(img.style.top)   || 0;
        x += velocityX;
        y += velocityY;

        const floorY = window.scrollY + window.innerHeight - img.offsetHeight;

        if (x < 0 || x > pageW) velocityX = -velocityX * restitution;
        x = clamp(x, 0, pageW);

        if (y < floorY) {
          img.style.left = x + 'px';
          img.style.top  = y + 'px';
          velocityX *= 0.99;
          animId = requestAnimationFrame(fall);
          return;
        }

        // hit floor
        img.style.top = floorY + 'px';
        if (Math.abs(velocityY) > 1) {
          velocityY = -velocityY * restitution;
          velocityX *= floorFriction;
          animId = requestAnimationFrame(fall);
          return;
        }
        if (Math.abs(velocityX) > 0.5) {
          velocityX *= floorFriction;
          animId = requestAnimationFrame(fall);
          return;
        }

        falling = false;
        animId = null;
      })();
    }

    img.addEventListener('mousedown', e => {
      e.preventDefault();
      cancelFall();
      isDragging = true;

      const rect    = img.getBoundingClientRect();
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      let lastX     = e.clientX;
      let lastTime  = e.timeStamp;

      container.classList.add('empty');
      img.style.width    = rect.width  + 'px';
      img.style.height   = rect.height + 'px';
      img.style.position = 'fixed';       
      img.style.zIndex   = 1001;
      document.body.appendChild(img);

      function moveAt(clientX, clientY) {
        img.style.left = (clientX - centerX) + 'px';
        img.style.top  = (clientY - centerY) + 'px';
      }
      moveAt(e.clientX, e.clientY);

      function onMouseMove(ev) {
        moveAt(ev.clientX, ev.clientY);
        const dt = ev.timeStamp - lastTime;
        if (dt > 0) {
          velocityX = ((ev.clientX - lastX) / dt) * 16;
          lastX     = ev.clientX;
          lastTime  = ev.timeStamp;
        }
      }
      document.addEventListener('mousemove', onMouseMove);

      function endDrag(ev) {
        document.removeEventListener('mousemove', onMouseMove);
        isDragging = false;

        const contRect = container.getBoundingClientRect();
        const imgRect  = img.getBoundingClientRect();
        const cx = imgRect.left + imgRect.width / 2;
        const cy = imgRect.top  + imgRect.height / 2;

        if (cx >= contRect.left && cx <= contRect.right &&
            cy >= contRect.top  && cy <= contRect.bottom) {
          resetImage();
        } else {
          const docX = imgRect.left + window.scrollX;
          const docY = imgRect.top  + window.scrollY;
          img.style.position = 'absolute';
          img.style.left     = docX + 'px';
          img.style.top      = docY + 'px';
          startFall();
        }
      }
      window.addEventListener('mouseup',   endDrag, { once: true });
      window.addEventListener('mouseleave', endDrag, { once: true });
    });

    window.addEventListener('scroll', () => {
      if (!container.contains(img) && !isDragging) startFall();
    });

    container.addEventListener('click', resetImage);
  }
});