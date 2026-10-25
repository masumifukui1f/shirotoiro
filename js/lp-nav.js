(()=>{'use strict';const header=document.querySelector('.lp-header');if(!header)return;
const links=[...header.querySelectorAll('.lp-nav a')],sections=links.map(a=>document.querySelector(a.hash));
const measure=()=>document.documentElement.style.setProperty('--lp-header-height',header.getBoundingClientRect().height+'px');measure();new ResizeObserver(measure).observe(header);
let queued=false;const update=()=>{queued=false;const edge=header.getBoundingClientRect().bottom+45;let current=-1;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=edge)current=i;});links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const target=document.querySelector(a.hash);if(!target)return;const heading=target.matches('h2,h3')?target:target.querySelector('h2');if(heading)heading.focus({preventScroll:true});}));
})();
