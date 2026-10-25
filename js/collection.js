(()=>{'use strict';
const data=window.CATALOG,byId=new Map(data.map(x=>[x.id,x])),key='shirotoiro-favorites-v1';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=(x,side='front')=>`images/catalog/${x.id}_${side}.jpg`;
let selected=new Set();
function load(){try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))selected=new Set(saved.filter(x=>byId.has(x)));}catch(e){}}
load();
const labels={color:'色',mood:'雰囲気',kind:'種類'},sets={kind:new Set(),color:new Set(),mood:new Set()};let draft=null,activeField=null,returnFocus=null;
const colors={'赤・朱':'#a64443','オレンジ・黄':'#dfac56','金':'#a38b53','白・生成り':'#f0e8d8','黒':'#393c3b','緑・青':'#66897a','ピンク・紫':'#c899ad'};
const matching=s=>data.filter(x=>Object.entries(s).every(([k,v])=>!v.size||v.has(x[k])));
function render(){
 if(!$('#catalog-grid'))return;
 const shown=matching(sets);$('#result-count').textContent=`${shown.length}件の衣裳`;
 $('#catalog-grid').innerHTML=shown.map(x=>`<article class="catalog-card"><button class="card-open" data-open="${x.id}" aria-label="${esc(x.kind)} No.${x.id}の詳しい表示"><img src="${photo(x)}" alt="${esc(x.kind)} No.${x.id}" loading="lazy" width="900" height="1350"><span class="card-id">No.${x.id}</span><span class="tags"><span>${esc(x.color)}</span><span>${esc(x.mood)}</span></span></button><button class="heart" data-fav="${x.id}" aria-label="No.${x.id}をお気に入り${selected.has(x.id)?'から外す':'に入れる'}" aria-pressed="${selected.has(x.id)}">${selected.has(x.id)?'♥':'♡'}</button></article>`).join('');
 $('#empty-results').hidden=shown.length>0;
 const chips=Object.entries(sets).flatMap(([field,values])=>[...values].map(v=>`<button class="active-chip" data-clear-field="${field}" data-clear-value="${esc(v)}" aria-label="${esc(v)}の条件を外す">${esc(v)} <span aria-hidden="true">×</span></button>`));
 $('#active-filters').innerHTML=chips.join('');$('#reset').hidden=!chips.length;
 document.querySelectorAll('[data-filter]').forEach(b=>{const field=b.dataset.filter,n=sets[field].size;b.querySelector('.filter-badge').textContent=n||'';b.classList.toggle('has-selection',n>0);b.setAttribute('aria-label',labels[field]+'で絞り込む'+(n?'、'+n+'条件を選択中':''));});
}
function save(){try{localStorage.setItem(key,JSON.stringify([...selected]));}catch(e){}update();}
function update(){
 $('#favorite-count').textContent=selected.size;
 document.querySelectorAll('[data-fav]').forEach(b=>{const active=selected.has(b.dataset.fav);b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',`No.${b.dataset.fav}をお気に入り${active?'から外す':'に入れる'}`);b.textContent=b.classList.contains('heart')?(active?'♥':'♡'):(active?'♥お気に入りから外す':'♡お気に入りに入れる');});
 $('#favorite-list').innerHTML=[...selected].map(id=>{const x=byId.get(id);return `<div class="fav-item"><img src="${photo(x)}" alt="${esc(x.kind)} No.${id}"><span>No.${id}</span><button data-remove="${id}" aria-label="No.${id}をお気に入りから外す">外す</button></div>`}).join('');
 const message=['【シロトイロ】お気に入りの衣裳',...[...selected].map(id=>`・${byId.get(id).kind} No.${id}`),'この衣裳について、相談したいです。'].join('\n');
 const share=$('#share');share.setAttribute('aria-disabled',String(!selected.size));if(selected.size)share.href='https://line.me/R/share?text='+encodeURIComponent(message);else share.removeAttribute('href');
}
function openDialog(d,trigger){returnFocus=trigger||document.activeElement;d.showModal();document.body.classList.add('modal-open');}
function detail(id,trigger){const x=byId.get(id);$('#detail-content').innerHTML=`<div class="gallery" tabindex="0" aria-label="衣裳写真。左右にめくって表示"><img src="${photo(x)}" alt="${esc(x.kind)} No.${id} 写真1"><img src="${photo(x,'back')}" alt="${esc(x.kind)} No.${id} 写真2"></div><div class="gallery-nav"><button data-slide="0" aria-label="1枚目の写真">←</button><button data-slide="1" aria-label="2枚目の写真">→</button></div><div class="detail-meta"><h2>No.${id}</h2><p>${[x.kind,x.color,x.mood,x.pattern].map(esc).join('／')}</p><p>お店で、ヘアメイクと合わせてご相談ください。</p><button class="button" data-fav="${id}" aria-pressed="false">♡お気に入りに入れる</button></div>`;update();openDialog($('#detail'),trigger);}
function paintOptions(){
 const field=activeField;
 let values=[...new Set(data.map(x=>x[field]))];
 if(field==='color')values=[...Object.keys(colors).filter(x=>values.includes(x)),...values.filter(x=>!Object.keys(colors).includes(x))];
 if(field==='mood')values.sort((a,b)=>['古典・王道','華やか・豪華','モダン・レトロ'].indexOf(a)-['古典・王道','華やか・豪華','モダン・レトロ'].indexOf(b));
 $('#filter-title').textContent=labels[field]+'で絞り込む';
 $('#filter-options').innerHTML=`<fieldset><legend class="sr-only">${labels[field]}</legend>${field==='kind'?`<label class="filter-option"><input type="radio" name="kind" value="" ${!draft.kind.size?'checked':''}><span>すべて</span></label>`:''}${values.map(v=>`<label class="filter-option"><input type="${field==='kind'?'radio':'checkbox'}" name="${field}" value="${esc(v)}" ${draft[field].has(v)?'checked':''}><span>${field==='color'?`<i class="swatch" style="background:${colors[v]||'#ccc'}" aria-hidden="true"></i>`:''}${esc(v)}<b class="option-check" aria-hidden="true">✓</b></span></label>`).join('')}</fieldset>`;
 updatePreview();
}
function updatePreview(){const count=matching(draft).length;$('#apply-filters').textContent=`${count}件の衣裳を見る`;$('#filter-preview').textContent=`${count}件の衣裳`;}
function reset(){Object.values(sets).forEach(s=>s.clear());render();}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{activeField=b.dataset.filter;draft=Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,new Set(v)]));paintOptions();b.setAttribute('aria-expanded','true');openDialog($('#filter-dialog'),b);}));
$('#filter-options')?.addEventListener('change',e=>{const t=e.target;if(t.name==='kind'){draft.kind.clear();if(t.value)draft.kind.add(t.value);}else if(t.checked)draft[t.name].add(t.value);else draft[t.name].delete(t.value);updatePreview();});
$('#clear-current-filter')?.addEventListener('click',()=>{draft[activeField].clear();paintOptions();});
$('#apply-filters')?.addEventListener('click',()=>{Object.keys(sets).forEach(k=>sets[k]=new Set(draft[k]));render();$('#filter-dialog').close();window.scrollTo({top:0,behavior:'instant'});});
$('#reset')?.addEventListener('click',reset);$('#empty-reset')?.addEventListener('click',reset);
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-open]'),fav=e.target.closest('[data-fav]'),remove=e.target.closest('[data-remove]'),slide=e.target.closest('[data-slide]'),chip=e.target.closest('[data-clear-field]');
 if(open)detail(open.dataset.open,open);
 if(fav){const id=fav.dataset.fav;selected.has(id)?selected.delete(id):selected.add(id);save();}
 if(remove){selected.delete(remove.dataset.remove);save();}
 if(chip){sets[chip.dataset.clearField].delete(chip.dataset.clearValue);render();}
 if(slide){const g=$('.gallery');g.scrollTo({left:Number(slide.dataset.slide)*(g.clientWidth+10),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
$('#open-favorites').addEventListener('click',()=>{update();openDialog($('#favorites'),$('#open-favorites'));});
document.querySelectorAll('dialog').forEach(d=>{
 d.querySelector('.close').addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 d.addEventListener('close',()=>{document.body.classList.remove('modal-open');document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-expanded','false'));returnFocus?.focus({preventScroll:true});});
});
window.addEventListener('pageshow',()=>{load();update();});window.addEventListener('storage',e=>{if(e.key===key){load();update();}});
render();update();
})();
