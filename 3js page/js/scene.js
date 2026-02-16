/**
 * Three.js Scene - Immersive 3D Background
 * Scroll-driven camera movement with dynamic shapes
 */

class Scene3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = Utils.isMobile();
        
        // Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Objects
        this.mainGroup = null;
        this.shapes = [];
        this.particles = null;
        this.torusKnot = null;
        this.rings = [];
        this.floatingCubes = [];
        
        // Scroll
        this.scrollProgress = 0;
        this.targetScrollProgress = 0;
        
        // Mouse
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        
        // Animation
        this.isAnimating = true;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createMainGeometry();
        this.createFloatingShapes();
        this.createParticles();
        this.createRings();
        this.addEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.035);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            this.isMobile ? 75 : 60,
            this.width / this.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 10);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
    }

    createLights() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x111122, 0.5);
        this.scene.add(ambient);

        // Main light - pink/red
        const mainLight = new THREE.PointLight(0xff3366, 3, 30);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);
        this.mainLight = mainLight;

        // Secondary - cyan
        const secondLight = new THREE.PointLight(0x00ffcc, 2, 25);
        secondLight.position.set(-5, -3, 3);
        this.scene.add(secondLight);
        this.secondLight = secondLight;

        // Accent - purple
        const accentLight = new THREE.PointLight(0x9945ff, 1.5, 20);
        accentLight.position.set(0, 5, -5);
        this.scene.add(accentLight);

        // Directional for overall illumination
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight.position.set(0, 10, 10);
        this.scene.add(dirLight);
    }

    createMainGeometry() {
        this.mainGroup = new THREE.Group();

        // Central Torus Knot - the hero shape
        const knotGeometry = new THREE.TorusKnotGeometry(2, 0.6, 150, 20, 2, 3);
        const knotMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff3366,
            metalness: 0.3,
            roughness: 0.2,
            transmission: 0.3,
            thickness: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            emissive: 0x330011,
            emissiveIntensity: 0.5
        });
        this.torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
        this.torusKnot.position.set(3, 0, -2);
        this.mainGroup.add(this.torusKnot);

        // Wireframe overlay
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0xff3366,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const wireframe = new THREE.Mesh(knotGeometry.clone(), wireframeMat);
        wireframe.scale.setScalar(1.02);
        this.torusKnot.add(wireframe);

        this.scene.add(this.mainGroup);
    }

    createFloatingShapes() {
        const shapes = [
            { geo: new THREE.IcosahedronGeometry(0.5, 0), pos: [-4, 2, -3], color: 0x00ffcc },
            { geo: new THREE.OctahedronGeometry(0.4, 0), pos: [-3, -2, -1], color: 0x9945ff },
            { geo: new THREE.TetrahedronGeometry(0.4, 0), pos: [5, 3, -4], color: 0x00ffcc },
            { geo: new THREE.IcosahedronGeometry(0.3, 0), pos: [4, -3, -2], color: 0xff3366 },
            { geo: new THREE.DodecahedronGeometry(0.35, 0), pos: [-5, 0, -5], color: 0x9945ff },
            { geo: new THREE.OctahedronGeometry(0.25, 0), pos: [0, 4, -3], color: 0x00ffcc },
        ];

        shapes.forEach((config, i) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: config.color,
                metalness: 0.5,
                roughness: 0.2,
                transmission: 0.5,
                thickness: 0.5,
                emissive: config.color,
                emissiveIntensity: 0.2
            });

            const mesh = new THREE.Mesh(config.geo, material);
            mesh.position.set(...config.pos);
            mesh.userData = {
                originalPos: new THREE.Vector3(...config.pos),
                rotSpeed: {
                    x: Utils.random(0.005, 0.015),
                    y: Utils.random(0.005, 0.015),
                    z: Utils.random(0.002, 0.008)
                },
                floatSpeed: Utils.random(0.5, 1.5),
                floatAmp: Utils.random(0.3, 0.8),
                floatOffset: Utils.random(0, Math.PI * 2)
            };

            // Add glow
            const glowMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.15,
                wireframe: true
            });
            const glow = new THREE.Mesh(config.geo.clone(), glowMat);
            glow.scale.setScalar(1.3);
            mesh.add(glow);

            this.shapes.push(mesh);
            this.scene.add(mesh);
        });

        // Floating cubes scattered around
        const cubeCount = this.isMobile ? 15 : 30;
        for (let i = 0; i < cubeCount; i++) {
            const size = Utils.random(0.05, 0.15);
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshBasicMaterial({
                color: [0xff3366, 0x00ffcc, 0x9945ff][i % 3],
                transparent: true,
                opacity: Utils.random(0.3, 0.7)
            });
            const cube = new THREE.Mesh(geo, mat);
            cube.position.set(
                Utils.random(-15, 15),
                Utils.random(-10, 10),
                Utils.random(-15, 5)
            );
            cube.userData = {
                rotSpeed: Utils.random(0.01, 0.03),
                floatSpeed: Utils.random(0.3, 1),
                originalY: cube.position.y
            };
            this.floatingCubes.push(cube);
            this.scene.add(cube);
        }
    }

    createParticles() {
        const count = this.isMobile ? 1000 : 3000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorOptions = [
            new THREE.Color(0xff3366),
            new THREE.Color(0x00ffcc),
            new THREE.Color(0x9945ff),
            new THREE.Color(0xffffff)
        ];

        for (let i = 0; i < count; i++) {
            // Distribute in a large sphere
            const radius = Utils.random(8, 40);
            const theta = Utils.random(0, Math.PI * 2);
            const phi = Math.acos(Utils.random(-1, 1));

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createRings() {
        const ringConfigs = [
            { radius: 5, tube: 0.015, color: 0xff3366, rotX: Math.PI / 3, rotY: 0 },
            { radius: 6, tube: 0.01, color: 0x00ffcc, rotX: -Math.PI / 4, rotY: Math.PI / 6 },
            { radius: 7, tube: 0.008, color: 0x9945ff, rotX: Math.PI / 6, rotY: -Math.PI / 3 }
        ];

        ringConfigs.forEach(config => {
            const geo = new THREE.TorusGeometry(config.radius, config.tube, 16, 100);
            const mat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.4
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = config.rotX;
            ring.rotation.y = config.rotY;
            ring.userData.rotSpeed = Utils.random(0.001, 0.004);
            this.rings.push(ring);
            this.scene.add(ring);
        });
    }

    setScrollProgress(progress) {
        this.targetScrollProgress = progress;
    }

    addEventListeners() {
        window.addEventListener('resize', Utils.debounce(() => this.onResize(), 200));

        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => {
                this.targetMouse.x = (e.clientX / this.width) * 2 - 1;
                this.targetMouse.y = -(e.clientY / this.height) * 2 + 1;
            });
        }

        document.addEventListener('visibilitychange', () => {
            this.isAnimating = !document.hidden;
            if (this.isAnimating) {
                this.clock.start();
                this.animate();
            }
        });
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = Utils.isMobile();

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        if (!this.isAnimating) return;
        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();

        // Smooth scroll progress
        this.scrollProgress = Utils.lerp(this.scrollProgress, this.targetScrollProgress, 0.08);

        // Smooth mouse
        this.mouse.x = Utils.lerp(this.mouse.x, this.targetMouse.x, 0.05);
        this.mouse.y = Utils.lerp(this.mouse.y, this.targetMouse.y, 0.05);

        // Camera movement based on scroll
        const cameraZ = Utils.lerp(10, 6, this.scrollProgress);
        const cameraY = Utils.lerp(0, 2, this.scrollProgress);
        const cameraX = Utils.lerp(0, -2, this.scrollProgress);

        this.camera.position.x = cameraX + this.mouse.x * 0.5;
        this.camera.position.y = cameraY + this.mouse.y * 0.3;
        this.camera.position.z = cameraZ;

        // Camera look at shifts with scroll
        const lookAtY = Utils.lerp(0, 1, this.scrollProgress);
        this.camera.lookAt(0, lookAtY, 0);

        // Animate main torus knot
        if (this.torusKnot) {
            this.torusKnot.rotation.x = elapsed * 0.15;
            this.torusKnot.rotation.y = elapsed * 0.2;
            
            // Move based on scroll
            this.torusKnot.position.x = Utils.lerp(3, 0, this.scrollProgress);
            this.torusKnot.position.z = Utils.lerp(-2, 2, this.scrollProgress);
        }

        // Animate floating shapes
        this.shapes.forEach(shape => {
            const { rotSpeed, floatSpeed, floatAmp, floatOffset, originalPos } = shape.userData;
            shape.rotation.x += rotSpeed.x;
            shape.rotation.y += rotSpeed.y;
            shape.rotation.z += rotSpeed.z;
            
            shape.position.y = originalPos.y + Math.sin(elapsed * floatSpeed + floatOffset) * floatAmp;
            shape.position.x = originalPos.x + Math.sin(elapsed * floatSpeed * 0.5 + floatOffset) * floatAmp * 0.3;
        });

        // Animate floating cubes
        this.floatingCubes.forEach(cube => {
            cube.rotation.x += cube.userData.rotSpeed;
            cube.rotation.y += cube.userData.rotSpeed * 0.7;
            cube.position.y = cube.userData.originalY + Math.sin(elapsed * cube.userData.floatSpeed) * 0.5;
        });

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y = elapsed * 0.02;
            this.particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
        }

        // Animate rings
        this.rings.forEach(ring => {
            ring.rotation.z += ring.userData.rotSpeed;
        });

        // Animate lights
        if (this.mainLight) {
            this.mainLight.intensity = 3 + Math.sin(elapsed * 2) * 0.5;
        }
        if (this.secondLight) {
            this.secondLight.position.x = Math.sin(elapsed * 0.5) * 5;
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.isAnimating = false;
        this.renderer.dispose();
    }
}

window.Scene3D = Scene3D;
