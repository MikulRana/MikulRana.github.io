// Smooth scrolling for nav links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      targetSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
// 3D Viewer functionality using model-viewer
class ModelViewer {
    constructor() {
        this.viewer = null;
        this.currentModel = '4speedtransmission.stl';
        this.autoRotate = true;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Wait for model-viewer to be available
        this.waitForModelViewer();
    }
    
    waitForModelViewer() {
        if (customElements.get('model-viewer')) {
            this.viewer = document.getElementById('3d-viewer');
            console.log('Model viewer initialized');
        } else {
            setTimeout(() => this.waitForModelViewer(), 100);
        }
    }
    
    loadModel(filename) {
        if (!this.viewer) return;
        
        const modelName = filename.replace('.stl', '');
        const modelPath = `assets/models/${filename}`;
        
        console.log('Loading model:', modelPath);
        
        // Update viewer
        this.viewer.src = modelPath;
        this.viewer.alt = modelName;
        
        // Update UI
        document.getElementById('model-name').textContent = modelName;
        document.getElementById('model-info').textContent = 'Interactive 3D Model';
        
        this.currentModel = filename;
    }
    
    resetView() {
        if (!this.viewer) return;
        this.viewer.cameraOrbit = '0deg 75deg 75%';
        this.viewer.cameraTarget = '0m 0m 0m';
    }
    
    toggleRotation() {
        if (!this.viewer) return;
        this.autoRotate = !this.autoRotate;
        this.viewer.autoRotate = this.autoRotate;
        
        const button = document.getElementById('toggle-rotation');
        button.textContent = this.autoRotate ? 'Pause Rotation' : 'Start Rotation';
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

// Initialize model viewer when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the CAD designs section
    if (document.getElementById('3d-viewer')) {
        console.log('Initializing model viewer...');
        new ModelViewer();
    }
});
  