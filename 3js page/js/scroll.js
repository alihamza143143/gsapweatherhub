/**
 * Scroll Animations
 * GSAP ScrollTrigger powered animations
 */

class ScrollAnimations {
    constructor(scene3D) {
        this.scene3D = scene3D;
        this.progressBar = document.querySelector('.progress-fill');
        
        gsap.registerPlugin(ScrollTrigger);
        
        this.init();
    }

    init() {
        this.setupScrollProgress();
        this.setupHeroAnimations();
        this.setupExperienceAnimations();
        this.setup3DScroll();
        
        // Refresh after setup
        ScrollTrigger.refresh();
    }

    setupScrollProgress() {
        // Update progress bar
        ScrollTrigger.create({
            trigger: '#scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                if (this.progressBar) {
                    this.progressBar.style.width = `${self.progress * 100}%`;
                }
            }
        });
    }

    setup3DScroll() {
        // Connect scroll to 3D scene
        ScrollTrigger.create({
            trigger: '#scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                if (this.scene3D) {
                    this.scene3D.setScrollProgress(self.progress);
                }
            }
        });
    }

    setupHeroAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Animate hero elements on load
        tl.to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.5
        })
        .to('.title-line:nth-child(1)', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.4')
        .to('.title-line:nth-child(2)', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.7')
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.5')
        .to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.5')
        .to('.scroll-hint', {
            opacity: 1,
            duration: 0.8
        }, '-=0.3');

        // Parallax on scroll out
        gsap.to('.hero-content', {
            y: -100,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        gsap.to('.scroll-hint', {
            opacity: 0,
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: '10% top',
                end: '30% top',
                scrub: 1
            }
        });
    }

    setupExperienceAnimations() {
        // Header
        gsap.to('.exp-header', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#experience',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Cards with stagger
        gsap.to('.exp-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.exp-grid',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });

        // Footer
        gsap.to('.exp-footer', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.exp-footer',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });

        // Stat numbers count up animation
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const endValue = stat.textContent;
            if (!isNaN(parseInt(endValue))) {
                const target = parseInt(endValue);
                gsap.from(stat, {
                    textContent: 0,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    onUpdate: function() {
                        stat.textContent = Math.round(this.targets()[0].textContent);
                        if (endValue.includes('K')) {
                            stat.textContent += 'K+';
                        }
                    }
                });
            }
        });
    }

    refresh() {
        ScrollTrigger.refresh();
    }

    destroy() {
        ScrollTrigger.getAll().forEach(t => t.kill());
    }
}

window.ScrollAnimations = ScrollAnimations;
