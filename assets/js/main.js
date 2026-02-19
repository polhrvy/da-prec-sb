(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector("body");
    const selectHeader = document.querySelector("#header");
    if (!selectHeader) return;
    if (
      !selectHeader.classList.contains("scroll-up-sticky") &&
      !selectHeader.classList.contains("sticky-top") &&
      !selectHeader.classList.contains("fixed-top")
    )
      return;

    window.scrollY > 100
      ? selectBody.classList.add("scrolled")
      : selectBody.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /**
   * Scroll up sticky header
   */
  let lastScrollTop = 0;
  window.addEventListener("scroll", function () {
    const selectHeader = document.querySelector("#header");
    if (!selectHeader || !selectHeader.classList.contains("scroll-up-sticky"))
      return;

    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > selectHeader.offsetHeight) {
      selectHeader.style.setProperty("position", "sticky", "important");
      selectHeader.style.top = `-${selectHeader.offsetHeight + 50}px`;
    } else if (scrollTop > selectHeader.offsetHeight) {
      selectHeader.style.setProperty("position", "sticky", "important");
      selectHeader.style.top = "0";
    } else {
      selectHeader.style.removeProperty("top");
      selectHeader.style.removeProperty("position");
    }
    lastScrollTop = scrollTop;
  });

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");
  function mobileNavToogle() {
    document.querySelector("body").classList.toggle("mobile-nav-active");
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.classList.toggle("bi-list");
      mobileNavToggleBtn.classList.toggle("bi-x");
    }
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener("click", mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle("active");
      this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTopBtn = document.querySelector(".scroll-top");
  function toggleScrollTop() {
    if (scrollTopBtn) {
      window.scrollY > 100
        ? scrollTopBtn.classList.add("active")
        : scrollTopBtn.classList.remove("active");
    }
  }
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Animation on scroll (AOS)
   */
  function aosInit() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }
  }
  window.addEventListener("load", aosInit);

  /**
   * Auto generate carousel indicators
   */
  document
    .querySelectorAll(".carousel-indicators")
    .forEach((carouselIndicator) => {
      carouselIndicator
        .closest(".carousel")
        .querySelectorAll(".carousel-item")
        .forEach((carouselItem, index) => {
          carouselIndicator.innerHTML += `
        <li data-bs-target="#${carouselIndicator.closest(".carousel").id}"
            data-bs-slide-to="${index}"
            class="${index === 0 ? "active" : ""}">
        </li>`;
        });
    });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim(),
      );
      new Swiper(swiperElement, config);
    });
  }
  window.addEventListener("load", initSwiper);

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== "undefined") {
    const glightbox = GLightbox({ selector: ".glightbox" });
  }

  /**
   * Show More / Show Less for long news text
   */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".news-card").forEach((card) => {
      const text = card.querySelector(".news-text");
      const btn = card.querySelector(".show-more-btn");
      if (!text || !btn) return;
      if (text.scrollHeight <= text.clientHeight) {
        btn.style.display = "none";
        return;
      }
      btn.addEventListener("click", function () {
        text.classList.toggle("expanded");
        this.textContent = text.classList.contains("expanded")
          ? "Show less"
          : "Show more";
      });
    });
  });

  /**
   * DA-PREC Auto-Speech, White Text Animation & Voice Controls
   */
  function initAboutSpeech() {
    const contentDiv = document.getElementById("about-content");
    if (!contentDiv) return;

    // Create Floating Control UI
    const controlContainer = document.createElement("div");
    controlContainer.id = "speech-controls";
    controlContainer.innerHTML = `
      <button id="btn-pause-resume" class="ctrl-btn"><i class="bi bi-pause-fill"></i> Pause</button>
      <button id="btn-stop" class="ctrl-btn stop"><i class="bi bi-x-circle"></i> Stop</button>
    `;
    document.body.appendChild(controlContainer);

    const pauseBtn = document.getElementById("btn-pause-resume");
    const stopBtn = document.getElementById("btn-stop");

    const paragraphs = contentDiv.querySelectorAll("p");
    let wordIndexCounter = 0;

    // Break text into hidden spans for animation
    paragraphs.forEach((p) => {
      const words = p.innerText.split(/\s+/);
      p.innerHTML = words
        .map(
          (word) =>
            `<span class="voice-word" id="word-${wordIndexCounter++}">${word}</span>`,
        )
        .join(" ");
    });

    const spans = contentDiv.querySelectorAll(".voice-word");
    const fullText = Array.from(spans)
      .map((s) => s.innerText)
      .join(" ");
    let synth = window.speechSynthesis;
    let isPaused = false;

    function startSpeaking() {
      if (synth.speaking) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.95;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const wordCountBefore = fullText
            .substring(0, charIndex)
            .trim()
            .split(/\s+/).length;
          const currentWordId = charIndex === 0 ? 0 : wordCountBefore;

          spans.forEach((s) => s.classList.remove("word-highlight"));
          const currentSpan = document.getElementById(`word-${currentWordId}`);
          if (currentSpan) {
            currentSpan.classList.add("word-appeared", "word-highlight");
            currentSpan.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      };

      utterance.onend = () => {
        finishSpeechDisplay();
      };

      synth.speak(utterance);
    }

    function finishSpeechDisplay() {
      spans.forEach((s) => {
        s.classList.add("word-appeared");
        s.classList.remove("word-highlight");
      });
      controlContainer.style.opacity = "0";
      setTimeout(() => {
        if (controlContainer.parentNode) controlContainer.remove();
      }, 500);
    }

    // Controls Event Listeners
    pauseBtn.addEventListener("click", () => {
      if (!isPaused) {
        synth.pause();
        isPaused = true;
        pauseBtn.innerHTML = '<i class="bi bi-play-fill"></i> Resume';
        pauseBtn.classList.add("paused");
      } else {
        synth.resume();
        isPaused = false;
        pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
        pauseBtn.classList.remove("paused");
      }
    });

    stopBtn.addEventListener("click", () => {
      synth.cancel();
      finishSpeechDisplay();
    });

    // Initial Delay
    setTimeout(startSpeaking, 1200);
  }

  window.addEventListener("load", initAboutSpeech);
})();
