import { Object3D,
         PlaneGeometry,
         Scene,
         TextureLoader,
         VideoTexture,
         Mesh,
         LinearFilter,
         ShaderMaterial,
         MeshStandardMaterial, 
         Color} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Utils } from '../utils/Utils'
import SceneRendererTJS from '../SceneRendererTJS'
import GifLoader from '../../node_modules/three-gif-loader-with-ctrl/'

interface ARvideo {
  play: () => void;
}

interface Entity {
    name: string,
    mesh: Object3D
}

export default class NFTaddTJS {
    private entities: Entity[] = [];
    private names: Array<string>;
    private scene: Scene;
    private uuid: string;
    constructor(uuid: string) {
        this.scene = SceneRendererTJS.getGlobalScene();
        this.uuid = uuid;
        this.names = [];
    }
    public add(mesh: Object3D, name: string, objVisibility: boolean) {
        document.addEventListener('getNFTData-' + this.uuid + '-' + name, (ev: any) => {
            var msg = ev.detail;
            mesh.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0
            mesh.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0
        })
        const root = new Object3D();
        root.name = 'root-' + name;
        root.matrixAutoUpdate = false;
        this.scene.add(root);
        root.add(mesh);
        document.addEventListener('getMatrixGL_RH-' + this.uuid + '-' + name, (ev: any) => {
          root.visible = true
          mesh.visible = true
          const matrix = Utils.interpolate(ev.detail.matrixGL_RH)
          Utils.setMatrix(root.matrix, matrix)
        })
        document.addEventListener('nftTrackingLost-' + this.uuid + '-' + name, (ev: any) => {
          root.visible = objVisibility
          mesh.visible = objVisibility
        })
        this.names.push(name);
        this.entities.push({name, mesh})
    }

    public addModel (url: string, name: string, scale: number, objVisibility: boolean, callback: (model: any, anim: any) => void) {
        const root = new Object3D();
        root.name = 'root-' + name;
        root.matrixAutoUpdate = false;
        this.scene.add(root);
        let model: any
        let anim: any
        /* Load Model */
        const threeGLTFLoader = new GLTFLoader()
        threeGLTFLoader.load(url, gltf => {
            model = gltf.scene
            model.scale.set(scale, scale, scale)
            anim = gltf.animations[0]
            root.add(model)
        })
        document.addEventListener('getNFTData-' + this.uuid + '-' + name, (ev: any) => {
            var msg = ev.detail
            model.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0
            model.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0
            if (callback) {
              callback(model, anim)
            }
        })
        document.addEventListener('getMatrixGL_RH-' + this.uuid + '-' + name, (ev: any) => {
            root.visible = true
            model.visible = true
            const matrix = Utils.interpolate(ev.detail.matrixGL_RH)
            Utils.setMatrix(root.matrix, matrix)
          })
          document.addEventListener('nftTrackingLost-' + this.uuid + '-' + name, (ev: any) => {
            root.visible = objVisibility
            if (model) {
              model.visible = objVisibility
            }
          })
          this.names.push(name);
    }
    public addImage (imageUrl: string, name: string, color: string, scale: number, objVisibility: boolean, callback: (plane: any) => void) {
      const root = new Object3D();
      root.name = 'root-' + name;
      root.matrixAutoUpdate = false;
      this.scene.add(root);
      const planeGeom = new PlaneGeometry(1, 1, 1, 1)
      const texture = new TextureLoader().load(imageUrl)
      const material = new MeshStandardMaterial({ color: color, map: texture});
      const plane = new Mesh(planeGeom, material)
      plane.scale.set(scale, scale, scale)
      document.addEventListener('getNFTData-' + this.uuid + '-' + name, (ev: any) => {
            var msg = ev.detail
            plane.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0
            plane.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0
            if (callback) {
              callback(plane)
            }
      })
      root.add(plane)
      document.addEventListener('getMatrixGL_RH-' + this.uuid + '-' + name, (ev: any) => {
           root.visible = true
           plane.visible = true
           const matrix = Utils.interpolate(ev.detail.matrixGL_RH)
           Utils.setMatrix(root.matrix, matrix)
      })
      document.addEventListener('nftTrackingLost-' + this.uuid + '-' + name, (ev: any) => {
           root.visible = objVisibility
           plane.visible = objVisibility
      })
      this.names.push(name);
    }
    public addVideo (id: string, name: string, alpha: boolean, scale: number, objVisibility: boolean, callback: (plane: any) => void) {
      const root = new Object3D();
      root.name = 'root-' + name;
      root.matrixAutoUpdate = false;
      this.scene.add(root);
      const ARVideo: HTMLVideoElement = document.getElementById(id) as HTMLVideoElement;
      const texture = new VideoTexture(ARVideo as HTMLVideoElement)
      texture.minFilter = LinearFilter;
      let mat = null;
      if (!alpha) {
        mat = new MeshStandardMaterial({ color: 0xbbbbff, map: texture })
      } else {
        mat = new ShaderMaterial({
          uniforms: {
            vTexture: {
              value: texture
            }
          },
          vertexShader:
            "varying mediump vec2 vUv;\n" +
            "void main(void)\n" +
            "{\n" +
            "  vUv = uv;\n" +
            "  mediump vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
            "  gl_Position = projectionMatrix * mvPosition;\n" +
            "}",
          fragmentShader:
            "uniform mediump sampler2D vTexture;\n" +
            "varying mediump vec2 vUv;\n" +
            "void main(void)\n" +
            "{\n" +
            "  mediump vec3 tColor = texture2D( vTexture, vec2(0.5+vUv.x/2., vUv.y) ).rgb;\n" +
            "  mediump float a = texture2D(vTexture, vec2(vUv.x/2., vUv.y)).r;\n" +
            "  gl_FragColor = vec4(tColor, a);\n" +
            "}",
          transparent: true,
        });
      }
      ARVideo.play()
      ARVideo.pause()
      const planeGeom = new PlaneGeometry(1, 1, 1, 1)
      const plane = new Mesh(planeGeom, mat)
      plane.scale.set(scale, scale, scale)
      document.addEventListener('getNFTData-' + this.uuid + '-' + name, (ev: any) => {
          var msg = ev.detail
          plane.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0
          plane.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0
          if (callback) {
            callback(plane)
          }
      })
      root.add(plane)
      document.addEventListener('getMatrixGL_RH-' + this.uuid + '-' + name, (ev: any) => {
          ARVideo.play()
          root.visible = true
          plane.visible = true
          const matrix = Utils.interpolate(ev.detail.matrixGL_RH)
          Utils.setMatrix(root.matrix, matrix)
      })
      document.addEventListener('nftTrackingLost-' + this.uuid + '-' + name, (ev: any) => {
          root.visible = objVisibility
          plane.visible = objVisibility
          ARVideo.pause()
      })
      this.names.push(name);
    }

    public addGif (imageUrl: string, name: string, color: string, scale: number,  objVisibility: boolean, callback: (plane: any) => void) {
      const root = new Object3D();
      root.name = 'root-' + name;
      root.matrixAutoUpdate = false;
      this.scene.add(root);
      const planeGeom = new PlaneGeometry(1, 1, 1, 1)
      const texture = (new GifLoader(null)).load(imageUrl, null, null, null)
      const material = new MeshStandardMaterial({ color: color, map: texture});
      const plane = new Mesh(planeGeom, material)
      plane.scale.set(scale, scale, scale)
      document.addEventListener('getNFTData-' + this.uuid + '-' + name, (ev: any) => {
            var msg = ev.detail
            plane.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0
            plane.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0
            if (callback) {
              callback(plane)
            }
      })
      root.add(plane)
      document.addEventListener('getMatrixGL_RH-' + this.uuid + '-' + name, (ev: any) => {
           root.visible = true
           plane.visible = true
           const matrix = Utils.interpolate(ev.detail.matrixGL_RH)
           Utils.setMatrix(root.matrix, matrix)
           texture.play()
      })
      document.addEventListener('nftTrackingLost-' + this.uuid + '-' + name, (ev: any) => {
           root.visible = objVisibility
           plane.visible = objVisibility
           texture.pause()
      })
      this.names.push(name);
    }

    public getNames() {
      return this.names
    }
}
