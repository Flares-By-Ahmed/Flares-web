import * as THREE from 'three' ;
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// never working with 3d again TVT. too much info, i was told it was simple and "ez". yah.... nasa controle room is also ez in that case.
const wrapper = document.getElementById("wrapper"); 
const screen = new THREE.Scene();
const camara_info = new THREE.PerspectiveCamera(50,wrapper.offsetWidth / wrapper.offsetHeight,0.1,100);
camara_info.position.set(3.6, 2.6, 3.6);
const render_varible = new THREE.WebGLRenderer({antialias: true, alpha: true});
render_varible.setSize(wrapper.offsetWidth, wrapper.offsetHeight);
render_varible.setPixelRatio(window.devicePixelRatio);
wrapper.appendChild(render_varible.domElement);
const light = new THREE.AmbientLight(0xffffff, 0.875); // a bit less for so it's not too intenes. 
screen.add(light);
const the_sun = new THREE.DirectionalLight(0xffffff, 1.125); // far away light, or a light ball, not any real good name exist so, THE SUN
the_sun.position.set(4,6,5); // sorry for in cosnsistent declaration, am doing one thing at the time so i declare here, and some stuff are used after declaration and proparties of other so i can just sum them all at the top, sorry again ごめん
screen.add(the_sun);
const oppsite_light = new THREE.DirectionalLight(0xffffff, 0.4)
oppsite_light.position.set(-3,5,-4); // a bit below the oppsite side of the sun and to the left not right.
screen.add(oppsite_light);
const mouse_drag = new OrbitControls(camara_info, render_varible.domElement)  // so.. camara is not only info
mouse_drag.enableDamping = true;
mouse_drag.dampingFactor = 0.05;
mouse_drag.minDistance = 2;
mouse_drag.maxDistance = 10;
mouse_drag.target.set(0, 0, 0);
mouse_drag.update();
const decoder = new DRACOLoader();
decoder.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const loader = new GLTFLoader();
loader.setDRACOLoader(decoder)
const duck_movment = [
{
    duck_pos: new THREE.Vector3(-0.5, -0.64, 0.65), 
    moving_direction: new THREE.Quaternion(0, 0, 0, 1)
},
{ 
  duck_pos: new THREE.Vector3(-0.10, 0.236, 0.733),
  moving_direction: new THREE.Quaternion(0.06971397995948792,-0.03481448069214821,0.002434465801343322,0.9969564080238342)
}
,{  
   duck_pos: new THREE.Vector3(0.05, 0.174, 0.24),
   moving_direction: new THREE.Quaternion(-0.10452848672866821, 0 , 0 , 0.994521975517273)
}
];
const Animation_time_ms = {desktop:1600,pile:900,travel:900} // pos 1 hold on the table, then 2 at the duck pile, and finally then 3 in transtion / trable. (not really hold but spliting it won't be a very good way to split the code) and ms mean milisecound
function smooth_movment(t){ // formila for ease in i found online
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
let moving_duck;
let pile_of_ducks =  [];
let laptop_screen_animation;
let stage = 0;
let time_stamp = performance.now();
let bars_2d_background;
let bars_2d_content;
let bars_wrapping;
let last_draw =0; // time

function copy_point(a, b, t)
{
    const position = a.duck_pos.clone().lerp(b.duck_pos,t);
    const rotation= a.moving_direction.clone().slerp(b.moving_direction,t);
    return {position, rotation}; 
}

function update_duck(now) {
  if (!moving_duck) return;
  const time_frame = now - time_stamp;
  let result;

  switch (stage) {
    case 0: {
      const t = Math.min(time_frame / Animation_time_ms.travel, 1);
      result = copy_point(duck_movment[0], duck_movment[1], smooth_movment(t));
      if (t >= 1) { stage = 1; time_stamp = now; }
      break;
    }
    case 1: {
      const t = Math.min(time_frame / Animation_time_ms.travel, 1);
      result = copy_point(duck_movment[1], duck_movment[2], smooth_movment(t));
      if (t >= 1) { stage = 2; time_stamp = now; }
      break;
    }
    case 2: {
      result = copy_point(duck_movment[2], duck_movment[2], 0);
      if (time_frame >= Animation_time_ms.desktop) { stage = 3; time_stamp = now; }
      break;
    }
    case 3: {
      const t = Math.min(time_frame / Animation_time_ms.travel, 1);
      result = copy_point(duck_movment[2], duck_movment[1], smooth_movment(t));
      if (t >= 1) { stage = 4; time_stamp = now; }
      break;
    }
    case 4: {
      const t = Math.min(time_frame / Animation_time_ms.travel, 1);
      result = copy_point(duck_movment[1], duck_movment[0], smooth_movment(t));
      if (t >= 1) { stage = 5; time_stamp = now; }
      break;
    }
    case 5: {
      result = copy_point(duck_movment[0], duck_movment[0], 0);
      if (time_frame >= Animation_time_ms.pile) { stage = 0; time_stamp = now; }
      break;
    }
  }
  moving_duck.position.copy(result.position);
  moving_duck.quaternion.copy(result.rotation);
  if (pile_of_ducks[0]) {
    pile_of_ducks[0].visible = (stage === 5 || (stage === 0 && time_frame < 50));
  }

  update_screen(now);
}
//　なに?　あか　+　あお　＝　むらさき.
const random_color = ["red", "blue", "purple" ,"green", "yellow", "orange", "pink", "cyan"];
let stop_drawing = true;
function update_screen(now)
{
    const screen_width = bars_2d_background.width;
    const screen_height = bars_2d_background.height;
    if (stage === 2)
    {
      stop_drawing = false;
      if (last_draw === 0) 
        {
          last_draw = now;
        }
      if ((now - last_draw ) > 200) {
        last_draw = now;
        bars_2d_content.fillStyle = 'black';
        let line_height = 17;  
        bars_2d_content.fillRect(0, 0, screen_width, screen_height);
        for (let i = 1; i < 4; i++) {
          let bar_color = random_color[Math.floor(Math.random() * random_color.length)]; //console.log("i; " + i, "color" + bar_color);
          bars_2d_content.fillStyle = bar_color;
          bars_2d_content.fillRect(0, 0, screen_width, screen_height);
          bars_wrapping.needsUpdate = true;
        }
        ;}//  bars wrapping}
    } else if (stage !== 2 && !stop_drawing) // draw black screen once, rather then 60 times anyother frame
    {
      bars_2d_content.fillStyle = 'black';
      bars_2d_content.fillRect(0, 0, screen_width,screen_height);
      bars_wrapping.needsUpdate = true;
      stop_drawing = true;
      last_draw = 0;
    }
}// worst learning of my liven the names don't make sense at all. well they kinda do but still.
loader.load(
  'duck-scene.glb',
  (gltf) => {
    screen.add(gltf.scene);
    moving_duck = gltf.scene.getObjectByName('duck_climb');
    const duck_return = gltf.scene.getObjectByName('duck_return');
    const duck_at_laptop = gltf.scene.getObjectByName('duck_at_laptop'); // names can befound in belnder, ask my by email, if i still have the project names i will send them
    if (duck_return)
      {
        duck_return.visible = false;
      }
    if (duck_at_laptop)
    {
       duck_at_laptop.visible = false;

    }
    pile_of_ducks = ['duck_pile_01', 'duck_pile_02', 'duck_pile_03'].map(n => gltf.scene.getObjectByName(n)).filter(Boolean);
    const original_screen = gltf.scene.getObjectByName('laptop_screen');
    if (original_screen) {
      original_screen.material = new THREE.MeshStandardMaterial({color: 0x1a1a1a,roughness: 0.5, metalness: 0}); // metalness ? really ? wow what a name.
    }
    laptop_screen_animation = gltf.scene.getObjectByName('Cube');
    if (laptop_screen_animation) 
      {
      setup_screan()
      laptop_screen_animation.material = new THREE.MeshStandardMaterial({ color: 0x111111,emissive: 0xffffff,emissiveMap: bars_wrapping,emissiveIntensity: 1.2,roughness: 0.3,metalness: 0});}

    document.getElementById('loading-indicator')?.remove();
  },
);
function render_loop(now)
{
    update_duck(now);
    mouse_drag.update();
    render_varible.render(screen, camara_info);
    requestAnimationFrame(render_loop)
}
render_loop(performance.now());
function setup_screan()
{

  bars_2d_background = document.createElement("canvas");
  bars_2d_background.height = 126 // and here
  bars_2d_background.width  = 96 // here
  bars_2d_content  = bars_2d_background.getContext("2d"); 
  bars_2d_content.fillStyle = 'black';
  bars_2d_content.fillRect(0, 0, 96, 126); // same as up へ.
  bars_wrapping = new THREE.CanvasTexture(bars_2d_background);
  bars_wrapping.center.set(0.5, 0.5);
  bars_wrapping.rotation = Math.PI / 2;
} 
