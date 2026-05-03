document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector("#contact-form");
  const backgroundMusic = document.querySelector("#background-music");
  const musicToggle = document.querySelector("#music-toggle");
  const heroTitle = document.querySelector("#hero-title");
  let userPausedMusic = false;
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function revealOnScroll() {
    document.querySelectorAll(".scroll-reveal").forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        element.classList.add("visible");
      }
    });
  }

  function fitHeroTitle() {
    if (!heroTitle) return;

    if (window.matchMedia("(max-width: 760px)").matches) {
      heroTitle.style.fontSize = "";
      return;
    }

    heroTitle.style.fontSize = "112px";
    const parentWidth = Math.min(heroTitle.parentElement.clientWidth, window.innerWidth - 48);
    const titleWidth = heroTitle.scrollWidth;
    const nextSize = Math.floor((parentWidth / titleWidth) * 104);
    heroTitle.style.fontSize = `${Math.min(112, nextSize)}px`;
  }

  function updateMusicButton() {
    if (!backgroundMusic || !musicToggle) return;

    const isMuted = backgroundMusic.muted || backgroundMusic.paused;
    musicToggle.classList.toggle("is-muted", isMuted);
    musicToggle.setAttribute("aria-pressed", String(isMuted));
    musicToggle.setAttribute("aria-label", isMuted ? "Play background music" : "Mute background music");
    musicToggle.innerHTML = isMuted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
    refreshIcons();
  }

  function playBackgroundMusic() {
    if (!backgroundMusic) return;

    backgroundMusic.volume = 0.35;
    backgroundMusic.muted = false;
    const playAttempt = backgroundMusic.play();

    if (playAttempt) {
      playAttempt.then(updateMusicButton).catch(updateMusicButton);
    } else {
      updateMusicButton();
    }
  }

  function prepareBackgroundMusic() {
    if (!backgroundMusic || !musicToggle) return;

    playBackgroundMusic();

    musicToggle.addEventListener("click", () => {
      if (backgroundMusic.paused || backgroundMusic.muted) {
        userPausedMusic = false;
        playBackgroundMusic();
      } else {
        userPausedMusic = true;
        backgroundMusic.muted = true;
        backgroundMusic.pause();
        updateMusicButton();
      }
    });

    document.addEventListener(
      "pointerdown",
      () => {
        if (backgroundMusic.paused && !userPausedMusic) {
          playBackgroundMusic();
        }
      },
      { once: true },
    );

    backgroundMusic.addEventListener("play", updateMusicButton);
    backgroundMusic.addEventListener("pause", updateMusicButton);
    backgroundMusic.addEventListener("volumechange", updateMusicButton);
    updateMusicButton();
  }

  function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  }

  function updateActiveNav() {
    const hashSectionId = window.location.hash.slice(1);
    const hashSection = sections.find((section) => section.id === hashSectionId);

    if (hashSection) {
      const hashSectionRect = hashSection.getBoundingClientRect();
      if (Math.abs(hashSectionRect.top) < window.innerHeight * 0.6) {
        setActiveNav(hashSection.id);
        return;
      }
    }

    const navOffset = 130;
    const currentSection = sections.reduce((current, section) => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= navOffset) {
        return section;
      }
      return current;
    }, sections[0]);

    if (currentSection) {
      setActiveNav(currentSection.id);
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("href").slice(1);
      setActiveNav(sectionId);
    });
  });

  document.querySelectorAll(".tab-button[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      const tabGroup = tab.closest(".section");

      tabGroup.querySelectorAll(".tab-button[data-tab]").forEach((button) => {
        button.classList.remove("active");
        button.setAttribute("aria-selected", "false");
      });

      tabGroup.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.add("hidden");
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tabGroup.querySelector(`#${tabName}-tab`)?.classList.remove("hidden");
    });
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Message sent successfully!";
    document.body.appendChild(successMessage);

    contactForm.reset();
    window.setTimeout(() => successMessage.remove(), 3000);
  });

  window.addEventListener(
    "scroll",
    () => {
      revealOnScroll();
      updateActiveNav();
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    fitHeroTitle();
    revealOnScroll();
    updateActiveNav();
  });
  window.addEventListener("hashchange", updateActiveNav);

  fitHeroTitle();
  revealOnScroll();
  updateActiveNav();
  window.setTimeout(updateActiveNav, 100);
  prepareBackgroundMusic();
  refreshIcons();
});
