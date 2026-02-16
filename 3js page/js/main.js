/**
 * Main Application
 * Initializes and connects all components
 */

class App {
    constructor() {
        this.scene3D = null;
        this.scrollAnimations = null;
        this.loader = document.getElementById('loader');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initScene();
        this.initScrollAnimations();
        this.initSmoothScroll();
        this.hideLoader();
        
        console.log('🎵 Beyond Reality - AR Music Experience Loaded');
    }

    initScene() {
        const canvas = document.getElementById('webgl');
        if (!canvas) return;

        try {
            this.scene3D = new Scene3D(canvas);
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            canvas.style.background = 'radial-gradient(ellipse at center, #1a0a1e 0%, #000000 100%)';
        }
    }

    initScrollAnimations() {
        try {
            this.scrollAnimations = new ScrollAnimations(this.scene3D);
        } catch (error) {
            console.error('Scroll animations failed:', error);
            // Fallback - make elements visible
            document.querySelectorAll('.hero-badge, .title-line, .hero-description, .hero-cta, .scroll-hint, .exp-header, .exp-card, .exp-footer').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }
    }

    initSmoothScroll() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    gsap.to(window, {
                        duration: 1.2,
                        scrollTo: {
                            y: target,
                            autoKill: false
                        },
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }

    hideLoader() {
        // Ensure minimum loading time for smooth transition
        setTimeout(() => {
            if (this.loader) {
                this.loader.classList.add('hidden');
                
                // Remove from DOM after transition
                setTimeout(() => {
                    if (this.loader && this.loader.parentNode) {
                        this.loader.parentNode.removeChild(this.loader);
                    }
                }, 800);
            }
        }, 1200);
    }
}

// Initialize
const app = new App();
window.app = app;
