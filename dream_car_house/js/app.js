// Dream Car House - Interactive Engine (Exact Beg Autos Behavior)

document.addEventListener('DOMContentLoaded', () => {

  renderHomeSlider();
  initPreferenceSection();
  initBrandRunway();
  renderInventory(VEHICLE_DATA);
  renderGallery();
  initRouting();
  initSearch();
  initStickyHeader();
  initLightboxZoomEngine();
  initHeroVideo();
  window.addEventListener('hashchange', initRouting);
});

// ================= Sticky Frosted Glass Header =================
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  let ticking = false;
  const updateHeader = () => {
    if (window.scrollY > 20) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();
}

// ================= Hero Cinematic YouTube Video Engine =================
const HERO_VIDEO_ID = '7cxfVWs4YGw';
const HERO_START_TIME = 45; // Starts directly at showroom glide with gold wall & Rolls-Royce
let heroPlayer = null;
let heroRevealed = false;

function revealHeroVideo() {
  if (heroRevealed) return;
  heroRevealed = true;
  const iframe = document.getElementById('hero-youtube-iframe');
  if (iframe) {
    iframe.classList.add('is-ready');
  }
}

function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById('hero-youtube-iframe');
  if (!iframe) return;

  try {
    heroPlayer = new YT.Player('hero-youtube-iframe', {
      events: {
        onReady: (event) => {
          try {
            event.target.mute();
            event.target.playVideo();
          } catch (e) {}
        },
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING === 1
          if (event.data === 1 && !heroRevealed) {
            // Video is legitimately rendering and playing frames.
            // Wait 2800ms so YouTube's temporary startup bezel/arrows completely vanish
            setTimeout(() => {
              revealHeroVideo();
            }, 2800);
          } else if (event.data === 0) {
            // YT.PlayerState.ENDED === 0: seamless loop back to action sequence
            try {
              if (heroPlayer && typeof heroPlayer.seekTo === 'function') {
                heroPlayer.seekTo(HERO_START_TIME, true);
                heroPlayer.playVideo();
              }
            } catch (e) {}
          }
        }
      }
    });
  } catch (err) {
    console.warn("YouTube API init error, falling back to timer:", err);
  }
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function initHeroVideo() {
  // If YT API is already loaded before DOMContentLoaded
  if (window.YT && window.YT.Player && !heroPlayer) {
    onYouTubeIframeAPIReady();
  }
  // Ultimate fail-safe fallback: reveal smoothly after 4.5s if API is blocked by extensions
  setTimeout(() => {
    revealHeroVideo();
  }, 4500);
}

function changeHeroVideo(youtubeId, startTime = 0) {
  const iframe = document.getElementById('hero-youtube-iframe');
  if (iframe && youtubeId) {
    iframe.classList.remove('is-ready');
    heroRevealed = false;
    iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1&start=${startTime}`;
    setTimeout(() => {
      revealHeroVideo();
    }, 2500);
  }
}
window.changeHeroVideo = changeHeroVideo;

// ================= 3D Supercar Wheel Burnout Spin & Hypercar Menu Launcher =================
let isWheelAnimating = false;
let supercarAudioObj = null;

function getSupercarAudio() {
  if (!supercarAudioObj) {
    const existing = document.getElementById('supercar-rev-audio');
    if (existing) {
      supercarAudioObj = existing;
    } else {
      supercarAudioObj = new Audio('assets/supercar_engine_rev.wav');
    }
  }
  return supercarAudioObj;
}

function playSupercarEngineRev() {
  let playedSuccessfully = false;
  try {
    const audio = getSupercarAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.95;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => { playedSuccessfully = true; })
          .catch(() => {
            // Browser blocked audio element -> trigger synthesized Web Audio fallback immediately
            synthesizeWebAudioRev();
          });
      } else {
        playedSuccessfully = true;
      }
    }
  } catch (err) {
    synthesizeWebAudioRev();
  }

  // Also synthesize Web Audio dual rumble for maximum richness
  if (!playedSuccessfully) {
    synthesizeWebAudioRev();
  }
}

function synthesizeWebAudioRev() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    
    // Rev curve: idle rumble -> explosive acceleration throttle -> high RPM peak
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.90);
    osc.frequency.exponentialRampToValueAtTime(90, now + 1.25);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.40, now + 0.15); // Rich and audible!
    gain.gain.linearRampToValueAtTime(0.35, now + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  } catch (err) {
    // Audio optional - fail gracefully
  }
}

function handleWheelMenuClick(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const wheelBtn = document.getElementById('header-menu-btn');

  // If already open, close it cleanly
  if (drawer && drawer.classList.contains('open')) {
    closeDrawer();
    return;
  }

  if (isWheelAnimating) return;
  isWheelAnimating = true;

  // 1. Play roaring supercar engine rev + burnout sound instantly!
  playSupercarEngineRev();

  // 2. Trigger the photorealistic 3D wheel burnout spin animation (1440 deg)
  if (wheelBtn) {
    wheelBtn.classList.remove('wheel-spinning');
    void wheelBtn.offsetWidth; // Force CSS reflow to re-trigger spin animation
    wheelBtn.classList.add('wheel-spinning');
  }

  // 3. User requested: "click korle 1 theke 1.2 second eta speed e ghure tarpor motion er moto kore gari ber hobe ba menu ashbe"
  // Keep the wheel spinning intensely for 1.15s, then launch the hypercar menu!
  setTimeout(() => {
    if (backdrop) {
      backdrop.classList.add('active');
    }
    if (drawer) {
      drawer.classList.add('open');
    }
    if (wheelBtn) {
      wheelBtn.classList.add('menu-active');
    }
    document.body.style.overflow = 'hidden';
  }, 1150);

  setTimeout(() => {
    isWheelAnimating = false;
  }, 1450);
}

function openDrawer() {
  handleWheelMenuClick();
}

function closeDrawer() {
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const wheelBtn = document.getElementById('header-menu-btn');

  if (drawer) {
    drawer.classList.remove('open');
  }
  if (backdrop) {
    backdrop.classList.remove('active');
  }
  if (wheelBtn) {
    wheelBtn.classList.remove('wheel-spinning');
    wheelBtn.classList.remove('menu-active');
  }
  document.body.style.overflow = '';
}

// Press Escape to close drawer
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
  }
});

// Global scope availability
window.handleWheelMenuClick = handleWheelMenuClick;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;

// ================= Home Current Inventory Showcase (Seamless Slow-Motion Marquee) =================
function renderHomeSlider() {
  const track = document.getElementById('home-slider-track');
  if (!track) return;

  // Duplicate list to achieve a seamless, infinite loop with 0 jumping/glitching
  const marqueeData = [...VEHICLE_DATA, ...VEHICLE_DATA];

  track.innerHTML = marqueeData.map(car => {
    const branch = (typeof getCarBranch === 'function') ? getCarBranch(car) : { short_name: 'Kakrail Branch' };
    return `
      <div class="card-item-slider">
        <div class="group" onclick="openCarModal(${car.id})">
          <div class="portrait-image-wrapper" style="position: relative;">
            <img src="${car.image}" alt="${car.name}" loading="lazy">
            <span class="card-branch-tag">${branch.short_name}</span>
          </div>
          <h3 class="card-car-title">${car.name}</h3>
        </div>
      </div>
    `;
  }).join('');

  // Pause on hover / touch interactions for all devices
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
  track.addEventListener('touchstart', () => {
    track.style.animationPlayState = 'paused';
  }, { passive: true });
  track.addEventListener('touchend', () => {
    track.style.animationPlayState = 'running';
  }, { passive: true });
}

// ================= Dedicated Inventory View =================
function renderInventory(list) {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <h3 style="font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">No vehicles found</h3>
        <p style="color: #9ca3af; margin-bottom: 1.5rem;">Try resetting your filters or search keyword.</p>
        <button class="hero-pill-btn" onclick="resetInventoryFilters()" style="margin: 0 auto; display: inline-block;">Reset</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(car => {
    const branch = (typeof getCarBranch === 'function') ? getCarBranch(car) : { short_name: 'Kakrail Branch' };
    return `
      <div class="group" onclick="openCarModal(${car.id})" style="background: #0d0f12; padding: 0.75rem; border-radius: 8px; border: 1px solid #1f2937;">
        <div class="portrait-image-wrapper" style="margin-bottom: 0.5rem; position: relative;">
          <img src="${car.image}" alt="${car.name}" loading="lazy">
          <span class="card-branch-tag">${branch.short_name}</span>
        </div>
        <div style="font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; margin-bottom: 0.25rem;">${car.brand} • ${car.year}</div>
        <h3 class="card-car-title" style="margin-bottom: 0.5rem;">${car.name}</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1f2937; padding-top: 0.5rem;">
          <span style="font-size: 0.85rem; color: #e5e7eb; font-weight: 600;">${car.mileage}</span>
          <span style="font-size: 0.8rem; color: #9ca3af;">${car.fuel_type}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ================= Search & Filter =================
function initSearch() {
  const searchInput = document.getElementById('cars-search-input');
  const brandSelect = document.getElementById('cars-filter-brand');
  const typeSelect = document.getElementById('cars-filter-type');
  const branchSelect = document.getElementById('cars-filter-branch');

  function filter() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const brand = brandSelect ? brandSelect.value : 'all';
    const type = typeSelect ? typeSelect.value : 'all';
    const branch = branchSelect ? branchSelect.value : 'all';

    const filtered = VEHICLE_DATA.filter(car => {
      const matchQuery = !query || car.name.toLowerCase().includes(query) || car.brand.toLowerCase().includes(query);
      const matchBrand = brand === 'all' || car.brand === brand;
      const matchType = type === 'all' || car.car_type === type;
      const matchBranch = branch === 'all' || car.branch_id === branch;
      return matchQuery && matchBrand && matchType && matchBranch;
    });

    renderInventory(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filter);
  if (brandSelect) brandSelect.addEventListener('change', filter);
  if (typeSelect) typeSelect.addEventListener('change', filter);
  if (branchSelect) branchSelect.addEventListener('change', filter);
}

function filterType(type) {
  if (window.location.hash !== '#inventory') {
    window.location.hash = '#inventory';
  }
  initRouting();
  const typeSelect = document.getElementById('cars-filter-type');
  if (typeSelect) {
    typeSelect.value = type;
  }
  const brandSelect = document.getElementById('cars-filter-brand');
  if (brandSelect) brandSelect.value = 'all';
  const branchSelect = document.getElementById('cars-filter-branch');
  if (branchSelect) branchSelect.value = 'all';
  const searchInput = document.getElementById('cars-search-input');
  if (searchInput) searchInput.value = '';

  const filtered = VEHICLE_DATA.filter(c => c.car_type === type);
  renderInventory(filtered.length ? filtered : VEHICLE_DATA);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterBrand(brand) {
  if (window.location.hash !== '#inventory') {
    window.location.hash = '#inventory';
  }
  initRouting();
  const brandSelect = document.getElementById('cars-filter-brand');
  if (brandSelect) {
    brandSelect.value = (brand === 'ALL') ? 'all' : brand;
  }
  const typeSelect = document.getElementById('cars-filter-type');
  if (typeSelect) typeSelect.value = 'all';
  const branchSelect = document.getElementById('cars-filter-branch');
  if (branchSelect) branchSelect.value = 'all';
  const searchInput = document.getElementById('cars-search-input');
  if (searchInput) searchInput.value = '';

  const filtered = (brand === 'ALL')
    ? VEHICLE_DATA
    : VEHICLE_DATA.filter(c => c.brand.toLowerCase() === brand.toLowerCase() || c.name.toLowerCase().includes(brand.toLowerCase()));
  
  renderInventory(filtered.length ? filtered : VEHICLE_DATA);

  const chips = document.querySelectorAll('.drawer-marque-chip');
  chips.forEach(chip => {
    if (chip.textContent.trim().toLowerCase().includes(brand.toLowerCase()) || (brand === 'ALL' && chip.textContent.trim() === 'All')) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetInventoryFilters() {
  const searchInput = document.getElementById('cars-search-input');
  const brandSelect = document.getElementById('cars-filter-brand');
  const typeSelect = document.getElementById('cars-filter-type');
  const branchSelect = document.getElementById('cars-filter-branch');

  if (searchInput) searchInput.value = '';
  if (brandSelect) brandSelect.value = 'all';
  if (typeSelect) typeSelect.value = 'all';
  if (branchSelect) branchSelect.value = 'all';

  renderInventory(VEHICLE_DATA);
}

// ================= Routing =================
function initRouting() {
  const hash = window.location.hash || '#home';
  const homeView = document.getElementById('view-home');
  const inventoryView = document.getElementById('view-inventory');
  const galleryView = document.getElementById('view-gallery');
  const sellView = document.getElementById('view-sell');
  const aboutView = document.getElementById('view-about');
  const contactView = document.getElementById('view-contact');

  if (homeView) homeView.style.display = 'none';
  if (inventoryView) inventoryView.style.display = 'none';
  if (galleryView) galleryView.style.display = 'none';
  if (sellView) sellView.style.display = 'none';
  if (aboutView) aboutView.style.display = 'none';
  if (contactView) contactView.style.display = 'none';

  if (hash === '#inventory') {
    if (inventoryView) inventoryView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === '#gallery') {
    if (galleryView) galleryView.style.display = 'block';
    renderGallery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === '#sell') {
    if (sellView) sellView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === '#about') {
    if (aboutView) aboutView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === '#contact') {
    if (homeView) homeView.style.display = 'block';
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      setTimeout(() => { contactEl.scrollIntoView({ behavior: 'smooth' }); }, 50);
    }
  } else {
    if (homeView) homeView.style.display = 'block';
    if (hash && hash !== '#home') {
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        setTimeout(() => { targetEl.scrollIntoView({ behavior: 'smooth' }); }, 50);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Update drawer nav active state
  const drawerLinks = document.querySelectorAll('.drawer-nav-item');
  drawerLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === hash || ((hash === '' || hash === '#home') && href === '#home')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ================= Showroom Gallery Data & Lightbox Engine =================
const GALLERY_DATA = [
  {
    id: 1,
    title: "Mercedes-Maybach S 680 Bi-Turbo V12",
    category: "sedans",
    categoryLabel: "Flagship V12",
    image: "https://www.begautos.com/media/temp/91_20-2026-07-06-12-49-04_optimized.webp",
    desc: "Obsidian Black over Silk Nappa. First-class rear executive suite with active road noise cancellation and champagne flutes."
  },
  {
    id: 2,
    title: "Rolls-Royce Ghost Extended",
    category: "sedans",
    categoryLabel: "Bespoke Sanctuary",
    image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=2560&q=95",
    desc: "Goodwood handcrafted. Silver Dawn dual coachline stance with Spirit of Ecstasy, bespoke Starlight headliner, and effortless doors."
  },
  {
    id: 3,
    title: "Porsche 911 GT3 Track Benchmark",
    category: "supercars",
    categoryLabel: "Stuttgart Benchmark",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2560&q=95",
    desc: "Carrara White Metallic with center-lock satin black forged wheels. 4.0L naturally aspirated flat-6 tuned for track and alpine grand touring."
  },
  {
    id: 4,
    title: "Range Rover SV Autobiography LWB",
    category: "suvs",
    categoryLabel: "British Flagship SUV",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2560&q=95",
    desc: "Santorini Black over Ebony leather. Long wheelbase executive seating with 24-way heated hot-stone massage chairs."
  },
  {
    id: 5,
    title: "Maybach First-Class Executive Lounge",
    category: "cockpit",
    categoryLabel: "Artisan Cockpit",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2560&q=95",
    desc: "Diamond-quilted exclusive Nappa hide, Burmester 4D high-end sound, and dual 11.6-inch rear touchscreen displays."
  },
  {
    id: 6,
    title: "Toyota Land Cruiser 250 Series",
    category: "suvs",
    categoryLabel: "Off-Road Heritage",
    image: "https://www.begautos.com/media/temp/304_CAR_WEB-2026-10-06-15-28-59_optimized.webp",
    desc: "Brand new 250 series in Obsidian Black. Modern boxy proportions, multi-terrain monitor, and authentic 4WD pedigree."
  },
  {
    id: 7,
    title: "Lexus LX 600 VIP 4-Seater",
    category: "suvs",
    categoryLabel: "Flagship Luxury SUV",
    image: "https://www.begautos.com/media/temp/31_DSC_3754-2026-02-18-12-48-57_optimized.webp",
    desc: "Pearl White with Mark Levinson 25-speaker audio and independent Ottoman rear seats with 48-degree recline."
  },
  {
    id: 8,
    title: "Mercedes-Benz G 580 Electric EQ",
    category: "suvs",
    categoryLabel: "Electric G-Wagon",
    image: "https://www.begautos.com/media/temp/298_CAR_WEB-2026-10-04-11-15-48_optimized.webp",
    desc: "Individual wheel electric torque vectoring and iconic squared-off G-Class silhouette inducted into our Dhaka showroom."
  },
  {
    id: 9,
    title: "BMW 745Le xDrive Executive Lounge",
    category: "sedans",
    categoryLabel: "Executive Hybrid",
    image: "https://www.begautos.com/media/temp/291_CAR_WEB-2026-09-23-13-44-24_optimized.webp",
    desc: "Donington Grey with Bowers & Wilkins Diamond Surround audio, Sky Lounge LED panoramic roof, and rear console tablet."
  },
  {
    id: 10,
    title: "Porsche Panamera Turbo Executive",
    category: "sedans",
    categoryLabel: "Grand Tourer Sedan",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95",
    desc: "Jet Black Metallic with extended executive wheelbase, active four-way rear spoiler, and 550 hp twin-turbo V8 performance."
  },
  {
    id: 11,
    title: "BMW X7 xDrive40i M-Sport 7-Seater",
    category: "suvs",
    categoryLabel: "Luxury Family 7-Seater",
    image: "https://www.begautos.com/media/temp/257_78-2026-07-07-19-33-44_optimized.webp",
    desc: "Tanzanite Blue Metallic, M-Aerodynamics pack, 22-inch bi-color wheels, and executive 3-row comfort seating."
  },
  {
    id: 12,
    title: "Audi R8 V10 Performance Coupe",
    category: "supercars",
    categoryLabel: "Supercar Track Pace",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=2560&q=95",
    desc: "Daytona Grey with bronze forged wheels. 5.2L naturally aspirated V10 pushing 612 hp with quattro all-wheel drive dynamics."
  },
  {
    id: 13,
    title: "Starlight Roof & Handcrafted Cockpit",
    category: "cockpit",
    categoryLabel: "Interior Artistry",
    image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=2560&q=95",
    desc: "Individual optical fibers woven into pure leather headliner for an ethereal starlight ambiance under Dhaka skies."
  },
  {
    id: 14,
    title: "Toyota Land Cruiser 300 GR Sport",
    category: "suvs",
    categoryLabel: "Gazoo Racing Edition",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2560&q=95",
    desc: "3.5L Twin-Turbo V6 with electronic Kinetic Dynamic Suspension System (e-KDSS) tuned by Toyota Gazoo Racing."
  },
  {
    id: 15,
    title: "Mercedes-Benz S 560e Long Wheelbase",
    category: "sedans",
    categoryLabel: "Flagship Prestige",
    image: "https://www.begautos.com/media/temp/91_20-2026-07-06-12-49-04_optimized.webp",
    desc: "Long wheelbase executive edition with hot-stone massage programs, Burmester acoustics, and airmatic suspension."
  },
  {
    id: 16,
    title: "Nissan Patrol Y62 NISMO Kitted V8",
    category: "suvs",
    categoryLabel: "Desert Legend V8",
    image: "https://www.begautos.com/media/temp/252_CAR_WEB-2026-06-27-16-20-48_optimized.webp",
    desc: "5.6L V8 powerplant equipped with factory NISMO aero bodywork, quad exhaust tips, and Bilstein racing damping."
  },
  {
    id: 17,
    title: "VIP Executive Reclining Suite",
    category: "cockpit",
    categoryLabel: "Bespoke Comfort",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2560&q=95",
    desc: "Twin executive rear consoles featuring powered ottomans, wireless charging trays, and acoustic double glazing."
  },
  {
    id: 18,
    title: "Ferrari F8 Tributo Berlinetta",
    category: "supercars",
    categoryLabel: "Pure Exotic Performance",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=2560&q=95",
    desc: "Rosso Corsa over Nero leather. Mid-engine 710 hp twin-turbo V8 with carbon-fiber aerodynamics and switchable race drive modes."
  },
  {
    id: 19,
    title: "Mercedes-AMG GT R Bi-Turbo Coupe",
    category: "supercars",
    categoryLabel: "AMG Track Beast",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2560&q=95",
    desc: "Magno Selenite Grey finish with yellow ceramic composite calipers, carbon active aero pack, and handcrafted 4.0L Bi-Turbo V8."
  }
];

let currentLightboxIndex = 0;
let currentFilteredGallery = [...GALLERY_DATA];

function renderGallery(category = 'all') {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  currentFilteredGallery = category === 'all'
    ? GALLERY_DATA
    : GALLERY_DATA.filter(item => item.category === category);

  const counterBadge = document.getElementById('gallery-counter-badge');
  if (counterBadge) {
    counterBadge.textContent = currentFilteredGallery.length;
  }

  grid.innerHTML = currentFilteredGallery.map((item, index) => `
    <div class="gallery-flip-card group" onclick="this.classList.toggle('is-flipped')">
      <div class="gallery-flip-inner">
        <!-- Front: Clean, Pristine High-Res Photography -->
        <div class="gallery-flip-front">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <div class="gallery-front-overlay"></div>
          <div class="gallery-front-top">
            <span class="gallery-front-badge">${item.categoryLabel}</span>
          </div>
        </div>

        <!-- Back: Reverse Side with Specs & Fullscreen Lightbox Action -->
        <div class="gallery-flip-back">
          <div class="gallery-back-top">
            <span class="gallery-back-badge">${item.categoryLabel}</span>
            <span class="gallery-back-idx">#${String(index + 1).padStart(2, '0')}</span>
          </div>
          <div class="gallery-back-content">
            <h3 class="gallery-back-title">${item.title}</h3>
            <p class="gallery-back-desc">${item.desc}</p>
          </div>
          <div class="gallery-back-bottom">
            <div class="gallery-back-actions">
              <a href="${item.youtubeUrl || 'https://www.youtube.com'}" target="_blank" rel="noopener noreferrer" class="gallery-back-lightbox-btn" onclick="event.stopPropagation()">
                <span>View Media Spotlight</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
              <button class="gallery-action-icon-btn" onclick="event.stopPropagation(); openGalleryLightbox(${index})" title="View Fullscreen HD Photo" aria-label="View Fullscreen HD Photo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterGalleryCategory(category, buttonEl) {
  if (buttonEl) {
    const pills = document.querySelectorAll('.gallery-filter-pill');
    pills.forEach(p => p.classList.remove('active'));
    buttonEl.classList.add('active');
  }
  renderGallery(category);
}

// ================= Fullscreen Cinema Lightbox & Zoom Engine =================
let currentLightboxZoom = 1.0;
const LIGHTBOX_MIN_ZOOM = 1.0;
const LIGHTBOX_MAX_ZOOM = 3.5;
const LIGHTBOX_ZOOM_STEP = 0.25;
let lightboxPanX = 0;
let lightboxPanY = 0;
let isLightboxDragging = false;
let lightboxDragStartX = 0;
let lightboxDragStartY = 0;
let lightboxInitialPanX = 0;
let lightboxInitialPanY = 0;
let lightboxZoomEngineInitialized = false;

function applyLightboxTransform(animate = true) {
  const img = document.getElementById('lightbox-main-img');
  const stage = document.getElementById('lightbox-stage-wrap');
  const zoomVal = document.getElementById('lightbox-zoom-val');
  const outBtn = document.getElementById('lightbox-zoom-out-btn');
  const inBtn = document.getElementById('lightbox-zoom-in-btn');

  if (!img) return;

  // Clamp zoom value safely
  currentLightboxZoom = Math.min(Math.max(currentLightboxZoom, LIGHTBOX_MIN_ZOOM), LIGHTBOX_MAX_ZOOM);

  // If at default 1.0x, keep pan centered
  if (currentLightboxZoom <= 1.0) {
    currentLightboxZoom = 1.0;
    lightboxPanX = 0;
    lightboxPanY = 0;
  } else if (stage) {
    // Restrict pan bounds so image remains in view
    const stageRect = stage.getBoundingClientRect();
    const renderedW = img.offsetWidth * currentLightboxZoom;
    const renderedH = img.offsetHeight * currentLightboxZoom;
    const maxPanX = Math.max(0, (renderedW - stageRect.width) / 2 + 100);
    const maxPanY = Math.max(0, (renderedH - stageRect.height) / 2 + 100);
    lightboxPanX = Math.min(Math.max(lightboxPanX, -maxPanX), maxPanX);
    lightboxPanY = Math.min(Math.max(lightboxPanY, -maxPanY), maxPanY);
  }

  // Set transition mode
  if (animate) {
    img.style.transition = 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
  } else {
    img.style.transition = 'none';
  }

  // Apply matrix/transform
  img.style.transform = `translate(${lightboxPanX}px, ${lightboxPanY}px) scale(${currentLightboxZoom})`;

  // Cursor & stage states
  if (stage) {
    if (currentLightboxZoom > 1.0) {
      stage.classList.add('is-zoomed');
      img.style.cursor = isLightboxDragging ? 'grabbing' : 'grab';
    } else {
      stage.classList.remove('is-zoomed');
      stage.classList.remove('is-dragging');
      img.style.cursor = 'zoom-in';
    }
  }

  // Update UI badge & buttons
  if (zoomVal) {
    zoomVal.textContent = `${Math.round(currentLightboxZoom * 100)}%`;
  }
  if (outBtn) {
    outBtn.disabled = currentLightboxZoom <= LIGHTBOX_MIN_ZOOM;
    outBtn.style.opacity = currentLightboxZoom <= LIGHTBOX_MIN_ZOOM ? '0.35' : '1';
  }
  if (inBtn) {
    inBtn.disabled = currentLightboxZoom >= LIGHTBOX_MAX_ZOOM;
    inBtn.style.opacity = currentLightboxZoom >= LIGHTBOX_MAX_ZOOM ? '0.35' : '1';
  }
}

function zoomInLightbox(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (currentLightboxZoom >= LIGHTBOX_MAX_ZOOM) return;
  currentLightboxZoom = Math.min(LIGHTBOX_MAX_ZOOM, +(currentLightboxZoom + LIGHTBOX_ZOOM_STEP).toFixed(2));
  applyLightboxTransform(true);
}

function zoomOutLightbox(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (currentLightboxZoom <= LIGHTBOX_MIN_ZOOM) return;
  currentLightboxZoom = Math.max(LIGHTBOX_MIN_ZOOM, +(currentLightboxZoom - LIGHTBOX_ZOOM_STEP).toFixed(2));
  applyLightboxTransform(true);
}

function resetLightboxZoom(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  currentLightboxZoom = 1.0;
  lightboxPanX = 0;
  lightboxPanY = 0;
  applyLightboxTransform(true);
}

function toggleLightboxZoom(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (currentLightboxZoom <= 1.05) {
    currentLightboxZoom = 2.0;
  } else {
    currentLightboxZoom = 1.0;
    lightboxPanX = 0;
    lightboxPanY = 0;
  }
  applyLightboxTransform(true);
}

// Expose zoom methods to window scope
window.zoomInLightbox = zoomInLightbox;
window.zoomOutLightbox = zoomOutLightbox;
window.resetLightboxZoom = resetLightboxZoom;
window.toggleLightboxZoom = toggleLightboxZoom;

function initLightboxZoomEngine() {
  if (lightboxZoomEngineInitialized) return;
  const stageWrap = document.getElementById('lightbox-stage-wrap');
  const img = document.getElementById('lightbox-main-img');
  if (!stageWrap || !img) return;

  lightboxZoomEngineInitialized = true;

  // Mouse wheel zoom
  stageWrap.addEventListener('wheel', (e) => {
    const modal = document.getElementById('gallery-lightbox-modal');
    if (!modal || !modal.classList.contains('active')) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      if (currentLightboxZoom < LIGHTBOX_MAX_ZOOM) {
        currentLightboxZoom = Math.min(LIGHTBOX_MAX_ZOOM, +(currentLightboxZoom + LIGHTBOX_ZOOM_STEP).toFixed(2));
        applyLightboxTransform(true);
      }
    } else if (e.deltaY > 0) {
      if (currentLightboxZoom > LIGHTBOX_MIN_ZOOM) {
        currentLightboxZoom = Math.max(LIGHTBOX_MIN_ZOOM, +(currentLightboxZoom - LIGHTBOX_ZOOM_STEP).toFixed(2));
        applyLightboxTransform(true);
      }
    }
  }, { passive: false });

  // Double click toggles between 100% and 200%
  stageWrap.addEventListener('dblclick', (e) => {
    toggleLightboxZoom(e);
  });

  // Mouse drag to pan when zoomed
  stageWrap.addEventListener('mousedown', (e) => {
    if (currentLightboxZoom <= 1.0) return;
    if (e.button !== 0) return;
    isLightboxDragging = true;
    lightboxDragStartX = e.clientX;
    lightboxDragStartY = e.clientY;
    lightboxInitialPanX = lightboxPanX;
    lightboxInitialPanY = lightboxPanY;
    stageWrap.classList.add('is-dragging');
    img.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isLightboxDragging) return;
    const dx = e.clientX - lightboxDragStartX;
    const dy = e.clientY - lightboxDragStartY;
    lightboxPanX = lightboxInitialPanX + dx;
    lightboxPanY = lightboxInitialPanY + dy;
    applyLightboxTransform(false);
  });

  window.addEventListener('mouseup', () => {
    if (!isLightboxDragging) return;
    isLightboxDragging = false;
    const stage = document.getElementById('lightbox-stage-wrap');
    if (stage) stage.classList.remove('is-dragging');
    const image = document.getElementById('lightbox-main-img');
    if (image && currentLightboxZoom > 1.0) image.style.cursor = 'grab';
    applyLightboxTransform(true);
  });

  // Mobile Touch Pinch-to-Zoom & Pan
  let initialTouchDist = 0;
  let initialTouchZoom = 1.0;
  let touchStartPanX = 0;
  let touchStartPanY = 0;
  let touchStartClientX = 0;
  let touchStartClientY = 0;

  stageWrap.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchZoom = currentLightboxZoom;
      e.preventDefault();
    } else if (e.touches.length === 1 && currentLightboxZoom > 1.0) {
      isLightboxDragging = true;
      touchStartClientX = e.touches[0].clientX;
      touchStartClientY = e.touches[0].clientY;
      touchStartPanX = lightboxPanX;
      touchStartPanY = lightboxPanY;
    }
  }, { passive: false });

  stageWrap.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialTouchDist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = (currentDist / initialTouchDist) * initialTouchZoom;
      currentLightboxZoom = Math.min(Math.max(scale, LIGHTBOX_MIN_ZOOM), LIGHTBOX_MAX_ZOOM);
      applyLightboxTransform(false);
      e.preventDefault();
    } else if (e.touches.length === 1 && isLightboxDragging && currentLightboxZoom > 1.0) {
      const dx = e.touches[0].clientX - touchStartClientX;
      const dy = e.touches[0].clientY - touchStartClientY;
      lightboxPanX = touchStartPanX + dx;
      lightboxPanY = touchStartPanY + dy;
      applyLightboxTransform(false);
      e.preventDefault();
    }
  }, { passive: false });

  stageWrap.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialTouchDist = 0;
    }
    if (e.touches.length === 0) {
      isLightboxDragging = false;
      if (currentLightboxZoom <= 1.05) {
        currentLightboxZoom = 1.0;
        lightboxPanX = 0;
        lightboxPanY = 0;
      }
      applyLightboxTransform(true);
    }
  });
}

function openGalleryLightbox(index, customList) {
  if (Array.isArray(customList) && customList.length) {
    currentFilteredGallery = customList;
  }
  if (!currentFilteredGallery || !currentFilteredGallery[index]) return;
  currentLightboxIndex = index;
  initLightboxZoomEngine();
  resetLightboxZoom();
  updateLightboxView();
  const modal = document.getElementById('gallery-lightbox-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  preloadAdjacentLightboxImages();
}

function closeGalleryLightbox(e) {
  if (e && e.target && e.target.closest('.lightbox-cinema-container') && !e.target.closest('.lightbox-close-action') && !e.target.classList.contains('lightbox-close-btn')) {
    return;
  }
  resetLightboxZoom();
  const modal = document.getElementById('gallery-lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  const carModal = document.getElementById('car-modal');
  if (!carModal || !carModal.classList.contains('active')) {
    document.body.style.overflow = '';
  }
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function toggleLightboxFullscreen() {
  const modal = document.getElementById('gallery-lightbox-modal');
  if (!modal) return;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!isFs) {
    const el = modal.requestFullscreen ? modal : document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      });
    } else if (modal.webkitRequestFullscreen) {
      modal.webkitRequestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function preloadAdjacentLightboxImages() {
  if (!currentFilteredGallery || currentFilteredGallery.length <= 1) return;
  const nextIdx = (currentLightboxIndex + 1) % currentFilteredGallery.length;
  const prevIdx = (currentLightboxIndex - 1 + currentFilteredGallery.length) % currentFilteredGallery.length;
  const nextItem = currentFilteredGallery[nextIdx];
  const prevItem = currentFilteredGallery[prevIdx];
  if (nextItem && nextItem.image) {
    const imgN = new Image();
    imgN.src = nextItem.image;
  }
  if (prevItem && prevItem.image) {
    const imgP = new Image();
    imgP.src = prevItem.image;
  }
}

function updateLightboxView() {
  const item = currentFilteredGallery[currentLightboxIndex];
  if (!item) return;

  resetLightboxZoom();

  const img = document.getElementById('lightbox-main-img');
  const cat = document.getElementById('lightbox-category');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const counter = document.getElementById('lightbox-counter');

  if (img) {
    img.style.opacity = '0.4';
    img.src = item.image;
    img.onload = () => {
      img.style.opacity = '1';
    };
    if (img.complete) {
      img.style.opacity = '1';
    }
  }
  if (cat) cat.textContent = item.categoryLabel || 'LUXURY SHOWCASE';
  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.desc;
  if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${currentFilteredGallery.length}`;

  preloadAdjacentLightboxImages();
}

function prevLightboxSlide() {
  if (currentFilteredGallery.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentFilteredGallery.length) % currentFilteredGallery.length;
  updateLightboxView();
}

function nextLightboxSlide() {
  if (currentFilteredGallery.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentFilteredGallery.length;
  updateLightboxView();
}

// Keyboard shortcuts for Lightbox (Left / Right / Escape / F / +, -, 0)
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('gallery-lightbox-modal');
  if (modal && (modal.classList.contains('active') || modal.style.display === 'flex')) {
    if (e.key === 'ArrowLeft') {
      prevLightboxSlide();
    } else if (e.key === 'ArrowRight') {
      nextLightboxSlide();
    } else if (e.key === 'Escape') {
      closeGalleryLightbox();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleLightboxFullscreen();
    } else if (e.key === '+' || e.key === '=' || e.key === 'Add') {
      zoomInLightbox();
    } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
      zoomOutLightbox();
    } else if (e.key === '0') {
      resetLightboxZoom();
    }
  }
});

// ================= Beg Autos Luxury Car Detail Modal =================
function getCarDrivetrain(car) {
  const nameLower = (car.name || '').toLowerCase();
  const capLower = (car.engine_capacity || '').toLowerCase();
  if (capLower.includes('electric') || nameLower.includes('g 580')) {
    return 'Dual Motor Electric AWD';
  } else if (nameLower.includes('mercedes') || nameLower.includes('maybach') || nameLower.includes('amg')) {
    return '9G-Tronic 4MATIC AWD';
  } else if (nameLower.includes('bmw')) {
    return '8-Speed Steptronic xDrive';
  } else if (nameLower.includes('audi')) {
    return 'S-Tronic Quattro AWD';
  } else if (nameLower.includes('land cruiser') || nameLower.includes('toyota') || nameLower.includes('prado')) {
    return 'Full-Time 4WD w/ Crawl Control';
  } else if (nameLower.includes('lexus')) {
    return '10-Speed Direct-Shift 4WD';
  } else if (nameLower.includes('defender') || nameLower.includes('range rover')) {
    return 'Terrain Response 2 AWD';
  } else if (nameLower.includes('porsche')) {
    return '8-Speed PDK AWD';
  }
  return 'Intelligent All-Wheel Drive';
}

// ================= Global Car Modal Gallery State =================
window.currentModalCar = null;
window.currentModalGallery = [];
window.currentCarImageIndex = 0;

function switchCarGalleryImage(idx) {
  if (!window.currentModalGallery || !window.currentModalGallery.length) return;
  const list = window.currentModalGallery;
  if (idx < 0) idx = list.length - 1;
  if (idx >= list.length) idx = 0;
  window.currentCarImageIndex = idx;

  const mainImg = document.getElementById('beg-main-car-img');
  const counter = document.getElementById('beg-img-counter');
  const caption = document.getElementById('beg-active-caption');
  const thumbs = document.querySelectorAll('.beg-thumb-btn');

  if (mainImg) {
    mainImg.style.opacity = '0.35';
    mainImg.src = list[idx].url;
    mainImg.onload = () => { mainImg.style.opacity = '1'; };
    setTimeout(() => { if (mainImg) mainImg.style.opacity = '1'; }, 220);
  }
  if (counter) {
    counter.innerText = `${idx + 1} / ${list.length}`;
  }
  if (caption) {
    caption.innerText = list[idx].caption || 'Vehicle Photo';
  }
  thumbs.forEach((t, i) => {
    if (i === idx) {
      t.classList.add('active');
      t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      t.classList.remove('active');
    }
  });
}

function nextCarGalleryImage(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!window.currentModalGallery || !window.currentModalGallery.length) return;
  switchCarGalleryImage(window.currentCarImageIndex + 1);
}

function prevCarGalleryImage(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!window.currentModalGallery || !window.currentModalGallery.length) return;
  switchCarGalleryImage(window.currentCarImageIndex - 1);
}

function openCarImageLightbox(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!window.currentModalGallery || !window.currentModalGallery.length) return;
  const car = window.currentModalCar;
  const branch = (typeof getCarBranch === 'function') ? getCarBranch(car) : { name: 'Kakrail Branch' };
  
  const carGalleryItems = window.currentModalGallery.map((img, i) => ({
    id: `car-img-${i}`,
    title: `${car ? car.name : 'Vehicle'} • ${img.caption}`,
    category: 'car-detail',
    categoryLabel: img.tag || 'HD VIEW',
    image: img.url,
    desc: `${car ? car.brand : ''} ${car ? car.year : ''} showroom allocation stationed at ${branch.name}.`
  }));

  if (typeof openGalleryLightbox === 'function') {
    openGalleryLightbox(window.currentCarImageIndex || 0, carGalleryItems);
  }
}

function openCarModal(id) {
  const car = VEHICLE_DATA.find(c => c.id === id);
  if (!car) return;

  const modal = document.getElementById('car-modal');
  const content = document.getElementById('modal-body-content');
  if (!modal || !content) return;

  const branch = (typeof getCarBranch === 'function') ? getCarBranch(car) : SHOWROOM_BRANCHES["kakrail"];
  const drivetrain = getCarDrivetrain(car);
  const isBrandNew = car.car_type === 'BRAND_NEW';
  const regText = isBrandNew 
    ? 'Unregistered Direct Import' 
    : (car.registered && car.registered !== 'Available' ? car.registered : 'Dhaka Metro Verified Papers');

  const conditionBadgeHtml = isBrandNew 
    ? `<span class="car-badge-pill pill-brandnew"><span class="pill-dot"></span>BRAND NEW • ZERO METER</span>`
    : `<span class="car-badge-pill pill-preowned"><span class="pill-dot"></span>CERTIFIED PRE-OWNED</span>`;

  // Multi-image gallery list
  const galleryList = (car.images && car.images.length) 
    ? car.images 
    : [{ url: car.image, caption: 'Front 3/4 Exterior Stance', tag: 'EXTERIOR' }];

  window.currentModalCar = car;
  window.currentModalGallery = galleryList;
  window.currentCarImageIndex = 0;

  const waMessage = encodeURIComponent(
    `Hello DREAM CAR HOUSE, I am inquiring about the ${car.name} (${car.year}) allocated at your ${branch.name}. Please share the official spec sheet, showroom availability, and confidential valuation.`
  );
  const waUrl = `https://wa.me/8801615121312?text=${waMessage}`;

  content.innerHTML = `
    <div class="beg-car-modal-wrapper">
      
      <!-- Top Status & Studio Allocation Beacon Bar -->
      <div class="beg-modal-top-bar">
        <div class="beg-modal-badges">
          ${conditionBadgeHtml}
          <div class="beg-showroom-beacon">
            <span class="beacon-pulse"></span>
            <span>${branch.name.toUpperCase()} • PHYSICAL ALLOCATION</span>
          </div>
        </div>
      </div>

      <!-- Main Beg Autos 2-Column Showcase Grid -->
      <div class="beg-car-grid">
        
        <!-- Left Column: Interactive Multi-Photo Cinema Showcase -->
        <div class="beg-car-visual-col">
          <div class="beg-car-img-frame" id="beg-gallery-hero-frame" onclick="openCarImageLightbox(event)" style="cursor: pointer;" title="Inspect in Full Cinema Mode">
            <img src="${galleryList[0].url}" alt="${car.name}" class="beg-car-img" id="beg-main-car-img">
            <div class="beg-car-img-overlay"></div>

            <!-- Top-Right: Image Counter & Cinema Lightbox Button -->
            <div class="beg-img-counter-wrap">
              <span class="beg-img-counter-pill" id="beg-img-counter">1 / ${galleryList.length}</span>
              <button type="button" class="beg-img-expand-btn" onclick="openCarImageLightbox(event)" title="Inspect in Full Cinema Mode">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
            </div>

            <!-- Prev & Next Gallery Navigation Arrows -->
            <button type="button" class="beg-gallery-arrow beg-gallery-prev" onclick="prevCarGalleryImage(event)" aria-label="Previous Photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" class="beg-gallery-arrow beg-gallery-next" onclick="nextCarGalleryImage(event)" aria-label="Next Photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <!-- Bottom Left: Clean Minimal Photo Angle Pill -->
            <div class="beg-photo-angle-pill" id="beg-active-caption">${galleryList[0].caption}</div>
          </div>

          <!-- Multi-Photo Thumbnail Strip Carousel -->
          <div class="beg-thumbnail-strip-wrap">
            <div class="beg-thumbnail-strip" id="beg-thumbnail-strip">
              ${galleryList.map((img, idx) => `
                <button type="button" class="beg-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchCarGalleryImage(${idx})" aria-label="View photo ${idx + 1}: ${img.caption}">
                  <img src="${img.url}" alt="${img.caption}">
                  <span class="thumb-tag">${img.tag || (idx + 1)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Physical Showroom Branch Allocation Box -->
          <div class="beg-branch-allocation-box">
            <div class="branch-alloc-head">
              <div class="branch-alloc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="branch-alloc-meta">
                <div class="branch-alloc-eyebrow">PHYSICAL VEHICLE ALLOCATION</div>
                <div class="branch-alloc-name">${branch.name}</div>
                <div class="branch-alloc-address">${branch.address}</div>
              </div>
            </div>
            <div class="branch-alloc-actions">
              <div class="branch-alloc-hours">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${branch.hours}</span>
              </div>
              <a href="${branch.map_link}" target="_blank" rel="noopener noreferrer" class="branch-alloc-map-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          <!-- Dealership Trust Verification (Beg Autos Standard) -->
          <div class="beg-trust-strip">
            <div class="beg-trust-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <span>100% Genuine Mileage</span>
            </div>
            <div class="beg-trust-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Dhaka Metro Papers</span>
            </div>
            <div class="beg-trust-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Vault Ready Unit</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Vehicle Details, Technical Specifications & VIP Action Suite -->
        <div class="beg-car-info-col">
          
          <div class="beg-car-header">
            <div class="beg-brand-year-tag">${car.brand.toUpperCase()} • PRODUCTION ${car.year}</div>
            <h2 class="beg-car-title">${car.name}</h2>
            <div class="beg-car-price-row">
              <span class="beg-price-label">SHOWROOM VALUATION</span>
              <span class="beg-price-value">${car.price === 'Call for Price' ? 'Price Upon Request • VIP Consultation' : car.price}</span>
            </div>
          </div>

          <p class="beg-car-description">${car.description}</p>

          <!-- 8-Card Technical Specification Matrix (Beg Autos Standard) -->
          <div class="beg-specs-matrix">
            
            <!-- 1. Powertrain / Engine -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">POWERTRAIN</span>
                <span class="beg-spec-value">${car.engine_capacity}</span>
              </div>
            </div>

            <!-- 2. Transmission & Drive -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">TRANSMISSION</span>
                <span class="beg-spec-value">${drivetrain}</span>
              </div>
            </div>

            <!-- 3. Fuel System -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22V4a2 2 0 012-2h6a2 2 0 012 2v18M13 10h4a2 2 0 012 2v4a2 2 0 002 2 2 2 0 002-2V9l-3-3M3 22h10"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">FUEL SYSTEM</span>
                <span class="beg-spec-value">${car.fuel_type}</span>
              </div>
            </div>

            <!-- 4. Odometer / Mileage -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">ODOMETER</span>
                <span class="beg-spec-value">${car.mileage}</span>
              </div>
            </div>

            <!-- 5. Documentation -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">REGISTRATION</span>
                <span class="beg-spec-value">${regText}</span>
              </div>
            </div>

            <!-- 6. Inspection Audit -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">INSPECTION AUDIT</span>
                <span class="beg-spec-value">150-Point Certified</span>
              </div>
            </div>

            <!-- 7. Showroom Branch Location -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">SHOWROOM ALLOCATION</span>
                <span class="beg-spec-value">${branch.short_name}</span>
              </div>
            </div>

            <!-- 8. Delivery Handover -->
            <div class="beg-spec-item">
              <div class="beg-spec-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-2-2l2 2m-5 9l5-5-2-2-5 5v2h2zM3 21l6-6M9 9l3 3"/></svg>
              </div>
              <div class="beg-spec-texts">
                <span class="beg-spec-label">HANDOVER</span>
                <span class="beg-spec-value">Immediate Delivery</span>
              </div>
            </div>

          </div>

          <!-- VIP Actions Suite (Beg Autos Twin Standard) -->
          <div class="beg-vip-actions">
            
            <!-- 1. VIP WhatsApp Concierge Button (Glowing Emerald Aesthetic) -->
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="beg-wa-vip-btn" id="beg-wa-action-btn">
              <div class="beg-btn-left">
                <div class="beg-wa-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
                    <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.838.497 3.633 1.442 5.213L2 22l4.908-1.408c1.517.854 3.238 1.439 5.123 1.439 5.535 0 10.031-4.496 10.031-10.031C22.062 6.496 17.566 2 12.031 2zm5.795 14.285c-.244.686-1.42 1.321-1.956 1.378-.536.057-1.196.229-3.957-.869-3.327-1.323-5.46-4.717-5.626-4.94-.166-.223-1.352-1.8-1.352-3.433 0-1.633.856-2.438 1.161-2.771.305-.333.666-.416.888-.416.222 0 .444.002.638.012.206.01.482-.078.754.577.28.674.957 2.33.1042 2.502.085.172.142.374.028.6-.114.226-.172.367-.342.566-.17.199-.358.444-.512.597-.171.171-.349.356-.15.698.199.342.887 1.464 1.902 2.37 1.309 1.168 2.413 1.53 2.756 1.701.343.171.543.143.744-.086.2-.229.856-.998 1.085-1.341.229-.343.457-.286.771-.171.314.114 1.996.941 2.339 1.112.343.171.571.257.657.4.086.143.086.828-.158 1.514z"/>
                  </svg>
                </div>
                <div class="beg-btn-text-wrap">
                  <span class="beg-btn-main">INQUIRE ON WHATSAPP</span>
                  <span class="beg-btn-sub">Direct Concierge • ${branch.phone}</span>
                </div>
              </div>
              <div class="beg-btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>

            <!-- 2. Titanium White Schedule Private Viewing Button -->
            <button type="button" class="beg-viewing-vip-btn" onclick="openAppointmentModalForCar('${car.name.replace(/'/g, "\\'")}', '${car.year}', '${branch.id}')">
              <div class="beg-btn-left">
                <div class="beg-viewing-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0c10" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div class="beg-btn-text-wrap">
                  <span class="beg-btn-main" style="color: #0a0c10;">BOOK PRIVATE VIEWING</span>
                  <span class="beg-btn-sub" style="color: #475569;">${branch.name} • Private Appointment</span>
                </div>
              </div>
              <div class="beg-btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0c10" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </button>

            <!-- 3. Direct Atelier Hotline Link -->
            <a href="tel:${branch.phone.replace(/[^0-9+]/g, '')}" class="beg-hotline-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              <span>Showroom Desk: <strong>${branch.phone}</strong> (${branch.hours.split('(')[0].trim()})</span>
            </a>

          </div>

        </div>

      </div>

    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCarModal() {
  const modal = document.getElementById('car-modal');
  if (modal) modal.classList.remove('active');
  const appt = document.getElementById('appointment-modal');
  const vid = document.getElementById('experience-video-modal');
  const gal = document.getElementById('gallery-lightbox-modal');
  const drawer = document.getElementById('nav-drawer');
  if (
    (!appt || !appt.classList.contains('active')) &&
    (!vid || !vid.classList.contains('active')) &&
    (!gal || !gal.classList.contains('active')) &&
    (!drawer || !drawer.classList.contains('open'))
  ) {
    document.body.style.overflow = '';
  }
}

function openAppointmentModalForCar(carName, carYear, branchId) {
  closeCarModal();
  openAppointmentModal();
  const notes = document.getElementById('appt-notes');
  const branchSelect = document.getElementById('appt-branch');
  const branch = (branchId && SHOWROOM_BRANCHES[branchId]) ? SHOWROOM_BRANCHES[branchId] : SHOWROOM_BRANCHES["kakrail"];
  
  if (branchSelect) {
    branchSelect.value = branch.id;
  }
  if (notes) {
    notes.value = `Private Viewing for ${carName} (${carYear}) at ${branch.name}`;
  }
}

function switchFooterBranchMap(branchId, btn) {
  if (typeof SHOWROOM_BRANCHES === 'undefined' || !SHOWROOM_BRANCHES[branchId]) return;
  const branch = SHOWROOM_BRANCHES[branchId];
  const iframe = document.querySelector('.map-embed-wrapper-modern iframe');
  const dirLink = document.querySelector('.map-directions-btn');
  const sub = document.querySelector('.footer-col-map .map-subtitle');
  if (iframe) iframe.src = branch.embed_map;
  if (dirLink) dirLink.href = branch.map_link;
  if (sub) sub.innerText = `${branch.name} • ${branch.address}`;
  document.querySelectorAll('.footer-branch-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ================= Luxury Appointment Modal & Inline Booking Handlers =================
function openAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  if (modal) {
    modal.classList.add('active');
    const successMsg = document.getElementById('modal-appointment-success');
    if (successMsg) successMsg.style.display = 'none';
    const form = document.getElementById('appointment-form');
    if (form) form.style.display = 'grid';
  }
}

function closeAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  if (modal) modal.classList.remove('active');
}

function openAppointmentModalForCar(carName, carYear, branchId) {
  closeCarModal();
  openAppointmentModal();
  const notes = document.getElementById('appt-notes');
  if (notes) {
    notes.value = `Private Viewing for ${carName} (${carYear})`;
  }
  const branchSelect = document.getElementById('appt-branch');
  if (branchSelect && branchId) {
    branchSelect.value = branchId;
  }
  const interestSelect = document.getElementById('appt-interest');
  if (interestSelect) {
    interestSelect.value = 'General Showroom VIP Tour';
  }
}

// ================= Experience Video Lightbox Modal Handlers =================
// Distinct 4K Cinematic Luxury Automotive Films (De-duplicated across sections)
const VIDEO_CONFIGS = {
  reel: {
    pill: "FLAGSHIP CINEMATIC REEL",
    title: "Rolls-Royce Cullinan vs Mercedes-Maybach GLS 600",
    sub: "The apex of bespoke automotive luxury and road presence • Kakrail & Gulshan, Dhaka",
    embed: "https://www.youtube.com/embed/9WPmzHuaCo4?autoplay=1&mute=0&rel=0&modestbranding=1"
  },
  tour: {
    pill: "CINEMATIC SHOWROOM TOUR",
    title: "DREAM CAR HOUSE Flagship Atelier Walkthrough",
    sub: "Step inside Dhaka's most prestigious luxury automotive destination • Kakrail & Gulshan, Dhaka",
    embed: "https://www.youtube.com/embed/rOmWSknq9g0?autoplay=1&mute=0&rel=0&modestbranding=1"
  }
};

function openExperienceVideoModal(type = 'reel') {
  const modal = document.getElementById('experience-video-modal');
  const iframe = document.getElementById('experience-video-iframe');
  const config = VIDEO_CONFIGS[type] || VIDEO_CONFIGS.reel;

  if (modal) {
    const pill = modal.querySelector('.video-modal-pill');
    const title = modal.querySelector('.video-modal-title');
    const sub = modal.querySelector('.video-modal-sub');

    if (pill) pill.textContent = config.pill;
    if (title) title.textContent = config.title;
    if (sub) sub.textContent = config.sub;

    if (iframe) {
      iframe.src = config.embed;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeExperienceVideoModal() {
  const modal = document.getElementById('experience-video-modal');
  const iframe = document.getElementById('experience-video-iframe');
  if (modal) {
    modal.classList.remove('active');
    if (iframe) {
      iframe.src = ""; // Stop video playback immediately
    }
    document.body.style.overflow = '';
  }
}

// Global modal backdrop close & Escape key handler
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeExperienceVideoModal();
    closeAppointmentModal();
    closeCarModal();
  }
});

document.addEventListener('click', (e) => {
  const videoModal = document.getElementById('experience-video-modal');
  if (videoModal && e.target === videoModal) {
    closeExperienceVideoModal();
  }
  const apptModal = document.getElementById('appointment-modal');
  if (apptModal && e.target === apptModal) {
    closeAppointmentModal();
  }
});

function handleAppointmentSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('appt-name')?.value || 'Guest';
  const phone = document.getElementById('appt-phone')?.value || '';
  const interest = document.getElementById('appt-interest')?.value || '';
  const branchVal = document.getElementById('appt-branch')?.value || 'kakrail';
  const branchObj = (typeof SHOWROOM_BRANCHES !== 'undefined' && SHOWROOM_BRANCHES[branchVal]) ? SHOWROOM_BRANCHES[branchVal] : { name: 'Kakrail Branch & Showroom' };
  const date = document.getElementById('appt-date')?.value || 'Flexible';

  const form = document.getElementById('appointment-form');
  const successMsg = document.getElementById('modal-appointment-success');
  if (form) form.style.display = 'none';
  if (successMsg) {
    successMsg.style.display = 'flex';
    const span = successMsg.querySelector('span');
    if (span) span.textContent = `Thank you, ${name}! Your VIP consultation for "${interest}" at our ${branchObj.name} has been reserved. Our concierge will contact you at ${phone}.`;
  }

  setTimeout(() => {
    closeAppointmentModal();
  }, 4000);
}

// ================= Option 3: Interactive Preference Switcher =================
let activePreferenceTab = 'BRAND_NEW';

function initPreferenceSection() {
  const brandNewBtn = document.getElementById('count-brand-new');
  const preOwnedBtn = document.getElementById('count-pre-owned');

  const brandNewCount = VEHICLE_DATA.filter(c => c.car_type === 'BRAND_NEW').length;
  const preOwnedCount = VEHICLE_DATA.filter(c => c.car_type === 'PRE_OWNED').length;

  if (brandNewBtn) brandNewBtn.textContent = brandNewCount;
  if (preOwnedBtn) preOwnedBtn.textContent = preOwnedCount;

  renderPreferenceContent(activePreferenceTab);
}

function switchPreferenceTab(type) {
  activePreferenceTab = type;

  const btnBrandNew = document.getElementById('tab-brand-new');
  const btnPreOwned = document.getElementById('tab-pre-owned');

  if (type === 'BRAND_NEW') {
    if (btnBrandNew) {
      btnBrandNew.classList.add('active');
      btnBrandNew.setAttribute('aria-selected', 'true');
    }
    if (btnPreOwned) {
      btnPreOwned.classList.remove('active');
      btnPreOwned.setAttribute('aria-selected', 'false');
    }
  } else {
    if (btnPreOwned) {
      btnPreOwned.classList.add('active');
      btnPreOwned.setAttribute('aria-selected', 'true');
    }
    if (btnBrandNew) {
      btnBrandNew.classList.remove('active');
      btnBrandNew.setAttribute('aria-selected', 'false');
    }
  }

  renderPreferenceContent(type);
}

function renderPreferenceContent(type) {
  const highlightsBar = document.getElementById('preference-highlights-bar');
  const carsGrid = document.getElementById('preference-cars-grid');
  const viewAllBtn = document.getElementById('preference-view-all-btn');
  const viewAllText = document.getElementById('preference-view-all-text');

  if (!highlightsBar || !carsGrid) return;

  const filteredCars = VEHICLE_DATA.filter(c => c.car_type === type);
  const totalCount = filteredCars.length;
  const featuredCars = filteredCars.slice(0, 3);

  // Render highlights without emojis (pure minimalist luxury)
  if (type === 'BRAND_NEW') {
    highlightsBar.innerHTML = `
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>Zero / Minimal Mileage</h4>
          <p>Factory-fresh original condition, untouched luxury and precision.</p>
        </div>
      </div>
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>Direct Global Import</h4>
          <p>Handpicked auction grades with verified import manifests.</p>
        </div>
      </div>
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>Full Showroom Warranty</h4>
          <p>Complete documentation & personalized post-delivery support.</p>
        </div>
      </div>
    `;

    if (viewAllText) viewAllText.textContent = `Explore All Brand New & Reconditioned Collection (${totalCount} Units)`;
    if (viewAllBtn) {
      viewAllBtn.onclick = () => filterType('BRAND_NEW');
    }
  } else {
    highlightsBar.innerHTML = `
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>150+ Point Multi-Inspection</h4>
          <p>Comprehensive engine, transmission, suspension & ECU check.</p>
        </div>
      </div>
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>Dhaka Metro Registered</h4>
          <p>100% verified legal papers with authentic ownership history.</p>
        </div>
      </div>
      <div class="highlight-pill-card">
        <div class="highlight-pill-accent"></div>
        <div class="highlight-pill-content">
          <h4>Showroom Ready</h4>
          <p>Immediate physical test drive & instant ownership handover.</p>
        </div>
      </div>
    `;

    if (viewAllText) viewAllText.textContent = `Explore All Certified Pre-Owned Collection (${totalCount} Units)`;
    if (viewAllBtn) {
      viewAllBtn.onclick = () => filterType('PRE_OWNED');
    }
  }

  // Render showcase cards
  carsGrid.innerHTML = featuredCars.map(car => `
    <div class="pref-car-card group" onclick="openCarModal(${car.id})">
      <div class="pref-car-img-wrap">
        <img src="${car.image}" alt="${car.name}" loading="lazy">
        <span class="pref-car-badge ${car.car_type === 'BRAND_NEW' ? 'pref-badge-brandnew' : 'pref-badge-preowned'}">
          ${car.car_type === 'BRAND_NEW' ? 'Brand New' : 'Certified Pre-Owned'}
        </span>
      </div>

      <div class="pref-car-body">
        <div class="pref-car-meta">${car.brand} • ${car.year}</div>
        <h3 class="pref-car-title">${car.name}</h3>

        <div class="pref-specs-row">
          <div class="pref-spec-item">
            <span class="pref-spec-label">Engine</span>
            <span class="pref-spec-val">${car.engine_capacity}</span>
          </div>
          <div class="pref-spec-item">
            <span class="pref-spec-label">Mileage</span>
            <span class="pref-spec-val">${car.mileage}</span>
          </div>
          <div class="pref-spec-item">
            <span class="pref-spec-label">Fuel</span>
            <span class="pref-spec-val">${car.fuel_type}</span>
          </div>
        </div>

        <div class="pref-action-row" onclick="event.stopPropagation()">
          <button class="pref-inspect-btn" onclick="openCarModal(${car.id})">Inspect Details</button>
          <a href="https://wa.me/8801615121312?text=${encodeURIComponent('Hello DREAM CAR HOUSE, I am inquiring about the ' + car.name + ' (' + car.year + ').')}" target="_blank" class="pref-wa-btn" title="Chat on WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}
// ================= Brand Runway Cinematic Animation =================
// User Concept: Car 1 speeds across from left to right, logos dissolve into dust/smoke.
// Shortly after, Car 2 speeds across from left to right, stamping/laying down logos one by one.
// All logos sit in ONE clean horizontal line on the road.

// ================= Brand Runway Cinematic Animation =================
// Dynamic 8-by-8 Marque Batch Cycling System:
// Batch 1 (German & Japanese Flagships) -> Car 1 sweeps away with smoke -> Batch 2 (Supercar & Exotics) stamped by Car 2 -> Car 1 sweeps -> Batch 3 (Hypercars & Bespoke) stamped -> loops back to Batch 1!

const RUNWAY_BATCHES = [
  {
    id: 'flagship',
    name: 'Flagship Luxury',
    badge: 'BATCH 01 / 03',
    brands: [
      {
        name: 'MERCEDES',
        filterBrand: 'Mercedes-Benz',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/><line x1="24" y1="2" x2="24" y2="24" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="5" y2="35" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="43" y2="35" stroke="currentColor" stroke-width="2.2"/><path d="M24 2 L22 24 L24 21 L26 24 Z" fill="currentColor"/><path d="M5 35 L24 24 L22 26 L8 38 Z" fill="currentColor"/><path d="M43 35 L24 24 L26 26 L40 38 Z" fill="currentColor"/></svg>`
      },
      {
        name: 'BMW',
        filterBrand: 'BMW',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M24 9 A15 15 0 0 1 39 24 L24 24 Z" fill="#0066b1"/><path d="M9 24 A15 15 0 0 1 24 9 L24 24 Z" fill="#ffffff"/><path d="M24 24 L39 24 A15 15 0 0 1 24 39 Z" fill="#ffffff"/><path d="M24 24 L9 24 A15 15 0 0 0 24 39 Z" fill="#0066b1"/></svg>`
      },
      {
        name: 'LEXUS',
        filterBrand: 'Lexus',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 17 L22 17 L22 31 L34 31" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 17 L32 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
      },
      {
        name: 'TOYOTA',
        filterBrand: 'Toyota',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="15" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="20" rx="14" ry="7" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="6" ry="14" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`
      },
      {
        name: 'AUDI',
        filterBrand: 'Audi',
        svg: `<svg viewBox="0 0 68 32" class="brand-svg-wide"><circle cx="14" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="27" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="41" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="54" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`
      },
      {
        name: 'PORSCHE',
        filterBrand: 'Porsche',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 8 L36 8 L33 34 L24 42 L15 34 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="22" x2="35" y2="22" stroke="currentColor" stroke-width="1.5"/><rect x="20" y="14" width="8" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`
      },
      {
        name: 'LAND ROVER',
        filterBrand: 'Land Rover',
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="none" stroke="#22c55e" stroke-width="2.2"/><text x="27" y="19" text-anchor="middle" fill="#4ade80" font-size="8.5" font-family="sans-serif" font-weight="800" letter-spacing="1">LAND ROVER</text></svg>`
      },
      {
        name: 'BYD',
        filterBrand: 'BYD',
        svg: `<svg viewBox="0 0 52 32" class="brand-svg-wide"><rect x="3" y="6" width="46" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="2.2"/><text x="26" y="20" text-anchor="middle" fill="currentColor" font-size="11" font-family="sans-serif" font-weight="900" letter-spacing="2">BYD</text></svg>`
      }
    ]
  },
  {
    id: 'exotics',
    name: 'Supercar & Exotics',
    badge: 'BATCH 02 / 03',
    brands: [
      {
        name: 'ROLLS-ROYCE',
        filterBrand: 'Rolls-Royce',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><rect x="10" y="6" width="28" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="24" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text><text x="27" y="32" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text></svg>`
      },
      {
        name: 'BENTLEY',
        filterBrand: 'Bentley',
        svg: `<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M4 20 C14 10 24 10 30 16 C36 10 46 10 56 20 C46 22 36 18 30 18 C24 18 14 22 4 20 Z" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="30" cy="17" rx="8" ry="7" fill="none" stroke="currentColor" stroke-width="2"/><text x="30" y="21" text-anchor="middle" fill="currentColor" font-size="11" font-weight="900" font-family="sans-serif">B</text></svg>`
      },
      {
        name: 'FERRARI',
        filterBrand: 'Ferrari',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 6 L36 6 L33 36 L24 44 L15 36 Z" fill="#ffd700" stroke="#ffd700" stroke-width="1.5"/><path d="M22 13 C23 11 25 11 26 13 C26 15 24 16 26 19 C28 20 30 19 31 22 C31 24 29 25 27 25 C28 27 29 29 28 31 C26 31 25 29 24 27 C23 29 22 31 20 31 C20 28 21 26 22 24 C20 23 19 21 21 19 C22 17 21 15 22 13 Z" fill="#111111"/><rect x="15" y="7" width="6" height="3" fill="#22c55e"/><rect x="21" y="7" width="6" height="3" fill="#ffffff"/><rect x="27" y="7" width="6" height="3" fill="#ef4444"/></svg>`
      },
      {
        name: 'LAMBORGHINI',
        filterBrand: 'Lamborghini',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,5 40,11 36,41 24,46 12,41 8,11" fill="none" stroke="#d97706" stroke-width="2.2"/><path d="M18 20 C20 18 22 19 24 21 C26 19 28 18 30 20 C28 23 29 26 27 29 C25 28 23 28 21 29 C19 26 20 23 18 20 Z" fill="#f59e0b"/><polygon points="24,20 21,24 27,24" fill="#d97706"/></svg>`
      },
      {
        name: 'ASTON MARTIN',
        filterBrand: 'Aston Martin',
        svg: `<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M4 17 C16 9 26 10 32 15 C38 10 48 9 60 17 C50 20 38 18 32 18 C26 18 14 20 4 17 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="15" x2="24" y2="17" stroke="currentColor" stroke-width="1.2"/><line x1="52" y1="15" x2="40" y2="17" stroke="currentColor" stroke-width="1.2"/><rect x="20" y="14" width="24" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="32" y="18.5" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="800" letter-spacing="0.5">ASTON MARTIN</text></svg>`
      },
      {
        name: 'MASERATI',
        filterBrand: 'Maserati',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M24 6 L26 18 L34 11 L32 24 L27 26 L27 34 L29 36 L24 40 L19 36 L21 34 L21 26 L16 24 L14 11 L22 18 Z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round"/><ellipse cx="24" cy="24" rx="20" ry="19" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/></svg>`
      },
      {
        name: 'MCLAREN',
        filterBrand: 'McLaren',
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><path d="M12 21 C22 13 36 12 44 19 C38 15 26 15 12 21 Z" fill="#ef4444"/><text x="27" y="27" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="900" letter-spacing="1.5">MCLAREN</text></svg>`
      },
      {
        name: 'JAGUAR',
        filterBrand: 'Jaguar',
        svg: `<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M10 22 C14 18 20 16 28 17 C34 15 42 12 50 14 C48 16 44 17 40 18 C46 19 50 20 48 23 C42 22 36 21 30 22 C24 23 18 25 10 22 Z" fill="currentColor"/><text x="30" y="29" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="900" letter-spacing="2">JAGUAR</text></svg>`
      }
    ]
  },
  {
    id: 'hypercars',
    name: 'Hypercars & Bespoke',
    badge: 'BATCH 03 / 03',
    brands: [
      {
        name: 'BUGATTI',
        filterBrand: 'Bugatti',
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/><ellipse cx="27" cy="16" rx="23" ry="12" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="2,2"/><text x="27" y="20" text-anchor="middle" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="900" letter-spacing="1">BUGATTI</text></svg>`
      },
      {
        name: 'KOENIGSEGG',
        filterBrand: 'Koenigsegg',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,6 40,12 37,38 24,44 11,38 8,12" fill="none" stroke="#fbbf24" stroke-width="2"/><polygon points="24,12 32,18 24,24 16,18" fill="#3b82f6" opacity="0.8"/><polygon points="24,24 32,30 24,36 16,30" fill="#fbbf24" opacity="0.8"/><circle cx="24" cy="24" r="3" fill="#ffffff"/></svg>`
      },
      {
        name: 'MAYBACH',
        filterBrand: 'Mercedes-Benz',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 12 L36 12 L24 40 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 20 L20 32 L24 23 L28 32 L32 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 16 L22 28 L24 22 L26 28 L30 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
      },
      {
        name: 'CADILLAC',
        filterBrand: 'Cadillac',
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><polygon points="27,6 45,13 41,27 27,30 13,27 9,13" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="1.2"/><rect x="22" y="11" width="10" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="27" cy="17" r="2" fill="currentColor"/></svg>`
      },
      {
        name: 'ALFA ROMEO',
        filterBrand: 'Alfa Romeo',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="#dc2626" stroke-width="2.2"/><circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.2"/><path d="M14 24 L24 24" stroke="#dc2626" stroke-width="3"/><path d="M24 14 L24 34" stroke="#dc2626" stroke-width="3"/><path d="M24 18 C28 18 31 20 31 24 C31 28 28 30 24 30" fill="none" stroke="#22c55e" stroke-width="2"/></svg>`
      },
      {
        name: 'VOLVO',
        filterBrand: 'Volvo',
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="33" y1="15" x2="42" y2="6" stroke="currentColor" stroke-width="3"/><polygon points="42,6 36,6 42,12" fill="currentColor"/><rect x="8" y="21" width="32" height="6" fill="#0f172a" stroke="currentColor" stroke-width="1.2"/><text x="24" y="26" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="900" letter-spacing="1">VOLVO</text></svg>`
      },
      {
        name: 'GENESIS',
        filterBrand: 'Genesis',
        svg: `<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M6 18 C18 12 26 12 32 17 C38 12 46 12 58 18 C50 20 40 18 32 19 C24 18 14 20 6 18 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><polygon points="32,15 37,20 32,24 27,20" fill="currentColor"/><text x="32" y="29" text-anchor="middle" fill="currentColor" font-size="6" font-family="sans-serif" font-weight="800" letter-spacing="2">GENESIS</text></svg>`
      },
      {
        name: 'RANGE ROVER',
        filterBrand: 'Land Rover',
        svg: `<svg viewBox="0 0 56 32" class="brand-svg-wide"><rect x="3" y="6" width="50" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="28" y="19" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="800" letter-spacing="1.5">RANGE ROVER</text></svg>`
      }
    ]
  }
];

const CAR_SVG_SWEEPER = `
<svg class="runway-car-svg" viewBox="0 0 170 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 32 C16 28 26 27 36 27 C44 27 52 18 70 15 C90 12 118 14 132 22 C142 23 154 26 160 30 C162 32 162 35 158 36 C150 38 140 38 130 38 C128 33 122 29 114 29 C106 29 100 33 98 38 L54 38 C52 33 46 29 38 29 C30 29 24 33 22 38 L12 38 C8 38 6 35 12 32 Z" fill="#0f1117" stroke="#dc2626" stroke-width="1.2"/>
  <path d="M64 18 C78 15 110 15 124 22 L116 23 C102 18 80 18 66 21 Z" fill="#ef4444" opacity="0.4"/>
  <path d="M74 17 L106 17 L102 23 L70 23 Z" fill="#05070a" opacity="0.95"/>
  <path d="M4 25 L16 25 L14 28 L6 28 Z" fill="#1e293b"/>
  <line x1="8" y1="28" x2="8" y2="33" stroke="#dc2626" stroke-width="1.5"/>
  <circle cx="114" cy="37" r="9" fill="#05070a" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="114" cy="37" r="4" fill="#dc2626" opacity="0.8"/>
  <circle cx="38" cy="37" r="9" fill="#05070a" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="38" cy="37" r="4" fill="#dc2626" opacity="0.8"/>
  <path d="M6 30 L16 30" stroke="#ff0033" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="6" cy="30" rx="4" ry="2" fill="#ff0000" filter="drop-shadow(-4px 0 6px #ff0000)"/>
  <polygon points="6,34 0,33 4,36" fill="#f97316"/>
  <line x1="28" y1="39" x2="128" y2="39" stroke="#ef4444" stroke-width="2" opacity="0.8"/>
</svg>`;

const CAR_SVG_DEPLOYER = `
<svg class="runway-car-svg" viewBox="0 0 170 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headlightBeamGrad" x1="158" y1="30" x2="210" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon points="158,30 215,8 215,48" fill="url(#headlightBeamGrad)" opacity="0.75"/>
  <path d="M12 32 C16 28 26 27 36 27 C44 27 52 18 70 15 C90 12 118 14 132 22 C142 23 154 26 160 30 C162 32 162 35 158 36 C150 38 140 38 130 38 C128 33 122 29 114 29 C106 29 100 33 98 38 L54 38 C52 33 46 29 38 29 C30 29 24 33 22 38 L12 38 C8 38 6 35 12 32 Z" fill="#11141a" stroke="rgba(255, 255, 255, 0.7)" stroke-width="1.4"/>
  <path d="M64 18 C78 15 110 15 124 22 L116 23 C102 18 80 18 66 21 Z" fill="#ffffff" opacity="0.4"/>
  <path d="M74 17 L106 17 L102 23 L70 23 Z" fill="#05070a" opacity="0.9"/>
  <circle cx="114" cy="37" r="9" fill="#090d16" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2"/>
  <circle cx="114" cy="37" r="4" fill="#ffffff"/>
  <circle cx="38" cy="37" r="9" fill="#090d16" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2"/>
  <circle cx="38" cy="37" r="4" fill="#ffffff"/>
  <circle cx="158" cy="29" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)"/>
  <path d="M152 28 L158 30" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <line x1="28" y1="39" x2="128" y2="39" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2.5" opacity="0.9"/>
</svg>`;

let currentRunwayBatch = 0;
let pendingTargetBatch = null;
let runwayCycleTimer = null;
let isRunwayHovered = false;
let isRunwayAnimating = false;

function renderRunwayBatch(batchIdx, dissolved = false) {
  const container = document.getElementById('brand-runway-row');
  if (!container) return;

  const batch = RUNWAY_BATCHES[batchIdx];
  if (!batch) return;

  container.innerHTML = batch.brands.map((b, i) => `
    <div class="runway-brand-card ${dissolved ? 'is-dissolved' : ''}" data-index="${i}" onclick="filterByBrand('${b.filterBrand}')" title="View ${b.name} Collection">
      <div class="brand-badge-inner">
        ${b.svg}
        <span class="runway-brand-name">${b.name}</span>
      </div>
    </div>
  `).join('');

  updateRunwayBatchUI(batchIdx);
}

function updateRunwayBatchUI(batchIdx) {
  const counter = document.getElementById('runway-batch-counter');
  if (counter) {
    counter.textContent = `BATCH 0${batchIdx + 1} / 0${RUNWAY_BATCHES.length}`;
  }

  const buttons = document.querySelectorAll('.runway-batch-btn');
  buttons.forEach((btn, idx) => {
    if (idx === batchIdx) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function switchRunwayBatch(targetIdx) {
  if (targetIdx === currentRunwayBatch && !isRunwayAnimating) return;
  pendingTargetBatch = targetIdx;
  if (runwayCycleTimer) {
    clearTimeout(runwayCycleTimer);
    runwayCycleTimer = null;
  }
  if (!isRunwayAnimating) {
    runwayShowcaseCycle();
  }
}

function filterByBrand(brandName) {
  // Switch to inventory view
  if (window.location.hash !== '#inventory') {
    window.location.hash = '#inventory';
  }
  initRouting();

  // Sync brand dropdown
  const brandSelect = document.getElementById('cars-filter-brand');
  if (brandSelect) {
    const option = Array.from(brandSelect.options).find(opt => opt.value.toLowerCase() === brandName.toLowerCase());
    brandSelect.value = option ? option.value : 'all';
  }

  // Reset search text and type filter
  const searchInput = document.getElementById('cars-search-input');
  if (searchInput) searchInput.value = '';
  const typeSelect = document.getElementById('cars-filter-type');
  if (typeSelect) typeSelect.value = 'all';

  // Filter and render cars
  const filtered = VEHICLE_DATA.filter(c => c.brand.toLowerCase() === brandName.toLowerCase());
  renderInventory(filtered.length ? filtered : VEHICLE_DATA);

  // Scroll to top of inventory page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function triggerRunwayAnimation(force = false) {
  if (isRunwayAnimating && !force) return;
  isRunwayAnimating = false;
  runwayShowcaseCycle();
}

function initBrandRunway() {
  const section = document.getElementById('brand-runway-section');
  if (!section) return;

  // Render initial Batch 0
  renderRunwayBatch(currentRunwayBatch, false);

  const trackWrapper = document.getElementById('runway-track-wrapper');
  if (trackWrapper) {
    trackWrapper.addEventListener('mouseenter', () => {
      isRunwayHovered = true;
    });
    trackWrapper.addEventListener('mouseleave', () => {
      isRunwayHovered = false;
    });
  }

  // Trigger when user scrolls into view
  let hasTriggeredOnScroll = false;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasTriggeredOnScroll) {
          hasTriggeredOnScroll = true;
          setTimeout(() => {
            runwayShowcaseCycle();
          }, 2500);
        }
      });
    }, { threshold: 0.25 });
    observer.observe(section);
  } else {
    runwayCycleTimer = setTimeout(runwayShowcaseCycle, 4000);
  }
}

function runwayShowcaseCycle() {
  if (isRunwayAnimating) return;
  if (isRunwayHovered && pendingTargetBatch === null) {
    runwayCycleTimer = setTimeout(runwayShowcaseCycle, 2000);
    return;
  }

  isRunwayAnimating = true;
  const track = document.getElementById('runway-track-wrapper');
  const carActor = document.getElementById('runway-car-actor');
  const fxLayer = document.getElementById('runway-fx-layer');
  const cards = Array.from(document.querySelectorAll('.runway-brand-card'));

  if (!track || !carActor || !cards.length) {
    isRunwayAnimating = false;
    return;
  }

  const trackRect = track.getBoundingClientRect();
  const trackWidth = track.clientWidth || trackRect.width;
  if (trackWidth <= 0) {
    isRunwayAnimating = false;
    return;
  }

  const cardData = cards.map(c => {
    const r = c.getBoundingClientRect();
    const centerX = r.left + r.width / 2 - trackRect.left;
    const centerY = r.top + r.height / 2 - trackRect.top;
    return {
      el: c,
      ratio: Math.max(0.08, Math.min(0.92, centerX / trackWidth)),
      x: centerX,
      y: centerY
    };
  });

  // ================= PHASE 1: CAR 1 SWEEPS & LOGOS DISSOLVE INTO DUST =================
  carActor.innerHTML = CAR_SVG_SWEEPER;
  carActor.style.transition = 'none';
  carActor.style.left = '-220px';

  // Force reflow
  void carActor.offsetWidth;

  // Stately, majestic sweep pace (3.8 seconds)
  const sweepDuration = 3800; // ms
  carActor.style.transition = `left ${sweepDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
  carActor.style.left = 'calc(100% + 80px)';

  // Schedule dust dissolution for each card as car passes
  cardData.forEach((item) => {
    const triggerTime = Math.max(120, item.ratio * sweepDuration - 100);
    setTimeout(() => {
      // Create multi-particle dust puffs
      for (let p = 0; p < 4; p++) {
        const puff = document.createElement('div');
        puff.className = 'fx-dust-puff';
        const size = 35 + Math.random() * 40;
        puff.style.width = `${size}px`;
        puff.style.height = `${size}px`;
        puff.style.left = `${item.x + (Math.random() * 30 - 15)}px`;
        puff.style.top = `${item.y + (Math.random() * 20 - 10)}px`;
        if (fxLayer) fxLayer.appendChild(puff);

        setTimeout(() => puff.remove(), 950);
      }

      // Card dissolves into smoke
      item.el.classList.remove('is-deploying');
      item.el.classList.add('is-dissolved');
    }, triggerTime);
  });

  // When Car 1 finishes exit: SWAP TO NEXT BATCH!
  setTimeout(() => {
    carActor.style.transition = 'none';
    carActor.style.left = '-220px';

    // Calculate next batch
    if (pendingTargetBatch !== null) {
      currentRunwayBatch = pendingTargetBatch;
      pendingTargetBatch = null;
    } else {
      currentRunwayBatch = (currentRunwayBatch + 1) % RUNWAY_BATCHES.length;
    }

    // Render new batch completely dissolved (invisible)
    renderRunwayBatch(currentRunwayBatch, true);

    // ================= PHASE 2: INTERMISSION & CAR 2 DEPLOYMENT =================
    setTimeout(() => {
      // Re-query newly rendered cards in the DOM
      const newCards = Array.from(document.querySelectorAll('.runway-brand-card'));
      const newCardData = newCards.map(c => {
        const r = c.getBoundingClientRect();
        const centerX = r.left + r.width / 2 - trackRect.left;
        const centerY = r.top + r.height / 2 - trackRect.top;
        return {
          el: c,
          ratio: Math.max(0.08, Math.min(0.92, centerX / trackWidth)),
          x: centerX,
          y: centerY
        };
      });

      carActor.innerHTML = CAR_SVG_DEPLOYER;
      void carActor.offsetWidth;

      // Stately, majestic deployment pace (3.8 seconds)
      const deployDuration = 3800; // ms
      carActor.style.transition = `left ${deployDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
      carActor.style.left = 'calc(100% + 80px)';

      // Behind Car 2, each new brand logo is stamped/printed into place
      newCardData.forEach((item) => {
        const triggerTime = Math.max(150, item.ratio * deployDuration - 40);
        setTimeout(() => {
          // Stamp light flare
          const flare = document.createElement('div');
          flare.className = 'fx-stamp-flare';
          flare.style.left = `${item.x}px`;
          flare.style.top = `${item.y}px`;
          if (fxLayer) fxLayer.appendChild(flare);
          setTimeout(() => flare.remove(), 700);

          // Deploy card with impact
          item.el.classList.remove('is-dissolved');
          item.el.classList.add('is-deploying');

          setTimeout(() => {
            item.el.classList.remove('is-deploying');
          }, 550);
        }, triggerTime);
      });

      // When Car 2 finishes exit
      setTimeout(() => {
        carActor.style.transition = 'none';
        carActor.style.left = '-220px';
        isRunwayAnimating = false;

        // ================= PHASE 3: REST & ADMIRE =================
        // Rest for 8.5 seconds so user can view all 8 brands in one line and interact
        runwayCycleTimer = setTimeout(() => {
          runwayShowcaseCycle();
        }, 8500);
      }, deployDuration + 100);

    }, 1200); // 1.2s calm intermission between Car 1 exit and Car 2 entry
  }, sweepDuration + 100);
}
