/* ==========================================
   AETHERA DIGITAL - INTERACTIVE APP ENGINE
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Set current copyright year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ==========================================
       1. SCROLL REVEAL SYSTEM (Intersection Observer)
       ========================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                
                // If it's a statistic block, trigger its counter
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('counted')) {
                    animateStatCounter(statNumber);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Animate stats counter numbers
    function animateStatCounter(el) {
        el.classList.add('counted');
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * target);
            
            el.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // Header sticky scroll effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================
       2. MOBILE NAVIGATION LOGIC
       ========================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('open');
        document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
    }

    mobileToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileOverlay.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    /* ==========================================
       3. INTERACTIVE HERO CANVAS PARTICLES
       ========================================== */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        // Handle canvas sizing
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        }

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseSize = Math.random() * 2 + 1;
                this.size = this.baseSize;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = (Math.random() - 0.5) * 0.6;
                this.density = (Math.random() * 20) + 10;
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wall collision
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Mouse interaction (push away)
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.hypot(dx, dy);
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        
                        this.x -= directionX * force * 3;
                        this.y -= directionY * force * 3;
                        this.size = this.baseSize * 1.5;
                    } else {
                        if (this.size > this.baseSize) {
                            this.size -= 0.1;
                        }
                    }
                }
            }
        }

        function initParticles() {
            particles = [];
            let particleCount = Math.floor((canvas.width * canvas.height) / 16000);
            // Cap particles on high res screen to optimize CPU cycles
            particleCount = Math.min(particleCount, 80);
            
            for (let i = 0; i < particleCount; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        }

        function drawLines() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let dist = Math.hypot(dx, dy);
                    
                    if (dist < 100) {
                        let opacity = (100 - dist) / 100 * 0.15;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        resizeCanvas();
        animateParticles();
    }

    /* ==========================================
       4. INTERACTIVE PERFORMANCE DIAL SHOWCASE
       ========================================== */
    const optimizeBtn = document.getElementById('optimize-btn');
    const resetSpeedBtn = document.getElementById('reset-speed-btn');
    const dialProgress = document.getElementById('dial-progress');
    const dialScore = document.getElementById('dial-score');
    const dialStatus = document.getElementById('dial-status');
    const stopColor1 = document.getElementById('stop-color-1');
    const stopColor2 = document.getElementById('stop-color-2');
    const shadowGlowColor = document.getElementById('shadow-glow-color');
    const glowRing = document.querySelector('.glow-ring');

    // Speed Lab Text Vitals
    const lcpVal = document.getElementById('lcp-val');
    const tbtVal = document.getElementById('tbt-val');
    const fidVal = document.getElementById('fid-val');
    
    // Bullet Indicators
    const bulletLcp = document.getElementById('bullet-lcp');
    const bulletTbt = document.getElementById('bullet-tbt');
    const bulletSeo = document.getElementById('bullet-seo');

    // Speedometer circumference math (r=85): 2 * PI * 85 = 534
    // Dasharray is 534. Score ranges from 0 (dashoffset 534) to 100 (dashoffset 184 since we leave gaps)
    // Actually our dial track is 350 dasharray. Value circle matches layout details:
    // Stroke-dasharray: 534. Let's calculate standard offsets:
    const SLOW_OFFSET = 380; // Represents 42
    const FAST_OFFSET = 186; // Represents 99

    optimizeBtn.addEventListener('click', () => {
        optimizeBtn.disabled = true;
        optimizeBtn.textContent = 'Optimizing Engine...';
        
        // Step 1: Animate Speedometer Dial
        dialProgress.style.strokeDashoffset = FAST_OFFSET;
        
        // Transition colors from Red to Emerald Green
        stopColor1.setAttribute('stop-color', '#00f5a0');
        stopColor2.setAttribute('stop-color', '#00d9f6');
        shadowGlowColor.setAttribute('flood-color', '#00f5a0');
        glowRing.style.background = 'radial-gradient(circle, rgba(0, 245, 160, 0.15) 0%, transparent 70%)';

        // Step 2: Value Increment Count
        let currentScore = 42;
        const targetScore = 99;
        const scoreInterval = setInterval(() => {
            currentScore++;
            dialScore.textContent = currentScore;
            if (currentScore >= targetScore) {
                clearInterval(scoreInterval);
            }
        }, 30);

        // Step 3: Animate Vitals Text changes
        setTimeout(() => {
            dialStatus.textContent = 'OPTIMIZED';
            dialStatus.style.fill = '#00f5a0';
            
            // Text boxes transition classes
            lcpVal.textContent = '0.2s';
            lcpVal.className = 'vital-value val-good';
            
            tbtVal.textContent = '15ms';
            tbtVal.className = 'vital-value val-good';
            
            fidVal.textContent = '8ms';
            fidVal.className = 'vital-value val-good';

            // Change Bullets list
            bulletLcp.className = 'feat-bullet green-bullet';
            bulletLcp.innerHTML = '⚡ 0.2s LCP (Largest Contentful Paint)';
            
            bulletTbt.className = 'feat-bullet green-bullet';
            bulletTbt.innerHTML = '⚡ 15ms Total Blocking Time (TBT)';
            
            bulletSeo.className = 'feat-bullet green-bullet';
            bulletSeo.innerHTML = '⚡ Google SEO Performance Flags Passed';

            optimizeBtn.style.display = 'none';
            resetSpeedBtn.style.display = 'inline-flex';
            optimizeBtn.disabled = false;
        }, 1800);
    });

    resetSpeedBtn.addEventListener('click', () => {
        resetSpeedBtn.style.display = 'none';
        optimizeBtn.style.display = 'inline-flex';
        optimizeBtn.textContent = 'Supercharge Performance';
        
        dialProgress.style.strokeDashoffset = SLOW_OFFSET;
        
        // Reset dial colors to warning red/orange
        stopColor1.setAttribute('stop-color', '#ff4b2b');
        stopColor2.setAttribute('stop-color', '#ff416c');
        shadowGlowColor.setAttribute('flood-color', '#ff4b2b');
        glowRing.style.background = 'radial-gradient(circle, rgba(255, 75, 43, 0.05) 0%, transparent 70%)';
        
        dialScore.textContent = '42';
        dialStatus.textContent = 'SLOW';
        dialStatus.style.fill = 'var(--text-muted)';

        lcpVal.textContent = '3.8s';
        lcpVal.className = 'vital-value val-bad';
        
        tbtVal.textContent = '480ms';
        tbtVal.className = 'vital-value val-bad';
        
        fidVal.textContent = '110ms';
        fidVal.className = 'vital-value val-bad';

        bulletLcp.className = 'feat-bullet red-bullet';
        bulletLcp.innerHTML = '❌ 3.8s Largest Contentful Paint (LCP)';
        
        bulletTbt.className = 'feat-bullet red-bullet';
        bulletTbt.innerHTML = '❌ 480ms Total Blocking Time (TBT)';
        
        bulletSeo.className = 'feat-bullet red-bullet';
        bulletSeo.innerHTML = '❌ Low Ranking Penalty Triggered';
    });

    /* ==========================================
       5. SOLUTION COST & TIMELINE PLANNER
       ========================================== */
    const serviceInputs = document.querySelectorAll('input[name="calc-service"]');
    const scaleSlider = document.getElementById('scale-slider');
    const priceNumber = document.getElementById('price-number');
    const priceSchedule = document.getElementById('price-schedule');
    const sliderLabels = document.querySelectorAll('.slider-labels .label-opt');
    const roadmapSummary = document.getElementById('roadmap-summary');

    // Prices mapping
    const basePrices = {
        logo: 150,       // Logo Design
        webdesign: 300,  // Website Design
        webdev: 800,     // Website Development
        mobile: 1500,    // Mobile App
        hosting: 20,     // Monthly Hosting
        seo: 300         // Monthly SEO
    };

    // Scale mapping
    const scaleMultipliers = [1.0, 1.5, 2.2];

    function calculateEstimate() {
        let oneTimeTotal = 0;
        let recurringTotal = 0;
        let activeServices = [];

        serviceInputs.forEach(input => {
            const card = input.closest('.selector-card');
            if (input.checked) {
                card.classList.add('active');
                if (input.value === 'logo' || input.value === 'webdesign' || input.value === 'webdev' || input.value === 'mobile') {
                    oneTimeTotal += basePrices[input.value];
                } else {
                    recurringTotal += basePrices[input.value];
                }
                activeServices.push(input.value);
            } else {
                card.classList.remove('active');
            }
        });

        // Determine multiplier from scale slider
        const scaleIndex = parseInt(scaleSlider.value, 10) - 1;
        const multiplier = scaleMultipliers[scaleIndex];

        // Apply scale multiplier
        const finalOneTime = Math.round(oneTimeTotal * multiplier);
        const finalRecurring = Math.round(recurringTotal * multiplier);
        const overallTotal = finalOneTime + finalRecurring;

        // Render dynamic pricing schedule description
        priceNumber.textContent = overallTotal.toLocaleString();
        
        if (finalOneTime > 0 && finalRecurring > 0) {
            priceSchedule.textContent = `$${finalOneTime.toLocaleString()} setup + $${finalRecurring.toLocaleString()}/mo retainer`;
        } else if (finalRecurring > 0) {
            priceSchedule.textContent = `/ month retainer plan`;
        } else {
            priceSchedule.textContent = `one-time setup investment`;
        }

        // Build dynamically generated roadmap checklist
        let roadmapHTML = '';
        if (activeServices.includes('logo')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Custom Brand Identity & Logo Concepts</li>`;
        }
        if (activeServices.includes('webdesign')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Tailored UX/UI Design & Prototyping</li>`;
        }
        if (activeServices.includes('webdev')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Full-Stack Development & CMS Integration</li>`;
            roadmapHTML += `<li><span class="check-icon">✓</span> Performance & Security Hardening</li>`;
        }
        if (activeServices.includes('mobile')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Native/Cross-platform mobile architecture</li>`;
            roadmapHTML += `<li><span class="check-icon">✓</span> App Store deployment & optimization</li>`;
        }
        if (activeServices.includes('hosting')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Cloud Infrastructure Setup & Deployment</li>`;
        }
        if (activeServices.includes('seo')) {
            roadmapHTML += `<li><span class="check-icon">✓</span> Schema structure mapping & target keyword positioning</li>`;
        }

        // Project timeline calculations based on active services
        let weeks = 1;
        if (activeServices.includes('logo')) weeks += 1;
        if (activeServices.includes('webdesign')) weeks += 2;
        if (activeServices.includes('webdev')) weeks += 4;
        if (activeServices.includes('mobile')) weeks += 5;
        if (activeServices.includes('hosting')) weeks += 1;
        if (activeServices.includes('seo')) weeks += 2;
        if (activeServices.length === 0) {
            roadmapHTML = '<li><span class="check-icon">⚠</span> Please select at least one growth service.</li>';
            priceNumber.textContent = '0';
            priceSchedule.textContent = 'Choose offerings above';
        } else {
            roadmapHTML += `<li><span class="check-icon">⏱</span> Estimated deployment timeline: ~${weeks}-${weeks+2} weeks</li>`;
        }
        
        roadmapSummary.innerHTML = roadmapHTML;
    }

    // Attach listeners
    serviceInputs.forEach(input => input.addEventListener('change', calculateEstimate));
    scaleSlider.addEventListener('input', () => {
        // Update label visual active class
        const index = parseInt(scaleSlider.value, 10) - 1;
        sliderLabels.forEach((label, idx) => {
            if (idx === index) {
                label.classList.add('active-lbl');
            } else {
                label.classList.remove('active-lbl');
            }
        });
        calculateEstimate();
    });

    // Handle budget CTA click to transfer choices to the contact form service select box
    const calculatorCta = document.getElementById('calculator-cta');
    const formServiceSelect = document.getElementById('form-service');
    if (calculatorCta && formServiceSelect) {
        calculatorCta.addEventListener('click', () => {
            let activeServices = [];
            serviceInputs.forEach(input => {
                if (input.checked) activeServices.push(input.value);
            });

            if (activeServices.includes('logo') && activeServices.includes('webdesign') && activeServices.includes('webdev') && activeServices.includes('mobile') && activeServices.includes('hosting') && activeServices.includes('seo')) {
                formServiceSelect.value = 'all';
            } else if (activeServices.includes('logo')) {
                formServiceSelect.value = 'logo';
            } else if (activeServices.includes('webdesign')) {
                formServiceSelect.value = 'webdesign';
            } else if (activeServices.includes('webdev')) {
                formServiceSelect.value = 'webdev';
            } else if (activeServices.includes('mobile')) {
                formServiceSelect.value = 'mobile';
            } else if (activeServices.includes('hosting')) {
                formServiceSelect.value = 'hosting';
            } else if (activeServices.includes('seo')) {
                formServiceSelect.value = 'seo';
            }
            
            // Smooth scroll to form section
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Initialize Calculator state
    calculateEstimate();

    /* ==========================================
       6. TESTIMONIALS SLIDER INTERACTION
       ========================================== */
    const testimonialTrack = document.getElementById('testimonial-track');
    const dotNavs = document.querySelectorAll('.dot-nav');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let autoSlideInterval;

    function showSlide(index) {
        testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
        
        dotNavs.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });

        testimonialCards.forEach((card, idx) => {
            card.classList.toggle('active-slide', idx === index);
        });

        currentSlide = index;
    }

    dotNavs.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(autoSlideInterval);
            const index = parseInt(dot.getAttribute('data-index'), 10);
            showSlide(index);
            startAutoSlide(); // resume cycle
        });
    });

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            let nextSlide = (currentSlide + 1) % testimonialCards.length;
            showSlide(nextSlide);
        }, 5500); // 5.5 seconds per slide
    }

    startAutoSlide();

    /* ==========================================
       7. CONTACT FORM VALIDATION & SUBMISSION
       ========================================== */
    const contactForm = document.getElementById('agency-contact-form');
    const successScreen = document.getElementById('form-success-screen');
    const successResetBtn = document.getElementById('success-reset-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Input elements
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Name Validation
        if (nameInput.value.trim() === '') {
            nameInput.classList.add('invalid');
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameInput.classList.remove('invalid');
            nameError.style.display = 'none';
        }

        // Email Validation
        if (!validateEmail(emailInput.value.trim())) {
            emailInput.classList.add('invalid');
            emailError.style.display = 'block';
            isValid = false;
        } else {
            emailInput.classList.remove('invalid');
            emailError.style.display = 'none';
        }

        if (isValid) {
            // Loading Animation state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Transmitting Brief...';
            
            // Simulate API request delay
            setTimeout(() => {
                successScreen.classList.add('show');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Project Brief';
            }, 1200);
        }
    });

    successResetBtn.addEventListener('click', () => {
        successScreen.classList.remove('show');
        contactForm.reset();
        nameInput.classList.remove('invalid');
        emailInput.classList.remove('invalid');
        nameError.style.display = 'none';
        emailError.style.display = 'none';
    });

    // Remove red borders immediately when users edit values
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim() !== '') {
            nameInput.classList.remove('invalid');
            nameError.style.display = 'none';
        }
    });

    emailInput.addEventListener('input', () => {
        if (validateEmail(emailInput.value.trim())) {
            emailInput.classList.remove('invalid');
            emailError.style.display = 'none';
        }
    });
});
