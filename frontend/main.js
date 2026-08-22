/* ========================================================
   RAPTOR DEV - JAVASCRIPT PRINCIPAL (MODERNO & NATIVO)
======================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. BARRA DE PROGRESO DE LECTURA (TOP)
    const progressBar = document.getElementById('reading-progress');
    
    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    });

    // 2. EFECTO MÁQUINA DE ESCRIBIR HUMANO (CON TIPEO, ERROR Y BORRADO) EN HERO
    const typedHeadline = document.getElementById("typed-headline");
    const typedSubheadline = document.getElementById("typed-subheadline");
    
    if (typedHeadline && typedSubheadline) {
        const headlineSteps = [
            { type: "Ingene" }, 
            { delete: 3 },      
            { type: "eniería Web.\nAlta velocidad.\n</> Sin excusas." } 
        ];

        const subheadlineText = "Infraestructuras digitales nativas para empresas e instituciones que exigen el máximo rendimiento y conversión.";

        let currentStep = 0;
        let charIndex = 0;
        let currentText = "";

        function formatHeadline(text) {
            let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return safeText.replace("&lt;/&gt; Sin excusas.", "<span class='typed-accent'>&lt;/&gt; Sin excusas.</span>");
        }

        function typeHeadlineHuman() {
            if (currentStep < headlineSteps.length) {
                let step = headlineSteps[currentStep];

                if (step.type) {
                    if (charIndex < step.type.length) {
                        currentText += step.type.charAt(charIndex);
                        typedHeadline.innerHTML = formatHeadline(currentText);
                        charIndex++;
                        setTimeout(typeHeadlineHuman, 110); 
                    } else {
                        charIndex = 0;
                        currentStep++;
                        setTimeout(typeHeadlineHuman, 350); 
                    }
                } 
                else if (step.delete !== undefined) {
                    if (step.delete > 0) {
                        currentText = currentText.slice(0, -1);
                        typedHeadline.innerHTML = formatHeadline(currentText);
                        step.delete--;
                        setTimeout(typeHeadlineHuman, 140); 
                    } else {
                        currentStep++;
                        setTimeout(typeHeadlineHuman, 400); 
                    }
                }
            } else {
                setTimeout(typeSubheadlineHuman, 500);
            }
        }

        let subIndex = 0;
        function typeSubheadlineHuman() {
            if (subIndex < subheadlineText.length) {
                typedSubheadline.textContent += subheadlineText.charAt(subIndex);
                subIndex++;
                setTimeout(typeSubheadlineHuman, 35); 
            }
        }

        setTimeout(typeHeadlineHuman, 500);
    }

    // 3. CONTROL DEL MENÚ MÓVIL FULLSCREEN (FROSTED GLASS)
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        const isOpen = menuToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        mobileOverlay.setAttribute('aria-hidden', !isOpen);
        
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener('click', toggleMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileOverlay.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // 4. BARRA FLOTANTE MÓVIL (STICKY PILL BAR)
    const stickyBar = document.getElementById('sticky-bar');
    const heroSection = document.querySelector('.hero-module');

    if (stickyBar && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            if (heroBottom < 0) {
                stickyBar.classList.add('visible');
            } else {
                stickyBar.classList.remove('visible');
            }
        });
    }

    // 5. SCROLL REVEAL MEDIANTE INTERSECTION OBSERVER (60 FPS)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // 6. EFECTO TEXT REVEAL (SCRUBBING EN SECCIÓN METODOLOGÍA)
    const textElement = document.getElementById('reveal-text');
    
    if (textElement) {
        window.addEventListener('scroll', () => {
            const rect = textElement.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            let progress = 1 - ((rect.top - (windowHeight * 0.2)) / (windowHeight * 0.6));
            
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;
            
            textElement.style.setProperty('--progress', `${progress * 100}%`);
        });
    }

    // 7. MANEJO ASÍNCRONO DEL FORMULARIO DE CONTACTO (CONEXIÓN CON FASTAPI Y REDIRECCIÓN)
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // --- DEFENSA ANTI-SPAM (HONEYPOT) ---
            const botTrap = document.getElementById('bot_trap');
            if (botTrap && botTrap.value !== "") {
                console.warn("Bloqueo de seguridad: Se detectó actividad de bot.");
                contactForm.reset(); 
                return; 
            }
            // ------------------------------------
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Procesando...</span>';
            
            const formData = {
                nombre: document.getElementById('nombre').value.trim(),
                email: document.getElementById('email').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.trim()
            };

            try {
                const response = await fetch('http://127.0.0.1:8000/api/contacto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const resultado = await response.json();

                if (response.ok) {
                    contactForm.reset(); 
                    // Redirección limpia a la página de agradecimiento
                    window.location.href = 'gracias.html';
                } else {
                    alert('Hubo un inconveniente al procesar tu solicitud. Por favor contáctanos directamente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                console.error('Error en el envío:', error);
                alert('No se pudo conectar con el servidor de Raptor Dev.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // 8. CONTROL DEL BANNER DE COOKIES (LOPDP)
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (cookieBanner && acceptCookiesBtn) {
        if (!localStorage.getItem('cookiesAceptadas')) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
                cookieBanner.setAttribute('aria-hidden', 'false');
            }, 1000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAceptadas', 'true');
            cookieBanner.classList.remove('show');
            cookieBanner.setAttribute('aria-hidden', 'true');
        });
    }

}); // <-- Fin de DOMContentLoaded