document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('viewer');
  const pdbInput = document.getElementById('pdbId');
  const loadButton = document.getElementById('loadButton');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewer.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  camera.position.z = 50;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  loadButton.addEventListener('click', () => {
    const pdbId = pdbInput.value.trim();
    if (pdbId) {
      fetch(`https://files.rcsb.org/download/${pdbId}.pdb`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.text();
        })
        .then(data => {
          loadMolecule(data);
        })
        .catch(error => {
          console.error('Error fetching PDB data:', error);
          alert('Error fetching PDB data: ' + error.message);
        });
    }
  });

  function loadMolecule(pdbData) {
    const atoms = parsePDBData(pdbData);
    clearScene();

    atoms.forEach(atom => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: getColorByElement(atom.element) });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(atom.x, atom.y, atom.z);
      scene.add(sphere);
    });
  }

  function parsePDBData(pdbData) {
    const atoms = [];
    const lines = pdbData.split('\n');
    lines.forEach(line => {
      if (line.startsWith('ATOM')) {
        const x = parseFloat(line.substring(30, 38));
        const y = parseFloat(line.substring(38, 46));
        const z = parseFloat(line.substring(46, 54));
        const element = line.substring(76, 78).trim();
        atoms.push({ x, y, z, element });
      }
    });
    console.log('Parsed atoms:', atoms);
    return atoms;
  }

  function getColorByElement(element) {
    const colors = {
      H: 0xffffff,
      C: 0x000000,
      O: 0xff0000,
      N: 0x0000ff,
      S: 0xffff00,
    };
    return colors[element] || 0x00ff00;
  }

  function clearScene() {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    scene.add(ambientLight);
    scene.add(directionalLight);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
