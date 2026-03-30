// js/3d-bg.js

document.addEventListener("DOMContentLoaded", () => {
    if (typeof THREE === 'undefined') {
        console.warn("ThreeJS not loaded");
        return;
    }

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#0A0A0A', 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    
    // Set transparent background so css radial gradient shines through
    renderer.setClearColor(0x0a0a0a, 0); 
    
    function setSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    setSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // CREATING A STUNNING ABSTRACT 3D SHAPE
    // A wireframe Torus Knot fits the luxury/elegant vibe perfectly
    const geometry = new THREE.TorusKnotGeometry(12, 3, 150, 20);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700, 
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Floating Particles for extra luxury
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xFFD700,
        transparent: true,
        opacity: 0.6
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 25;

    // MOUSE PARALLAX
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        // Gentle rotation
        knot.rotation.x += 0.002;
        knot.rotation.y += 0.003;
        
        particlesMesh.rotation.y = -elapsedTime * 0.05;

        // Interactive movement
        const targetX = mouseX * 2;
        const targetY = mouseY * 2;
        knot.position.x += (targetX - knot.position.x) * 0.05;
        knot.position.y += (targetY - knot.position.y) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', setSize);
});
