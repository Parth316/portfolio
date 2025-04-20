// Particle Background
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.updateColor();
    this.opacity = Math.random() * 0.4 + 0.2;
  }
  updateColor() {
    const isDark = document.documentElement.dataset.theme === "dark";
    const hue = isDark ? Math.random() * 60 + 180 : Math.random() * 60 + 270; // Cyan-blue for dark, purple-blue for light
    this.color = `hsl(${hue}, 80%, ${isDark ? 70 : 60}%)`;
  }
  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius) {
      let force = (mouse.radius - distance) / mouse.radius;
      this.speedX -= (dx / distance) * force * 0.1;
      this.speedY -= (dy / distance) * force * 0.1;
    }
    this.speedX *= 0.99; // Friction
    this.speedY *= 0.99;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particlesArray = [];
const numberOfParticles = 150;
for (let i = 0; i < numberOfParticles; i++) {
  particlesArray.push(new Particle());
}

let mouse = { x: null, y: null, radius: 100 };
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animate);
}
animate();

// Theme Toggle
const storageKey = 'theme-preference';

const theme = {
  value: getColorPreference(),
};

function getColorPreference() {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setPreference() {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
  particlesArray.forEach((particle) => particle.updateColor());
}

function reflectPreference() {
  document.documentElement.setAttribute('data-theme', theme.value);
  const toggleButtons = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
  toggleButtons.forEach((button) => {
    button.setAttribute('aria-label', theme.value);
  });
}

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  setPreference();
}

// Initialize theme
reflectPreference();

window.onload = () => {
  reflectPreference();
  document.querySelector('#theme-toggle').addEventListener('click', onClick);
  document.querySelector('#mobile-theme-toggle').addEventListener('click', onClick);
};

// Sync with system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
  theme.value = isDark ? 'dark' : 'light';
  setPreference();
});

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Close mobile menu on link click
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    mobileMenu.classList.add("hidden");
    const targetId = link.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Portfolio Filters
const filterButtons = document.querySelectorAll(".portfolio-filter");
const portfolioItems = document.querySelectorAll(".portfolio-item");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    portfolioItems.forEach((item) => {
      const isVisible = filter === "all" || item.dataset.category === filter;
      item.style.display = isVisible ? "block" : "none";
      item.classList.toggle("visible-section", isVisible);
      item.style.opacity = isVisible ? "1" : "0";
    });
  });
});

// Scroll Animation for Sections
const sections = document.querySelectorAll(".hidden-section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible-section");
        if (entry.target.id === "skills") {
          entry.target.querySelectorAll(".progress-bar").forEach((bar) => {
            bar.style.transition = "width 1.5s ease-in-out";
            bar.style.width = bar.getAttribute("data-width");
            bar.classList.add("active");
          });
        }
      }
    });
  },
  { threshold: 0.2 }
);
sections.forEach((section) => observer.observe(section));

// Typing Effect for Hero Section
new Typed("#typed-text", {
  strings: ["Full-Stack Developer", "UI/UX Designer"],
  typeSpeed: 60,
  backSpeed: 30,
  loop: true,
});

// Contact Form Submission
document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const submitButton = document.getElementById("submit-button");
  const buttonText = document.getElementById("button-text");
  const buttonIcon = document.getElementById("button-icon");
  const loadingSpinner = document.getElementById("loading-spinner");
  const successIcon = document.getElementById("success-icon");
  const progressBar = document.getElementById("progress-bar");
  const formMessage = document.getElementById("form-message");

  submitButton.disabled = true;
  submitButton.classList.remove("success");
  submitButton.classList.add("sending");
  buttonText.textContent = "Sending...";
  buttonIcon.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");
  successIcon.classList.add("hidden");
  progressBar.classList.remove("opacity-0");
  formMessage.textContent = "";

  if ("vibrate" in navigator) navigator.vibrate(50);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      submitButton.classList.remove("sending");
      submitButton.classList.add("success");
      buttonText.textContent = "Sent!";
      loadingSpinner.classList.add("hidden");
      buttonIcon.classList.add("hidden");
      successIcon.classList.remove("hidden");
      progressBar.classList.add("opacity-0");
      formMessage.classList.remove("text-red-400");
      formMessage.classList.add("text-green-400");
      formMessage.textContent = "Message sent successfully!";
      form.reset();

      setTimeout(() => {
        submitButton.classList.remove("success");
        buttonText.textContent = "Send Message";
        buttonIcon.classList.remove("hidden");
        successIcon.classList.add("hidden");
        submitButton.disabled = false;
      }, 2000);
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    submitButton.classList.remove("sending");
    buttonText.textContent = "Send Message";
    buttonIcon.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
    successIcon.classList.add("hidden");
    progressBar.classList.add("opacity-0");
    formMessage.classList.remove("text-green-400");
    formMessage.classList.add("text-red-400");
    formMessage.textContent = "Failed to send message. Please try again later.";
    submitButton.disabled = false;
  }
});