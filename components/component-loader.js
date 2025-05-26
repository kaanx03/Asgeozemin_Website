// components/component-loader.js
// Component yükleme ve aktif sayfa belirleme fonksiyonları

class ComponentLoader {
  constructor() {
    this.currentPage = this.getCurrentPageName();
  }

  // Mevcut sayfa adını URL'den al
  getCurrentPageName() {
    const path = window.location.pathname;
    const fileName = path.split("/").pop();

    if (fileName === "" || fileName === "index.html") {
      return "index";
    }

    return fileName.replace(".html", "");
  }

  // Component yükle
  async loadComponent(elementId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const element = document.getElementById(elementId);

      if (element) {
        element.innerHTML = html;
        return true;
      } else {
        console.warn(`Element with ID '${elementId}' not found`);
        return false;
      }
    } catch (error) {
      console.error(`Error loading component from ${componentPath}:`, error);
      return false;
    }
  }

  // Favicon'ları yükle
  async loadFavicons() {
    try {
      const componentsPath = this.getComponentsPath();
      const response = await fetch(`${componentsPath}/favicon.html`);

      if (!response.ok) {
        console.warn("Favicon component not found, skipping favicon loading");
        return false;
      }

      const faviconHTML = await response.text();

      // Favicon'ları head'e ekle
      document.head.insertAdjacentHTML("beforeend", faviconHTML);

      console.log("Favicons loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading favicons:", error);
      return false;
    }
  }

  // Navbar ve Footer'ı yükle
  async loadComponents() {
    const componentsPath = this.getComponentsPath();

    try {
      // İlk olarak favicon'ları yükle
      await this.loadFavicons();

      // Navbar yükle
      await this.loadComponent(
        "navbar-placeholder",
        `${componentsPath}/navbar.html`
      );

      // Footer yükle
      await this.loadComponent(
        "footer-placeholder",
        `${componentsPath}/footer.html`
      );

      // Component'lar yüklendikten sonra aktif sayfayı işaretle
      this.setActiveNavLink();

      // Event listener'ları yeniden bağla
      this.reinitializeEventListeners();

      console.log("Components loaded successfully");
    } catch (error) {
      console.error("Error loading components:", error);
    }
  }

  // Component'ların yolunu belirle (dosya yapısına göre)
  getComponentsPath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;

    if (depth <= 1 || path.includes("index.html")) {
      return "./components";
    } else {
      return "../components";
    }
  }

  // Aktif nav link'i işaretle
  setActiveNavLink() {
    // Önce tüm active class'ları temizle
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Mevcut sayfanın nav link'ini bul ve active yap
    const currentNavLink = document.querySelector(
      `[data-page="${this.currentPage}"]`
    );
    if (currentNavLink) {
      currentNavLink.classList.add("active");
    }
  }

  // Event listener'ları yeniden bağla (navbar için)
  reinitializeEventListeners() {
    // Hamburger menu
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.classList.toggle("menu-open");
      });

      // Nav link'lere tıklandığında mobile menu'yu kapat
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          document.body.classList.remove("menu-open");
        });
      });

      // Dışarı tıklandığında menu'yu kapat
      document.addEventListener("click", (e) => {
        if (
          navMenu.classList.contains("active") &&
          !navMenu.contains(e.target) &&
          !hamburger.contains(e.target)
        ) {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      });
    }

    // Scroll efektleri için navbar referansını güncelle
    if (typeof window.navbar !== "undefined") {
      window.navbar = document.querySelector(".navbar");
    }
  }

  // Fallback HTML yükleyici (fetch desteklenmeyen tarayıcılar için)
  loadComponentFallback(elementId, componentHTML) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = componentHTML;
      this.setActiveNavLink();
      this.reinitializeEventListeners();
    }
  }
}

// Component loader'ı başlat
const componentLoader = new ComponentLoader();

// DOM yüklendiğinde component'ları yükle
document.addEventListener("DOMContentLoaded", () => {
  componentLoader.loadComponents();
});

// Export for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = ComponentLoader;
}
