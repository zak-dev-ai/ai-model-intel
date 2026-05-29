(function(){
  if(window.BlogModule) return;
  var SITE='https://www.aimodelranks.live';
  var ARTICLES=[];
  var LOADED=false;

  function load(callback){
    if(LOADED && ARTICLES.length){if(callback)callback(ARTICLES);return;}
    fetch('/static/blog-articles.json').then(r=>r.json()).then(data=>{
      if(data&&data.articles)ARTICLES=data.articles;
      LOADED=true;
      if(callback)callback(ARTICLES);
    }).catch(()=>{ LOADED=true; if(callback)callback([]); });
  }

  function renderLatest(containerId, count){
    var container=document.getElementById(containerId);
    if(!container) return;
    load(function(articles){
      var top=articles.slice().sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,count||3);
      if(!top.length){ container.innerHTML='<p style="color:var(--muted)">No articles yet.</p>'; return; }
      container.innerHTML=top.map(a=>`
        <div style="display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">
          <div style="width:40px; height:40px; background:var(--surface-2); border-radius:6px; display:flex; align-items:center; justify-content:center;">${a.emoji||'📰'}</div>
          <div>
            <a href="${SITE}/blog#article-${a.id}" style="color:var(--text); text-decoration:none; font-weight:600; font-size:0.875rem;">${a.title}</a>
            <div style="color:var(--muted); font-size:0.75rem; font-family:var(--font-mono);">${a.tag} · ${a.views} views</div>
          </div>
        </div>
      `).join('');
    });
  }

  window.BlogModule = { load, renderLatest };
})();
