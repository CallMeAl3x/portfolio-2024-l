import * as THREE from "three";
import { Font, Texture } from "../(types)/three";
import { vertexShader, fragmentShader } from "./shaders";
import { CONFIG, Config } from "./config";

export class CreateParticles {
  isAnimating: boolean;
  scene: THREE.Scene;
  font: Font;
  particleImg: Texture;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  colorChange: THREE.Color;
  letterSpacing: number;
  buttom: boolean;
  data: {
    text: string;
    amount: number;
    particleSize: number;
    particleColor: number;
    textColor: string;
    textSize: number;
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
    this.isAnimating = true;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;
    this.letterSpacing = 0.5;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.textSize = textSize;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);

    this.data = {
      text: text,
      amount: config.particleAmount,
      particleSize: config.particleSize,
      particleColor: config.particleColor, // Initialisation correcte de la couleur
      textColor: config.textColor,
      textSize: textSize,
      area: config.area,
      ease: config.ease,
    };

    this.colorChange = new THREE.Color(this.data.particleColor); // Utiliser la couleur de la config

    this.buttom = false;

    this.config = config;

    this.data = {
      text: text,
      amount: config.particleAmount,
      particleSize: config.particleSize,
      particleColor: config.particleColor,
      textColor: config.textColor,
      textSize: textSize,
      area: config.area,
      ease: config.ease,
    };

    this.setup();
    this.bindEvents();
  }

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

    const centerX = 0;
    const centerY = 0;

    for (let i = 0, l = pos.count; i < l; i++) {
      const initX = copy.getX(i);
      const initY = copy.getY(i);
      const initZ = copy.getZ(i);

      // Calculer la direction vers le centre
      const dirX = centerX - initX;
      const dirY = centerY - initY;
      const dirZ = -initZ;

      // Normaliser la direction
      const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      const normX = dirX / length;
      const normY = dirY / length;
      const normZ = dirZ / length;

      // Éparpiller la particule
      const distance = Math.random() * 10000; // Distance aléatoire jusqu'à 5 unités du centre
      const newX = centerX - normX * distance;
      const newY = centerY - normY * distance;
      const newZ = -normZ * distance;

      pos.setXYZ(i, newX, newY, newZ);

      // Ajuster la couleur et la taille
      this.colorChange.setHSL(0.5 + Math.random() * 0.2, 0.75, 0.5);
      coulors.setXYZ(
        i,
        this.colorChange.r,
        this.colorChange.g,
        this.colorChange.b
      );
      size.array[i] = this.data.particleSize * 0.5;
    }

    pos.needsUpdate = true;
    coulors.needsUpdate = true;
    size.needsUpdate = true;

    this.isAnimating = true;
    this.data.ease = 0.035;
  }

  releaseParticles() {
    const pos = this.particles.geometry.attributes.position;
    const copy = this.geometryCopy.attributes.position;
    const coulors = this.particles.geometry.attributes.customColor;
    const size = this.particles.geometry.attributes.size;

    const centerX = 0;
    const centerY = 0;
    const interpolationFactor = 0.8; // Contrôle la vitesse du retour

    for (let i = 0, l = pos.count; i < l; i++) {
      const initX = copy.getX(i);
      const initY = copy.getY(i);
      const initZ = copy.getZ(i);

      // Calculer la direction vers le centre
      const dirX = centerX - initX;
      const dirY = centerY - initY;
      const dirZ = -initZ;

      // Normaliser la direction
      const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      const normX = dirX / length;
      const normY = dirY / length;
      const normZ = dirZ / length;

      // Positionner la particule près du centre
      const distance = 1; // Distance fixe au centre
      const newX = centerX - normX * distance;
      const newY = centerY - normY * distance;
      const newZ = -normZ * distance;

      // Ajuster la position avec interpolation
      const currentX = pos.getX(i);
      const currentY = pos.getY(i);
      const currentZ = pos.getZ(i);

      pos.setXYZ(
        i,
        currentX + (newX - currentX) * interpolationFactor,
        currentY + (newY - currentY) * interpolationFactor,
        currentZ + (newZ - currentZ) * interpolationFactor
      );

      // Ajuster la couleur et la taille
      this.colorChange.setHSL(0.5 + Math.random() * 0.2, 0.75, 0.5);
      coulors.setXYZ(
        i,
        this.colorChange.r,
        this.colorChange.g,
        this.colorChange.b
      );
      size.array[i] = this.data.particleSize * 0.5;
    }

    pos.needsUpdate = true;
    coulors.needsUpdate = true;
    size.needsUpdate = true;

    this.isAnimating = true;
    this.data.ease = 0.035; // Vitesse de retour
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
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const currenPosition = this.camera.position
      .clone()
      .add(dir.multiplyScalar(distance));

    const pos = this.particles.geometry.attributes.position;
    this.buttom = true;
    this.data.ease = 0.01;
  }

  onMouseUp() {
    this.buttom = false;
    this.data.ease = 0.035;
  }

  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  render() {
    const time = ((0.001 * performance.now()) % 12) / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

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

      this.colorChange = new THREE.Color(this.data.textColor); // Couleur du texte
      coulors.setXYZ(
        i,
        this.colorChange.r,
        this.colorChange.g,
        this.colorChange.b
      );
      coulors.needsUpdate = true;

      let dx = mx - px;
      let dy = my - py;
      const dz = mz - pz;

      const mouseDistance = this.distance(mx, my, px, py);
      const d = dx * dx + dy * dy;
      const f = -this.data.area / d;

      if (this.buttom) {
        const t = Math.atan2(dy, dx);
        px -= f * Math.cos(t);
        py -= f * Math.sin(t);

        // Changement de couleur en bleu fixe
        this.colorChange = new THREE.Color(this.data.particleColor); // Couleur des particules (en fond)
        coulors.setXYZ(
          i,
          this.colorChange.r,
          this.colorChange.g,
          this.colorChange.b
        );
        coulors.needsUpdate = true;

        if (
          px > initX + 70 ||
          px < initX - 70 ||
          py > initY + 70 ||
          py < initY - 70
        ) {
          this.colorChange = new THREE.Color(this.data.particleColor); // Couleur des particules (en fond)
          coulors.setXYZ(
            i,
            this.colorChange.r,
            this.colorChange.g,
            this.colorChange.b
          );
          coulors.needsUpdate = true;
        }
      } else {
        // Comportement lorsque le bouton n'est pas enfoncé (reste inchangé)
        if (mouseDistance < this.data.area) {
          if (i % 5 == 0) {
            const t = Math.atan2(dy, dx);
            px -= 0.03 * Math.cos(t);
            py -= 0.03 * Math.sin(t);

            this.colorChange = new THREE.Color(this.data.particleColor); // Couleur des particules (en fond)
            coulors.setXYZ(
              i,
              this.colorChange.r,
              this.colorChange.g,
              this.colorChange.b
            );
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
            coulors.setXYZ(
              i,
              this.colorChange.r,
              this.colorChange.g,
              this.colorChange.b
            );
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

    let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
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

    // Utiliser le type correct pour shapes
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
    // Remove event listeners
    document.removeEventListener("mousedown", this.onMouseDown.bind(this));
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.onMouseUp.bind(this));

    // Dispose of Three.js objects
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    if (this.geometryCopy) {
      this.geometryCopy.dispose();
    }
  }
}
