// import * as THREE from 'three'
(() => {
  let container, scene, camera, renderer, control, elOverlay, elAlert, elSuperOverlay
  container = document.getElementById('container')
  elOverlay = document.getElementById('overlay')
  elAlert = document.getElementById('alert-box')
  elSuperOverlay = document.getElementById('super-overlay')

  const defaultMateral = new THREE.MeshLambertMaterial({
    color: 0xeeeeee
  })

  let testMesh
  setupThree()
  addAuxCube()
  setupOrbitalControl()
  render()
  setupDragAndDrop()
  setupInput()
  // loadDraco('data/test.drc')

  function loadDraco(src){
    const loader = new THREE.DRACOLoader()
    THREE.DRACOLoader.setDecoderPath('lib/draco/')
    THREE.DRACOLoader.getDecoderModule()

    /**
     * if file loaded isn't drc, not able to easily catch error. 
     * 
     * This is mainly how loader is built
     */
    loader.load(
      src,
      function(geometry) {
        console.log('loaded')
        geometry.scale(1e-6, 1e-6, 1e-6)
        geometry.computeVertexNormals()
        const mesh = new THREE.Mesh( geometry, defaultMateral )
        mesh.position.set(-100,-100,-100)
        scene.add( mesh )
        
        /**
         * remove place holder mesh
         */
        scene.remove( testMesh )
        if (elOverlay) {
          elOverlay.classList.add('d-none')
        }
      },
      function (xhr) {
        // on progress callback
        console.log('xhr progress')
      },
      function (err) {
        console.error('error', err)
        elAlert.classList.remove('d-none')
        const { srcElement = {} } = err
        const { status = 'unknown status code', statusText = `unknown error` } = srcElement
        elAlert.innerHTML = `error: ${status}, message: ${statusText}`
      }
    )
  }

  function setupOrbitalControl(){
    control = new THREE.OrbitControls(camera, renderer.domElement)
    control.update()
  }

  function addAuxCube(){
    const geometry = new THREE.BoxBufferGeometry( 50, 50, 50 )
    testMesh = new THREE.Mesh( geometry, defaultMateral )
    scene.add( testMesh )

  }

  function setupThree(){

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.001, 500 );
    camera.position.z = 100;
    camera.position.y = 100;
    scene = new THREE.Scene();
    
    addLight()

    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setClearColor( 0xeeeeee, 1)
    renderer.setSize( window.innerWidth, window.innerHeight )
    container.appendChild( renderer.domElement )
  }

  function addLight(){
    const dl1 = new THREE.DirectionalLight(0xffffff, 0.35)
    dl1.position.set(-100,-100,-100)
    scene.add(dl1)

    const dl2 = new THREE.DirectionalLight(0xffffff, 0.35)
    dl1.position.set(100, 100, 100)
    scene.add(dl2)

    const amb = new THREE.AmbientLight(0xffffff,0.5)
    scene.add(amb)

    const hl = new THREE.HemisphereLight( 0x443333, 0x111122 );
    scene.add(hl)
  }

  function render(){
    renderer.render(scene, camera)
    testMesh.rotation.y += 0.01
    control.update()
    requestAnimationFrame(render)
  }

  function setupDragAndDrop(){
    document.addEventListener('dragover', (ev) => {
      ev.preventDefault()
      elSuperOverlay.classList.remove('d-none')
    })

    document.addEventListener('dragleave', (ev) => {
      ev.preventDefault()
      elSuperOverlay.classList.add('d-none')
    })
    document.addEventListener('drop', (ev) => {
      ev.preventDefault()
      elSuperOverlay.classList.add('d-none')

      if (ev.dataTransfer.items) {
        for (const item of ev.dataTransfer.items) {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            const url = URL.createObjectURL(file)
            loadDraco(url)
            elOverlay.classList.add('d-none')
          }
        }
      }
    })
  }

  function setupInput(){
    const input = document.getElementById('input-url')

    function loadInputValue(){
      loadDraco(input.value)
    }

    if (input) {
      input.addEventListener('keyup', (event) => {
        if (event.code === 'Enter') {
          loadInputValue()
        }
      })
    }
    const loadBtn = document.getElementById('input-load')
    if (loadBtn) {
      loadBtn.addEventListener('click', loadInputValue)
    }
  }


})()
