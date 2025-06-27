// Smooth scrolling for nav links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      targetSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
// Simple 3D Viewer for STL files
class SimpleSTLViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.autoRotate = true;
        
        this.init();
        this.setupEventListeners();
        this.loadModel('4speedtransmission.stl');
    }
    
    init() {
        const container = document.getElementById('3d-viewer');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0xf0f0f0);
        container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add lighting
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, -10, -5);
        this.scene.add(pointLight);
    }
    
    loadModel(filename) {
        const loader = new THREE.STLLoader();
        const modelName = filename.replace('.stl', '');
        
        // Update UI
        document.getElementById('model-name').textContent = modelName;
        document.getElementById('model-info').textContent = 'Loading...';
        
        // Show loading indicator
        const container = document.getElementById('3d-viewer');
        let loadingDiv = container.querySelector('.loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            container.appendChild(loadingDiv);
        }
        loadingDiv.textContent = 'Loading model...';
        
        const modelPath = `assets/models/${filename}`;
        console.log('Loading model:', modelPath);
        
        loader.load(modelPath, (geometry) => {
            // Remove loading indicator
            if (loadingDiv) {
                loadingDiv.remove();
            }
            
            // Remove previous model
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }
            
            // Create material
            const material = new THREE.MeshPhongMaterial({
                color: 0x004080,
                specular: 0x111111,
                shininess: 200
            });
            
            // Create mesh
            this.currentModel = new THREE.Mesh(geometry, material);
            
            // Center the model
            geometry.computeBoundingBox();
            const center = geometry.boundingBox.getCenter(new THREE.Vector3());
            this.currentModel.position.sub(center);
            
            // Scale model to fit view
            const size = geometry.boundingBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            this.currentModel.scale.set(scale, scale, scale);
            
            // Add to scene
            this.scene.add(this.currentModel);
            
            // Update info
            document.getElementById('model-info').textContent = 
                `Vertices: ${geometry.attributes.position.count.toLocaleString()}`;
            
            // Reset camera position
            this.camera.position.set(0, 0, 3);
            this.controls.reset();
            
        }, (progress) => {
            // Loading progress
            const percent = Math.round((progress.loaded / progress.total) * 100);
            if (loadingDiv) {
                loadingDiv.textContent = `Loading model... ${percent}%`;
            }
        }, (error) => {
            // Error handling
            console.error('Error loading STL file:', error);
            if (loadingDiv) {
                loadingDiv.textContent = 'Error loading model';
                loadingDiv.style.color = '#ff0000';
            }
            document.getElementById('model-info').textContent = 'Error loading model';
        });
    }
    
    resetView() {
        this.camera.position.set(0, 0, 3);
        this.controls.reset();
    }
    
    toggleRotation() {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
        
        const button = document.getElementById('toggle-rotation');
        button.textContent = this.autoRotate ? 'Pause Rotation' : 'Start Rotation';
    }
    
    onWindowResize() {
        const container = document.getElementById('3d-viewer');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        // Model selector buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Load selected model
                const filename = e.target.dataset.model;
                this.loadModel(filename);
            });
        });
        
        // Control buttons
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
        });
        
        document.getElementById('toggle-rotation').addEventListener('click', () => {
            this.toggleRotation();
        });
    }
}

// Initialize viewer when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the CAD designs section
    if (document.getElementById('3d-viewer')) {
        // Wait for Three.js to load
        setTimeout(() => {
            try {
                if (typeof THREE === 'undefined') {
                    throw new Error('Three.js not loaded');
                }
                console.log('Initializing STL viewer...');
                new SimpleSTLViewer();
            } catch (error) {
                console.error('Error initializing viewer:', error);
                document.getElementById('3d-viewer').innerHTML = 
                    '<div class="loading" style="color: #ff0000;">Error: Could not initialize 3D viewer</div>';
            }
        }, 500);
    }
});
  