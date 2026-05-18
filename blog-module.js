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

  // ── Styling (injected once) — exact same as blog.html sidebar ──
  function injectStyles(){
    if(document.getElementById('blog-module-css'))return;
    var css=document.createElement('style');
    css.id='blog-module-css';
    css.textContent=
      '/* blog-module: copy of blog.html sidebar styles */'+
      '.bb-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(30,45,66,0.4);}'+
      '.bb-item:last-child{border-bottom:none}'+
      '.bb-thumb{width:44px;height:44px;border-radius:6px;object-fit:cover;flex-shrink:0;background:var(--bg3,#131b2a);display:flex;align-items:center;justify-content:center;font-size:18px}'+
      '.bb-thumb img{width:100%;height:100%;object-fit:cover;border-radius:6px}'+
      '.bb-content{flex:1;min-width:0}'+
      '.bb-title{color:var(--text,#f0f4f8);text-decoration:none;font-size:12px;font-weight:600;display:block;margin-bottom:2px;line-height:1.4;transition:color .2s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
      '.bb-title:hover{color:var(--cyan,#3bb4ff)}'+
      '.bb-meta{font-family:IBM Plex Mono,monospace;font-size:10px;color:var(--text3,#4a5a6e)}';
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

  // ── Render sidebar items — EXACT format as blog.html trending ──
  function renderLatest(containerId,count){
    var container=document.getElementById(containerId);
    if(!container)return;
    load(function(articles){
      // Sort by views desc (trending), then take top N
      var top=articles.slice().sort(function(a,b){return (b.views||0)-(a.views||0)}).slice(0,count||5);
      if(!top.length){
        container.innerHTML='<div style="padding:12px 0;text-align:center;color:var(--text3,#4a5a6e);font-family:IBM Plex Mono,monospace;font-size:12px">No articles yet</div>';
        return;
      }
      container.innerHTML=top.map(function(a){
        var img=a.img||'';
        var thumb=img ? '<img class="bb-thumb" src="'+img+'?w=88&h=88&fit=crop&q=50" alt="" loading="lazy">' : '<div class="bb-thumb">'+(a.emoji||'📰')+'</div>';
        return '<div class="bb-item">'+thumb
          +'<div class="bb-content">'
          +'<a class="bb-title" href="'+SITE+'/blog.html#article-'+a.id+'">'+esc(a.title.slice(0,55))+(a.title.length>55?'…':'')+'</a>'
          +'<div class="bb-meta">'+(a.tag||'Article')+' · '+fmtViews(a.views||0)+' views</div>'
          +'</div></div>';
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
