/* Updated script.js with cooler interactions */

// References for side navigation and hamburger icon
const sideNav = document.getElementById("side-nav");
const openNavBtn = document.getElementById("open-nav");

// Toggle function for side navigation and hamburger background
function toggleNav() {
  if (sideNav.style.width === "250px") {
    // Nav is open: close it
    sideNav.classList.remove("open");
    openNavBtn.classList.remove("active");
    setTimeout(() => {
      sideNav.style.width = "0";
    }, 300);
  } else {
    // Nav is closed: open it
    sideNav.style.width = "250px";
    openNavBtn.classList.add("active");
    setTimeout(() => {
      sideNav.classList.add("open");
    }, 500);
  }
}

// Toggle nav on hamburger click
openNavBtn.addEventListener("click", function(e) {
  e.stopPropagation(); // Prevent click from propagating
  toggleNav();
});

// Close nav if click occurs outside the side nav
document.addEventListener("click", function(e) {
  if (sideNav.style.width === "250px" && !sideNav.contains(e.target) && e.target !== openNavBtn) {
    toggleNav();
  }
});

// Smooth scrolling for links in side navigation
document.querySelectorAll('.side-nav a.nav-link').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    toggleNav(); // close nav on click
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Particle Animation on Canvas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];

// Resize canvas based on device pixel ratio and window size
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  if (ctx.resetTransform) {
    ctx.resetTransform();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.5 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
}

function initParticles(num) {
  particles = [];
  for (let i = 0; i < num; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles(150);
animateParticles();

// Add interactive mouse effect to repel particles
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  particles.forEach(p => {
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 50) {
      // Repel particle away from mouse
      p.x += dx / distance * 2;
      p.y += dy / distance * 2;
    }
  });
});
