'use strict';
// Decorative topology field. The page keeps its CSS background when WebGL is unavailable.
(() => {
  const canvas = document.querySelector('.hero-field');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:false, depth:false, stencil:false, powerPreference:'low-power'});
  if (!gl) return;
  const vertexSource = `attribute vec2 position;
    void main(){gl_Position=vec4(position,0.0,1.0);}`;
  const fragmentSource = `precision mediump float;
    uniform vec2 resolution;
    uniform vec2 pointer;
    uniform float time;
    float line(float x,float center,float width){return 1.0-smoothstep(0.0,width,abs(x-center));}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution.xy;
      float aspect=resolution.x/resolution.y;
      vec2 p=vec2(uv.x*aspect,uv.y);
      vec2 cursor=vec2(pointer.x*aspect,pointer.y);
      float flow=0.0;
      for(int i=0;i<9;i++){
        float band=float(i)*0.155-0.12;
        float wave=0.014*sin(p.x*5.5+time*0.26+float(i)*1.3);
        float path=p.y-(band+p.x*0.22+wave);
        flow+=line(path,0.0,0.0045)*(0.31+0.20*sin(p.x*3.5+time*0.24+float(i)));
      }
      vec2 grid=vec2(p.x/0.18,p.y/0.16);
      vec2 cell=floor(grid);
      vec2 local=fract(grid)-0.5;
      float seed=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
      float point=(1.0-smoothstep(0.035,0.085,length(local)))*step(0.71,seed)*0.48;
      float halo=exp(-15.0*distance(p,cursor))*0.10;
      float sweep=0.5+0.5*sin(time*0.22+p.x*2.4);
      float alpha=clamp((flow+point)*sweep+halo,0.0,0.62);
      vec3 color=mix(vec3(0.24,0.56,0.39),vec3(0.64,0.89,0.72),clamp(point*1.4+halo*2.0,0.0,1.0));
      gl_FragColor=vec4(color,alpha);
    }`;
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;}
  const vertex=compile(gl.VERTEX_SHADER,vertexSource);
  const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
  if(!vertex||!fragment)return;
  const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return;}
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.useProgram(program);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const resolution=gl.getUniformLocation(program,'resolution');
  const pointer=gl.getUniformLocation(program,'pointer');
  const time=gl.getUniformLocation(program,'time');
  const cursor={x:0.72,y:0.44};
  let visible=true, frame=0, last=0;
  function size(){
    const rect=hero.getBoundingClientRect();
    const ratio=Math.min(devicePixelRatio||1,1.25);
    const width=Math.min(Math.round(rect.width*ratio),1600);
    const height=Math.min(Math.round(rect.height*ratio),1000);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
  }
  function draw(ms){
    frame=0;
    if(document.hidden||!visible||document.body.classList.contains('reading'))return;
    if(ms-last<32&&!reducedMotion.matches){frame=requestAnimationFrame(draw);return;}
    last=ms;size();
    gl.uniform2f(resolution,canvas.width,canvas.height);
    gl.uniform2f(pointer,cursor.x,cursor.y);
    gl.uniform1f(time,reducedMotion.matches?0:ms*0.001);
    gl.drawArrays(gl.TRIANGLES,0,3);
    if(!reducedMotion.matches)frame=requestAnimationFrame(draw);
  }
  function start(){if(!frame&&visible&&!document.hidden&&!document.body.classList.contains('reading'))frame=requestAnimationFrame(draw);}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();});observer.observe(hero);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  reducedMotion.addEventListener('change',()=>{stop();start();});
  hero.addEventListener('pointermove',event=>{if(reducedMotion.matches)return;const r=hero.getBoundingClientRect();cursor.x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));cursor.y=1-Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));});
  window.addEventListener('resize',()=>{size();start();},{passive:true});
  const bodyObserver=new MutationObserver(()=>document.body.classList.contains('reading')?stop():start());bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();});
  size();start();
})();
