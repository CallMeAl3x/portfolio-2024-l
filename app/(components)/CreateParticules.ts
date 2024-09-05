import * as THREE from "three";
import { Font, Texture } from "../(types)/three";
import { vertexShader, fragmentShader } from "./shaders";
import { CONFIG, Config } from "./config";

export class CreateParticles {
  scene: THREE.Scene;
  font: Font;
  particleImg: Texture;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  colorChange: THREE.Color;
  buttom: boolean;
  data: {
    text: string;
    amount: number;
    particleSize: number;
    particleColor: number;
    absorptionSpeed: number;
    textColor: string;
    area: number;
    ease: number;
  };
  planeArea!: THREE.Mesh;
  particles!: THREE.Points;
  geometryCopy!: THREE.BufferGeometry;
  xOffset: number;
  yOffset: number;
  textSize: number;
  config: Config;

  constructor(
    scene: THREE.Scene,
    font: Font,
    particleImg: Texture,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    text: string,
    xOffset: number,
    yOffset: number,
    textSize: number,
    config: Config
  ) {
    this.scene = scene;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.textSize = textSize;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);

    this.data = {
      text: text,
      amount: config.particleAmount,
      particleSize: config.particleSize,
      particleColor: config.particleColor,
      absorptionSpeed: config.absorptionSpeed,
      textColor: config.textColor,
      area: config.area,
      ease: config.ease,
    };

    this.colorChange = new THREE.Color(this.data.particleColor);

    this.buttom = false;

    this.config = config;

    this.setup();
    this.bindEvents();
  }

  setColorValues = (coulors: any, i: number, color: THREE.Color) => {
    coulors.setXYZ(i, color.r, color.g, color.b);
  };

  setup() {
    const geometry = new THREE.PlaneGeometry(
      this.visibleWidthAtZDepth(100, this.camera),
      this.visibleHeightAtZDepth(100, this.camera)
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });
    this.planeArea = new THREE.Mesh(geometry, material);
    this.planeArea.visible = false;
    this.createText();
  }

  setMaxAbsorption() {
    const pos = this.particles.geometry.attributes.position;
    const copy = this.geometryCopy.attributes.position;
    const coulors = this.particles.geometry.attributes.customColor;
    const size = this.particles.geometry.attributes.size;

    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0, l = pos.count; i < l; i++) {
      const initPos = new THREE.Vector3(
        copy.getX(i),
        copy.getY(i),
        copy.getZ(i)
      );
      const direction = center.clone().sub(initPos).normalize();
      const distance = Math.random() * 1000;
      const newPos = center.clone().sub(direction.multiplyScalar(distance));

      pos.setXYZ(i, newPos.x, newPos.y, newPos.z);

      this.setColorValues(coulors, i, this.colorChange);
      size.array[i] = this.data.particleSize * 0.5;
    }

    pos.needsUpdate = coulors.needsUpdate = size.needsUpdate = true;
  }

  releaseParticles() {
    const pos = this.particles.geometry.attributes.position;
    const copy = this.geometryCopy.attributes.position;
    const colors = this.particles.geometry.attributes.customColor;
    const size = this.particles.geometry.attributes.size;

    const centerX = 0;
    const centerY = 0;
    const interpolationFactor = 0.8; // Vitesse du retour des particules derrière le texte plus c'est rapide plus y'a de particules qui bougent (n'augmente pas la durée de l'animation)

    for (let i = 0, l = pos.count; i < l; i++) {
      const initX = copy.getX(i);
      const initY = copy.getY(i);
      const initZ = copy.getZ(i);

      const dirX = centerX - initX;
      const dirY = centerY - initY;
      const dirZ = -initZ;

      const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      const normX = dirX / length;
      const normY = dirY / length;
      const normZ = dirZ / length;

      const newX = centerX - normX;
      const newY = centerY - normY;
      const newZ = -normZ;

      const currentX = pos.getX(i);
      const currentY = pos.getY(i);
      const currentZ = pos.getZ(i);

      pos.setXYZ(
        i,
        currentX + (newX - currentX) * interpolationFactor,
        currentY + (newY - currentY) * interpolationFactor,
        currentZ + (newZ - currentZ) * interpolationFactor
      );

      this.setColorValues(colors, i, this.colorChange);
      size.array[i] = this.data.particleSize * 0.5;
    }

    pos.needsUpdate = true;
    colors.needsUpdate = true;
    size.needsUpdate = true;
  }

  resetMousePosition() {
    this.mouse.x = 0;
    this.mouse.y = -1;
    this.buttom = false;
  }

  bindEvents() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vector.unproject(this.camera);
    this.buttom = true;
    this.data.ease = 0.01;
  }

  onMouseUp() {
    this.buttom = false;
    this.data.ease = 0.095; // Vitesse à laquelle les particules reviennent à leur position initiale
  }

  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  render() {
    const time = ((0.001 * performance.now()) % 12) / 12;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.planeArea);

    const pos = this.particles.geometry.attributes.position;
    const copy = this.geometryCopy.attributes.position;
    const coulors = this.particles.geometry.attributes.customColor;
    const size = this.particles.geometry.attributes.size;

    const mx = intersects.length > 0 ? intersects[0].point.x : 0;
    const my = intersects.length > 0 ? intersects[0].point.y : 0;
    const mz = intersects.length > 0 ? intersects[0].point.z : 0;

    for (let i = 0, l = pos.count; i < l; i++) {
      const initX = copy.getX(i);
      const initY = copy.getY(i);
      const initZ = copy.getZ(i);

      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);

      this.colorChange = new THREE.Color(this.data.textColor);
      this.setColorValues(coulors, i, this.colorChange);
      coulors.needsUpdate = true;

      let dx = mx - px;
      let dy = my - py;

      const mouseDistance = this.distance(mx, my, px, py);
      const d = dx * dx + dy * dy;
      const f = -this.data.area / d;

      if (this.buttom) {
        const t = Math.atan2(dy, dx);
        px -= f * Math.cos(t);
        py -= f * Math.sin(t);

        const absorptionSpeed = CONFIG.absorptionSpeed;
        px -= absorptionSpeed * f * Math.cos(t);
        py -= absorptionSpeed * f * Math.sin(t);

        this.colorChange = new THREE.Color(this.data.particleColor);
        this.setColorValues(coulors, i, this.colorChange);
        coulors.needsUpdate = true;

        if (
          px > initX + 70 ||
          px < initX - 70 ||
          py > initY + 70 ||
          py < initY - 70
        ) {
          this.setColorValues(coulors, i, this.colorChange);
          coulors.needsUpdate = true;
        }
      } else {
        if (mouseDistance < this.data.area) {
          if (i % 5 == 0) {
            const t = Math.atan2(dy, dx);
            px -= 0.03 * Math.cos(t);
            py -= 0.03 * Math.sin(t);

            this.colorChange = new THREE.Color(this.data.particleColor);
            this.setColorValues(coulors, i, this.colorChange);
            coulors.needsUpdate = true;

            size.array[i] = this.data.particleSize / 1.2;
            size.needsUpdate = true;
          } else {
            const t = Math.atan2(dy, dx);
            px += f * Math.cos(t);
            py += f * Math.sin(t);

            size.array[i] = this.data.particleSize * 1.3;
            size.needsUpdate = true;
          }

          if (
            px > initX + 10 ||
            px < initX - 10 ||
            py > initY + 10 ||
            py < initY - 10
          ) {
            this.colorChange = new THREE.Color(this.data.particleColor); // Couleur des particules (en fond)
            this.setColorValues(coulors, i, this.colorChange);
            coulors.needsUpdate = true;

            size.array[i] = this.data.particleSize / 1.8;
            size.needsUpdate = true;
          }
        }
      }

      px += (initX - px) * this.data.ease;
      py += (initY - py) * this.data.ease;
      pz += (initZ - pz) * this.data.ease;

      pos.setXYZ(i, px, py, pz);
      pos.needsUpdate = true;

      size.array[i] =
        this.data.particleSize * (1 + Math.sin(i + time * 10) * 0.1);
      size.needsUpdate = true;
    }
  }

  createText() {
    let thePoints: THREE.Vector3[] = [];

    let shapes = this.font.generateShapes(this.data.text, this.textSize);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    const xMid =
      -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yMid =
      (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) / 2.85;

    geometry.center();

    let holeShapes: THREE.Path[] = [];

    for (let q = 0; q < shapes.length; q++) {
      let shape = shapes[q];

      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          let hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }

    shapes.push.apply(holeShapes as THREE.Shape[]);

    let colors: number[] = [];
    let sizes: number[] = [];

    for (let x = 0; x < shapes.length; x++) {
      let shape = shapes[x];

      const amountPoints =
        shape.type == "Path" ? this.data.amount / 2 : this.data.amount;

      let points = shape.getSpacedPoints(amountPoints);

      points.forEach((element: THREE.Vector2, z: number) => {
        const a = new THREE.Vector3(element.x, element.y, 0);
        thePoints.push(a);
        colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
        sizes.push(1);
      });
    }

    let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);

    geoParticles.translate(xMid + this.xOffset, yMid + this.yOffset, 0);

    geoParticles.setAttribute(
      "customColor",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geoParticles.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: this.particleImg },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particles = new THREE.Points(geoParticles, material);
    this.scene.add(this.particles);

    this.geometryCopy = new THREE.BufferGeometry();
    this.geometryCopy.copy(this.particles.geometry);
  }

  visibleHeightAtZDepth(
    depth: number,
    camera: THREE.PerspectiveCamera
  ): number {
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    const vFOV = (camera.fov * Math.PI) / 180;

    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(depth: number, camera: THREE.PerspectiveCamera): number {
    const height = this.visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  dispose() {
    // Optmisation de la performance en enlevant les event listeners and disposer les objects
    document.removeEventListener("mousedown", this.onMouseDown.bind(this));
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.onMouseUp.bind(this));

    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    if (this.geometryCopy) {
      this.geometryCopy.dispose();
    }
  }
}
