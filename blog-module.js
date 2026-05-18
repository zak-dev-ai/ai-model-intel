/* ═══════════════════════════════════════════════
 blog-module.js — Exportable blog module
 Load on any page to show latest blog articles.
 Usage:
   <script src="/blog-module.js" defer></script>
   <div id="latest-blog"></div>
   <script>BlogModule.renderLatest('latest-blog', 3)</script>
═══════════════════════════════════════════════ */
(function(){
  if(window.BlogModule) return; // already loaded

  var SITE='https://www.aimodelranks.live';
  var ARTICLES=[];
  var LOADED=false;

  // ── Helpers ──
  function esc(s){var d=document.createElement('div');d.appendChild(document.createTextNode(s));return d.innerHTML;}
  function fmtViews(n){if(n>=1000)return (n/1000).toFixed(1).replace('.0','')+'K';return String(n);}

  // ── Styling (injected once) ──
  function injectStyles(){
    if(document.getElementById('blog-module-css'))return;
    var css=document.createElement('style');
    css.id='blog-module-css';
    css.textContent=
      '.blog-mod-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(30,45,66,.5);text-decoration:none;align-items:center;transition:opacity .2s}'+
      '.blog-mod-item:last-child{border-bottom:none}'+
      '.blog-mod-item:hover{opacity:.85}'+
      '.blog-mod-thumb{width:44px;height:44px;border-radius:6px;object-fit:cover;flex-shrink:0;background:var(--bg3,#131b2a)}'+
      '.blog-mod-thumb.fallback{display:flex;align-items:center;justify-content:center;font-size:18px;background:linear-gradient(135deg,#131b2a,#1a2235)}'+
      '.blog-mod-content{flex:1;min-width:0}'+
      '.blog-mod-title{font-size:11px;font-weight:600;color:var(--text,#f0f4f8);line-height:1.4;margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
      '.blog-mod-meta{font-family:IBM Plex Mono,monospace;font-size:9px;color:var(--text3,#4a5a6e)}'+
      '.blog-mod-card{background:var(--bg2,#0d1117);border:1px solid var(--border,#1e2d42);border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s;text-decoration:none;display:block}'+
      '.blog-mod-card:hover{border-color:rgba(59,180,255,.3);transform:translateY(-2px)}'+
      '.blog-mod-card-img{width:100%;height:90px;object-fit:cover;display:block;background:var(--bg3,#131b2a)}'+
      '.blog-mod-card-body{padding:10px}'+
      '.blog-mod-card-tag{font-family:IBM Plex Mono,monospace;font-size:9px;color:var(--cyan,#3bb4ff);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px}'+
      '.blog-mod-card-title{font-size:12px;font-weight:700;color:var(--text,#f0f4f8);line-height:1.4;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
      '.blog-mod-card-read{font-family:IBM Plex Mono,monospace;font-size:10px;color:var(--cyan,#3bb4ff)}';
    document.head.appendChild(css);
  }

  // ── Load articles ──
  function load(callback){
    if(LOADED && ARTICLES.length){if(callback)callback(ARTICLES);return;}
    fetch('/static/blog-articles.json')
      .then(function(r){return r.json()})
      .then(function(data){
        if(data&&data.articles)ARTICLES=data.articles;
        LOADED=true;
        if(callback)callback(ARTICLES);
      })
      .catch(function(){
        LOADED=true;
        if(callback)callback([]);
      });
  }

  // ── Get latest n articles ──
  function getLatest(n){
    if(!n)n=3;
    var sorted=ARTICLES.slice().sort(function(a,b){return b.id-a.id});
    return sorted.slice(0,n);
  }

  // ── Get by category ──
  function getByCat(cat,n){
    if(!n)n=5;
    return ARTICLES.filter(function(a){return a.cat===cat}).slice(0,n);
  }

  // ── Render sidebar items (text + thumb) ──
  function renderLatest(containerId,count){
    var container=document.getElementById(containerId);
    if(!container)return;
    load(function(articles){
      var latest=getLatest(count||3);
      if(!latest.length){
        container.innerHTML='<div style="padding:12px 0;text-align:center;color:var(--text3,#4a5a6e);font-family:IBM Plex Mono,monospace;font-size:12px">No articles yet</div>';
        return;
      }
      container.innerHTML=latest.map(function(a){
        var img=a.img||'';
        var thumb=img ? '<img class="blog-mod-thumb" src="'+img+'?w=88&h=88&fit=crop&q=60" alt="" loading="lazy">' : '<div class="blog-mod-thumb fallback">'+(a.emoji||'📰')+'</div>';
        return '<a href="'+SITE+'/blog#article-'+a.id+'" class="blog-mod-item" target="_blank">'+thumb+'<div class="blog-mod-content"><div class="blog-mod-title">'+esc(a.title)+'</div><div class="blog-mod-meta">'+a.date+' · '+(a.read||a.readMin+' min')+'</div></div></a>';
      }).join('');
    });
  }

  // ── Render cards (for larger sections) ──
  function renderCards(containerId,count){
    var container=document.getElementById(containerId);
    if(!container)return;
    load(function(articles){
      var latest=getLatest(count||3);
      if(!latest.length){
        container.innerHTML='<div style="padding:12px 0;text-align:center;color:var(--text3,#4a5a6e)">No articles yet</div>';
        return;
      }
      container.innerHTML=latest.map(function(a){
        var img=a.img||'';
        var imgHtml=img ? '<img class="blog-mod-card-img" src="'+img+'?w=300&h=180&fit=crop&q=60" alt="" loading="lazy">' : '<div class="blog-mod-card-img" style="display:flex;align-items:center;justify-content:center;font-size:28px">'+(a.emoji||'📰')+'</div>';
        return '<a href="'+SITE+'/blog#article-'+a.id+'" class="blog-mod-card" target="_blank">'+imgHtml+'<div class="blog-mod-card-body"><div class="blog-mod-card-tag">'+a.tag+'</div><div class="blog-mod-card-title">'+esc(a.title)+'</div><span class="blog-mod-card-read">Read →</span></div></a>';
      }).join('');
    });
  }

  // ── Expose ──
  window.BlogModule={
    load:load,
    getLatest:getLatest,
    getByCat:getByCat,
    renderLatest:renderLatest,
    renderCards:renderCards,
    articles:function(){return ARTICLES.slice();}
  };

  // Inject styles on load
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',injectStyles);
  } else {
    injectStyles();
  }
})();
