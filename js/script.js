// Enhanced JavaScript for Asgeo Zemin Website
// Responsive and performance optimized

// Enhanced Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navbar = document.querySelector(".navbar");

hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger?.classList.remove("active");
    navMenu?.classList.remove("active");
    document.body.classList.remove("menu-open");
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    navMenu?.classList.contains("active") &&
    !navMenu.contains(e.target) &&
    !hamburger?.contains(e.target)
  ) {
    hamburger?.classList.remove("active");
    navMenu?.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
});

// Enhanced Hero slider with service cards sync
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dotsAdvanced = document.querySelectorAll(".dot-advanced");
const serviceCards = document.querySelectorAll(".service-card-floating");
const progressFill = document.querySelector(".progress-fill");
let slideInterval;
let isAutoSliding = true;

function updateSlide(index) {
  if (index < 0 || index >= slides.length) return;

  // Update slides
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  // Update dots
  dotsAdvanced.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  // Update service cards
  serviceCards.forEach((card, i) => {
    card.classList.toggle("active", i === index);
  });

  // Update progress bar
  if (progressFill) {
    const progressWidth = ((index + 1) / slides.length) * 100;
    progressFill.style.width = `${progressWidth}%`;
  }

  currentSlide = index;
}

function nextSlide() {
  const next = (currentSlide + 1) % slides.length;
  updateSlide(next);
}

function prevSlide() {
  const prev = (currentSlide - 1 + slides.length) % slides.length;
  updateSlide(prev);
}

function startAutoSlide() {
  if (!isAutoSliding) return;
  stopAutoSlide();
  slideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

// Advanced slider controls
document
  .querySelector(".slider-btn-advanced.next")
  ?.addEventListener("click", () => {
    stopAutoSlide();
    nextSlide();
    setTimeout(startAutoSlide, 3000); // Resume after 3 seconds
  });

document
  .querySelector(".slider-btn-advanced.prev")
  ?.addEventListener("click", () => {
    stopAutoSlide();
    prevSlide();
    setTimeout(startAutoSlide, 3000); // Resume after 3 seconds
  });

// Dot navigation
dotsAdvanced.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    stopAutoSlide();
    updateSlide(index);
    setTimeout(startAutoSlide, 3000); // Resume after 3 seconds
  });
});

// Service card navigation
serviceCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    stopAutoSlide();
    updateSlide(index);
    setTimeout(startAutoSlide, 3000); // Resume after 3 seconds
  });
});

// Pause on hover for hero section
const heroSection = document.querySelector(".hero");
if (heroSection) {
  heroSection.addEventListener("mouseenter", () => {
    isAutoSliding = false;
    stopAutoSlide();
  });

  heroSection.addEventListener("mouseleave", () => {
    isAutoSliding = true;
    startAutoSlide();
  });
}

// Initialize slider
if (slides.length > 0) {
  startAutoSlide();
}

// Enhanced scroll effects with navbar
const backToTop = document.getElementById("backToTop");
let lastScrollTop = 0;

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Show/hide back to top button
  if (scrollTop > 300) {
    backToTop?.classList.add("visible");
  } else {
    backToTop?.classList.remove("visible");
  }

  // Enhanced navbar scroll effect
  if (navbar) {
    if (scrollTop > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  lastScrollTop = scrollTop;
}

// Throttled scroll event
let scrollTimeout;
window.addEventListener("scroll", () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      handleScroll();
      scrollTimeout = null;
    }, 10);
  }
});

// Back to top functionality
backToTop?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      const navbarHeight = navbar?.offsetHeight || 0;
      const targetPosition = target.offsetTop - navbarHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Enhanced scroll indicator for hero
const scrollIndicator = document.querySelector(".hero-scroll-indicator");
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const servicesSection = document.querySelector(".services-preview");
    if (servicesSection) {
      const navbarHeight = navbar?.offsetHeight || 0;
      const targetPosition = servicesSection.offsetTop - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up");
      // Don't observe this element again
      animationObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe sections for animations
const animatedElements = document.querySelectorAll(
  ".service-card, .news-card, .announcement-card"
);
animatedElements.forEach((el) => {
  animationObserver.observe(el);
});

// Parallax effect for floating elements (performance optimized)
let parallaxTicking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll(".floating-element");

  parallaxElements.forEach((element, index) => {
    if (element) {
      const speed = 0.3 + index * 0.05; // Reduced for better performance
      const yPos = scrolled * speed;
      const rotation = scrolled * 0.05;
      element.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${rotation}deg)`;
    }
  });

  parallaxTicking = false;
}

function requestParallaxUpdate() {
  if (!parallaxTicking) {
    requestAnimationFrame(updateParallax);
    parallaxTicking = true;
  }
}

// Only add parallax on desktop for performance
if (window.innerWidth > 1024) {
  window.addEventListener("scroll", requestParallaxUpdate);
}

// Enhanced service cards hover effect
document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    if (window.innerWidth > 768) {
      // Only on desktop
      this.style.transform = "translateY(-10px) scale(1.02)";
    }
  });

  card.addEventListener("mouseleave", function () {
    if (window.innerWidth > 768) {
      // Only on desktop
      this.style.transform = "translateY(0) scale(1)";
    }
  });
});

// Counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.textContent.replace(/[^\d]/g, ""));
          const suffix = counter.textContent.replace(/[\d]/g, "");
          let current = 0;
          const increment = target / 60; // 60 frames for 1 second at 60fps

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target + suffix;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current) + suffix;
            }
          }, 16); // ~60fps

          counterObserver.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

// Initialize counter animation
animateCounters();

// Keyboard navigation for slider
document.addEventListener("keydown", (e) => {
  // Only if hero is in view and no input is focused
  if (
    document.activeElement.tagName !== "INPUT" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      stopAutoSlide();
      prevSlide();
      setTimeout(startAutoSlide, 3000);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      stopAutoSlide();
      nextSlide();
      setTimeout(startAutoSlide, 3000);
    }
  }
});

// Enhanced touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

if (heroSection) {
  heroSection.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  heroSection.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    },
    { passive: true }
  );
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  // Only horizontal swipes
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
    stopAutoSlide();
    if (diffX > 0) {
      nextSlide(); // Swipe left - next slide
    } else {
      prevSlide(); // Swipe right - previous slide
    }
    setTimeout(startAutoSlide, 3000);
  }
}

// Performance optimization - reduce animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.documentElement.style.setProperty("--animation-duration", "0.2s");
  // Disable parallax on low-end devices
  document.querySelectorAll(".floating-element").forEach((el) => {
    if (el) el.style.display = "none";
  });
}

// Preload images for better performance
function preloadImages() {
  const images = [
    "Foto/slidesondaj.jpg",
    "Foto/slidemasv.jpg",
    "Foto/slidepress.jpg",
  ];

  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  preloadImages();

  // Add loading animation with stagger effect
  const loadingElements = document.querySelectorAll(".hero-content > *");
  loadingElements.forEach((el, index) => {
    if (el) {
      el.style.animationDelay = `${index * 0.1}s`;
    }
  });
});

// Responsive handler with debouncing
let resizeTimeout;
function handleResize() {
  const width = window.innerWidth;

  // Update hero container layout
  const heroContainer = document.querySelector(".hero-container");
  if (heroContainer) {
    if (width <= 1024) {
      heroContainer.style.gridTemplateColumns = "1fr";
    } else {
      heroContainer.style.gridTemplateColumns = "1fr 350px";
    }
  }

  // Enable/disable parallax based on screen size
  if (width <= 1024) {
    document.querySelectorAll(".floating-element").forEach((el) => {
      if (el) el.style.display = "none";
    });
  } else {
    document.querySelectorAll(".floating-element").forEach((el) => {
      if (el) el.style.display = "block";
    });
  }

  // Update service cards layout
  const serviceCards = document.querySelectorAll(".service-card-floating");
  serviceCards.forEach((card) => {
    if (card) {
      if (width <= 768) {
        card.style.transform = "none";
      }
    }
  });
}

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250);
});

// Initial resize check
handleResize();

// Page visibility API to pause animations when tab is not active
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    isAutoSliding = false;
    stopAutoSlide();
  } else {
    isAutoSliding = true;
    startAutoSlide();
  }
});

// Cleanup function for when page is unloaded
window.addEventListener("beforeunload", () => {
  stopAutoSlide();
  // Clean up observers
  if (animationObserver) {
    animationObserver.disconnect();
  }
});

// Error handling wrapper
function safeExecute(fn, context = "Unknown") {
  try {
    return fn();
  } catch (error) {
    console.warn(`Error in ${context}:`, error);
    return null;
  }
}

// Enhanced form interactions (if any forms exist)
document.querySelectorAll("input, textarea").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement?.classList.add("focused");
  });

  input.addEventListener("blur", function () {
    if (!this.value) {
      this.parentElement?.classList.remove("focused");
    }
  });
});

// Lazy loading for images (if needed)
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Console welcome message
console.log(`
🎉 Asgeo Zemin Website Loaded Successfully!
✨ Responsive design with enhanced performance
🚀 Features: Advanced animations, touch support, accessibility
📱 Fully optimized for all devices
⚡ Performance optimized with lazy loading and throttling
`);

// Export functions for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    updateSlide,
    nextSlide,
    prevSlide,
    startAutoSlide,
    stopAutoSlide,
    animateCounters,
    handleResize,
    safeExecute,
  };
}
