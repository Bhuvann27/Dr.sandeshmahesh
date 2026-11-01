(()=>{
'use strict';
const track=document.getElementById('coatTrack'),stage=document.getElementById('coatStage');if(!track||!stage)return;
track.style.position='relative';track.style.height='260vh';stage.style.position='sticky';stage.style.top='0';stage.style.height='100vh';stage.style.transform='none';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fade=(p,a,b)=>p<a?0:p>=b?1:(p-a)/(b-a);
let raf=0;
function update(){raf=0;const max=Math.max(1,track.offsetHeight-innerHeight),p=clamp(-track.getBoundingClientRect().top/max);const zones=[['idName',.64,.69],['idQual',.67,.72],['idExp',.70,.75],['idHosp',.73,.78],['identityPhoto',.76,.81]];let visible=0;zones.forEach(([id,a,b])=>{const el=document.getElementById(id);if(!el)return;const v=fade(p,a,b);visible=Math.max(visible,v);el.style.opacity=v;el.style.transform=id==='identityPhoto'?`scale(${.7+.3*v})`:`translateY(${(1-v)*10}px)`});const block=document.getElementById('identityBlock');if(block)block.style.opacity=visible>0?1:0;const cue=document.getElementById('scrollCue');if(cue)cue.style.opacity=p>.045?'0':'1';const fill=document.getElementById('progressFill');if(fill)fill.style.transform=`translateY(${p*114}px)`;}
function tick(){if(raf)return;raf=requestAnimationFrame(update)}
window.addEventListener('scroll',tick,{passive:true});window.addEventListener('resize',tick,{passive:true});update();
})();
