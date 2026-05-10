/* ══════════════════════════════════════════════════════
   TRUE NORD PHOTOGRAPHY — script.js
   Vivere Framework v2.0 + Lightbox + Gallery Filter
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict'

  /* ── NAV SCROLL STATE ─────────────────────────────── */
  var navbar = document.querySelector('.navbar')
  if (navbar) {
    var ticking = false
    function updateNav () {
      navbar.classList.toggle('navbar--scrolled',
        (window.scrollY || window.pageYOffset) > 60)
      ticking = false
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateNav); ticking = true }
    }, { passive: true })
    updateNav()
  }

  /* ── NAV TOGGLE ───────────────────────────────────── */
  var navToggle = document.querySelector('.navbar-toggle')
  var navMenu   = document.querySelector('.navbar-mobile')
  if (navToggle && navMenu) {
    function closeNav () {
      navMenu.classList.remove('active')
      navToggle.setAttribute('aria-expanded', 'false')
      var s = navToggle.querySelector('span')
      if (s) s.textContent = '☰'
    }
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('active')
      navToggle.setAttribute('aria-expanded', String(open))
      var s = navToggle.querySelector('span')
      if (s) s.textContent = open ? '✕' : '☰'
    })
    document.addEventListener('click', function (e) {
      if (navbar && !navbar.contains(e.target)) closeNav()
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav()
    })
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav)
    })
  }

  /* ── SCROLL REVEAL ────────────────────────────────── */
  var revealSelectors = '.scroll-fade-up, .scroll-scale, .scroll-slide-left, .scroll-slide-right, .bento-item, .print-card'
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target
          var delay = (el.classList.contains('bento-item') || el.classList.contains('print-card')) ? i * 60 : 0
          setTimeout(function () { el.classList.add('visible') }, delay)
          io.unobserve(el)
        }
      })
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' })
    document.querySelectorAll(revealSelectors).forEach(function (el) {
      io.observe(el)
    })
  } else {
    document.querySelectorAll(revealSelectors).forEach(function (el) {
      el.classList.add('visible')
    })
  }

  /* ── LIGHTBOX ─────────────────────────────────────── */
  var lightbox     = document.getElementById('lightbox')
  var lbImg        = document.getElementById('lb-img')
  var lbCaption    = document.getElementById('lb-caption')
  var lbClose      = document.getElementById('lb-close')
  var lbPrev       = document.getElementById('lb-prev')
  var lbNext       = document.getElementById('lb-next')
  var lbItems      = []
  var lbCurrent    = 0

  function buildLightboxSet () {
    lbItems = Array.from(document.querySelectorAll('[data-lightbox]'))
  }

  function openLightbox (index) {
    if (!lightbox || lbItems.length === 0) return
    lbCurrent = index
    var item   = lbItems[lbCurrent]
    var src    = item.getAttribute('data-src') || item.querySelector('img') && item.querySelector('img').src
    var cap    = item.getAttribute('data-caption') || ''
    if (lbImg) { lbImg.src = src || ''; lbImg.alt = cap }
    if (lbCaption) lbCaption.textContent = cap
    if (lbImg && !lbImg.parentNode.classList.contains('lb-img-wrap')) {
      var wrap = document.createElement('div')
      wrap.className = 'lb-img-wrap'
      lbImg.parentNode.insertBefore(wrap, lbImg)
      wrap.appendChild(lbImg)
      var wm = document.createElement('span')
      wm.className = 'lightbox-watermark'
      wm.textContent = '© True Nord'
      wrap.appendChild(wm)
    }
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
    lightbox.focus()
  }

  function closeLightbox () {
    if (!lightbox) return
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    if (lbImg) lbImg.src = ''
  }

  function lbNavigate (dir) {
    lbCurrent = (lbCurrent + dir + lbItems.length) % lbItems.length
    openLightbox(lbCurrent)
  }

  if (lightbox) {
    buildLightboxSet()

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-lightbox]')
      if (trigger) {
        e.preventDefault()
        buildLightboxSet()
        var idx = lbItems.indexOf(trigger)
        openLightbox(idx >= 0 ? idx : 0)
      }
    })

    if (lbClose) lbClose.addEventListener('click', closeLightbox)
    if (lbPrev)  lbPrev.addEventListener('click', function () { lbNavigate(-1) })
    if (lbNext)  lbNext.addEventListener('click', function () { lbNavigate(1) })

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox()
    })

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return
      if (e.key === 'Escape')      closeLightbox()
      if (e.key === 'ArrowLeft')   lbNavigate(-1)
      if (e.key === 'ArrowRight')  lbNavigate(1)
    })

    /* Swipe support (touch + pointer) */
    var swipeStartX = null, swipeStartTime = null
    function onSwipeStart (clientX) {
      swipeStartX = clientX
      swipeStartTime = Date.now()
    }
    function onSwipeEnd (clientX) {
      if (swipeStartX === null) return
      var dx = clientX - swipeStartX
      var dt = Date.now() - swipeStartTime
      var velocity = Math.abs(dx) / dt
      if (Math.abs(dx) > 40 || velocity > 0.4) lbNavigate(dx < 0 ? 1 : -1)
      swipeStartX = null; swipeStartTime = null
    }
    lightbox.addEventListener('touchstart', function (e) {
      onSwipeStart(e.touches[0].clientX)
    }, { passive: true })
    lightbox.addEventListener('touchend', function (e) {
      onSwipeEnd(e.changedTouches[0].clientX)
    }, { passive: true })
    if (window.PointerEvent) {
      lightbox.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') onSwipeStart(e.clientX)
      })
      lightbox.addEventListener('pointerup', function (e) {
        if (e.pointerType !== 'mouse') onSwipeEnd(e.clientX)
      })
    }
  }

  /* ── GALLERY FILTER ───────────────────────────────── */
  var filterBtns  = document.querySelectorAll('.filter-btn')
  var galleryItems = document.querySelectorAll('.gallery-item')

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active') })
        btn.classList.add('active')
        var filter = btn.getAttribute('data-filter')
        galleryItems.forEach(function (item) {
          var cat = item.getAttribute('data-category') || ''
          if (filter === 'all' || cat === filter) {
            item.classList.remove('gallery-item--hidden')
          } else {
            item.classList.add('gallery-item--hidden')
          }
        })
      })
    })
  }

  /* ── PRINT SIZE SELECTOR ──────────────────────────── */
  document.querySelectorAll('.print-card').forEach(function (card) {
    var sizes = card.querySelectorAll('.print-size-btn')
    var priceEl = card.querySelector('.print-price')
    sizes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizes.forEach(function (b) { b.classList.remove('selected') })
        btn.classList.add('selected')
        var price = btn.getAttribute('data-price')
        if (priceEl && price) {
          priceEl.innerHTML = '$' + price + '<span> USD</span>'
        }
      })
    })
  })

  /* ── CONTACT FORM ─────────────────────────────────── */
  var contactForm = document.getElementById('contact-form')
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault()
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return }
      var btn  = contactForm.querySelector('button[type="submit"]')
      var orig = btn.textContent
      btn.disabled = true
      btn.textContent = 'Sending...'

      function showMsg (msg, type) {
        var ex = contactForm.querySelector('.form-message')
        if (ex) ex.remove()
        var el = document.createElement('div')
        el.className = (type === 'success' ? 'form-success-message' : 'form-error-message') + ' form-message'
        el.setAttribute('role', 'alert')
        el.textContent = msg
        contactForm.insertBefore(el, contactForm.firstChild)
        if (type === 'success') setTimeout(function () { el.remove() }, 8000)
      }

      /* ✏️ EDIT: replace YOUR_FORMSPREE_ID with your Formspree form ID from formspree.io */
      fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      })
      .then(function (res) {
        if (res.ok) {
          showMsg("Thanks! I'll be in touch soon about your print inquiry.", 'success')
          contactForm.reset()
        } else {
          showMsg('Something went wrong — please email tj@truenord.photo directly.', 'error')
        }
      })
      .catch(function () {
        showMsg('Something went wrong — please email tj@truenord.photo directly.', 'error')
      })
      .finally(function () {
        btn.disabled = false
        btn.textContent = orig
      })
    })
  }

  /* ── FOOTER YEAR ──────────────────────────────────── */
  var yr = document.getElementById('footer-year')
  if (yr) yr.textContent = new Date().getFullYear()

  /* ── ACTIVE NAV LINK ──────────────────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('.navbar-mobile a, .footer-nav a').forEach(function (a) {
    var href = a.getAttribute('href')
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page')
    }
  })

  /* ── LQIP BLUR-UP REVEAL ──────────────────────────── */
  function revealImg (img) {
    img.classList.add('loaded')
  }
  document.querySelectorAll('.img-reveal__main').forEach(function (img) {
    if (img.complete && img.naturalWidth) {
      revealImg(img)
    } else {
      img.addEventListener('load', function () { revealImg(img) })
    }
  })

  document.body.classList.add('js-loaded')

  /* ── IMAGE PROTECTION ─────────────────────────────── */

  /* 1. Disable right-click on all images */
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery-item, .photo-section, .feat-item, .print-card-img, .lightbox-inner, .lb-img-wrap')) {
      e.preventDefault()
    }
  })

  /* 2. Prevent drag on all images */
  document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false')
  })
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault()
  })

  /* 3. Block Ctrl+S, Ctrl+U, F12 */
  document.addEventListener('keydown', function (e) {
    var ctrl = e.ctrlKey || e.metaKey
    if (ctrl && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return }
    if (ctrl && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return }
    if (e.key === 'F12') { e.preventDefault(); return }
  })

  /* ── HIDE NAV ON SCROLL DOWN, REVEAL ON SCROLL UP ── */
  var navbar = document.querySelector('.navbar')
  if (navbar) {
    var lastScrollY = window.scrollY
    window.addEventListener('scroll', function () {
      var current = window.scrollY
      if (current > lastScrollY && current > 80) {
        navbar.classList.add('navbar--hidden')
      } else {
        navbar.classList.remove('navbar--hidden')
      }
      lastScrollY = current
    }, { passive: true })
  }

  /* ── BACK TO TOP ── */
  var btt = document.querySelector('.back-to-top')
  if (btt) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btt.classList.add('visible')
      } else {
        btt.classList.remove('visible')
      }
    }, { passive: true })
    btt.addEventListener('click', function (e) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

})()
