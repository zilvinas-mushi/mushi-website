/**
 * THE PAINT GATE'S ENGINE, as an inline <head> script.
 *
 * The rule and the reasoning are in PaintGate.tsx — this file is only about
 * WHERE the work runs, and that turns out to be most of the page's mobile
 * score.
 *
 * It used to run inside the React component, which means it could not start
 * until the bundle had been fetched, parsed and hydrated: ~370 KB of JavaScript
 * over the wire before anything could even begin waiting for the fonts. On a
 * simulated Slow-4G phone that put the reveal — and therefore Largest
 * Contentful Paint, because the LCP element is behind the gate — at 7.2s on a
 * page whose hero artwork had been decoded since 1.4s. The gate was not slow;
 * it was queued behind React.
 *
 * As an inline script in the head it runs while the HTML is still arriving. It
 * waits for exactly the same things, opens on exactly the same terms, and the
 * bundle is no longer in the critical path of the first screen at all.
 *
 * It hangs `__mushiGate(false)` off `window` so the React component can re-arm
 * it on a client-side route change — one implementation, called from two
 * places, rather than two copies to keep in step.
 *
 * ES5 only, and small: this is parsed on the main thread before anything else
 * can paint, so it stays under a kilobyte and uses no syntax an older browser
 * would choke on — a syntax error here would leave `data-ready` unset and the
 * page blank until the timeout.
 */
export const PAINT_GATE_SCRIPT = `
(function(){
  var d=document,root=d.documentElement;
  // BELOW THE FOLD, NOTHING IS ON THE WIRE UNTIL IT IS NEARLY IN VIEW.
  //
  // loading=lazy was not enough and a CSS background cannot say it at all.
  // Chrome's own lazy threshold stretches to ~8000px on a slow connection, and
  // background-image has no threshold whatsoever: every card, band and panel
  // artwork on the page was fetched at once. Measured on /templates: 1.8 MB
  // arrived before the first screen was allowed to paint, 900 KB of it
  // backgrounds for sections a visitor had not scrolled to.
  //
  // So the URL is kept where the browser cannot see it: data-src on an image,
  // a --bg custom property on a background (a url() inside a custom property
  // is NOT fetched until something uses it). It is put back when the element
  // comes within a screen and a half of the viewport.
  //
  // The failure mode is the same as the gate's: show it anyway. No
  // IntersectionObserver, or an error, and everything is restored at once;
  // with JavaScript off the <noscript> block in layout.tsx does the same.
  var sel='[data-src],[data-bg]';
  function load(el){
      var s=el.getAttribute('data-src');
      if(s){
        var ss=el.getAttribute('data-srcset');
        if(ss){el.setAttribute('srcset',ss);el.removeAttribute('data-srcset')}
        el.setAttribute('src',s);el.removeAttribute('data-src');
      }
      var b=el.getAttribute('data-bg');
      if(b){
        // The property is what the stylesheet already points at: every
        // deferred background is background-image:var(--bg,none), so setting
        // it here is the whole of "load it now". --bg-md is the desktop
        // twin, and the media query in the class decides which is used.
        el.style.setProperty('--bg',b);
        var bm=el.getAttribute('data-bg-md');
        if(bm)el.style.setProperty('--bg-md',bm);
        el.removeAttribute('data-bg');el.removeAttribute('data-bg-md');
      }
  }
  function loadGroup(g){
    var kids=g.querySelectorAll(sel);
    for(var k=0;k<kids.length;k++)load(kids[k]);
    load(g);
  }
  function defer(){
    // A MARQUEE LOADS AS A GROUP. The showcase wall and the creatives rail
    // drift sideways for ever: a tile four screens to the right is a few
    // seconds away, not a scroll away, so per-tile intersection would have it
    // arrive blank and fill in under the reader. An element marked
    // data-defer-group loads everything inside it the moment the GROUP comes
    // into range, and its children are left off the individual pass.
    var groups=d.querySelectorAll('[data-defer-group]');
    // The creatives rail arms itself two viewports out, on its own reasoning
    // (CreativesRail.tsx); this is the handle it pulls.
    window.__mushiLoadGroup=loadGroup;
    var all=[],cand=d.querySelectorAll(sel);
    for(var c=0;c<cand.length;c++){
      if(!cand[c].closest('[data-defer-group]'))all.push(cand[c]);
    }
    if(!('IntersectionObserver' in window)){
      for(var i=0;i<all.length;i++)load(all[i]);
      for(var g0=0;g0<groups.length;g0++)loadGroup(groups[g0]);
      return;
    }
    var io=new IntersectionObserver(function(entries){
      for(var i=0;i<entries.length;i++){
        if(entries[i].isIntersecting){io.unobserve(entries[i].target);load(entries[i].target)}
      }
    // Vertical: two thirds of a screen of warning, enough that the artwork is
    // decoded before it is scrolled to and little enough that the next
    // section's 300 KB is not on the wire while the first is still being read.
    // Horizontal: much wider, because the creatives rail and the tile strips
    // travel sideways — a card three screens to the right is seconds away, not
    // a scroll away, and 0 here would pop it in mid-marquee.
    },{rootMargin:'600px 3000px'});
    for(var j=0;j<all.length;j++)io.observe(all[j]);
    var gio=new IntersectionObserver(function(entries){
      for(var i=0;i<entries.length;i++){
        if(entries[i].isIntersecting){gio.unobserve(entries[i].target);loadGroup(entries[i].target)}
      }
    // A group is loaded on the vertical margin alone — its own width is the
    // horizontal reach, and that is the point of grouping it.
    },{rootMargin:'600px 0px'});
    for(var g=0;g<groups.length;g++)gio.observe(groups[g]);
    // ANYTHING ADDED LATER IS WATCHED TOO. The pass above only knows the
    // elements that existed when it ran; a picture React renders afterwards
    // — a client-side re-render, or dev's hot reload swapping in an edited
    // subtree — carried its URL in data-src with nothing ever moving it
    // across, and sat invisible for good (the Konvert star and the Kandy
    // logo, 2026-09-19, after an edit while the tab was open). One observer
    // per arming; a re-arm on a route change replaces it.
    if('MutationObserver' in window){
      if(window.__mushiMO)window.__mushiMO.disconnect();
      window.__mushiMO=new MutationObserver(function(recs){
        for(var r=0;r<recs.length;r++){
          // A data-src / data-bg SET ON AN EXISTING ELEMENT counts too: a
          // re-render that only swaps the URL (dev's hot reload after the
          // Canva card's art changed, 2026-09-19) adds no node.
          if(recs[r].type==='attributes'){
            var t=recs[r].target;
            if(t.matches&&t.matches(sel)&&!t.closest('[data-defer-group]'))io.observe(t);
            continue;
          }
          var added=recs[r].addedNodes;
          for(var a=0;a<added.length;a++){
            var n=added[a];
            if(n.nodeType!==1)continue;
            var list=[];
            if(n.matches&&n.matches(sel))list.push(n);
            var inner=n.querySelectorAll?n.querySelectorAll(sel):[];
            for(var q=0;q<inner.length;q++)list.push(inner[q]);
            for(var l=0;l<list.length;l++){
              if(list[l].closest('[data-defer-group]'))continue;
              io.observe(list[l]);
            }
          }
        }
      });
      window.__mushiMO.observe(d.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-src','data-bg']});
    }
  }
  // The ceiling on the hold, first paint and route change. See PaintGate.tsx.
  function gate(first){
    var opened=false,revealed=false;
    root.removeAttribute('data-ready');
    function reveal(){
      if(revealed)return; revealed=true;
      root.setAttribute('data-ready','');
      // AFTER the first screen has not only been revealed but finished
      // ARRIVING, which is what the load event means on a page whose only
      // eager assets are the first screen's. Anything below the fold that
      // starts before then is bandwidth taken from the screen the visitor is
      // waiting on — and on a fast connection it also lands before the paint,
      // where Lighthouse charges it to Largest Contentful Paint. A fixed
      // delay was not enough: PageSpeed still had the next section's 298 KB
      // inside the window. The timer stays as the floor for a page that is
      // already loaded (a route change) and as the ceiling if load never
      // comes.
      // BOTH conditions, not either: the load event and the end of the fade.
      // They run neck and neck — load fires when the first screen's last eager
      // byte lands, the fade ends 400ms after the reveal — and on a quick run
      // load wins, which let half a megabyte back inside the window Largest
      // Contentful Paint is measured over (measured: 930 KB on one run, 429
      // KB on the next, five points apart). The 5s ceiling is the failsafe.
      var armed=false,loaded=d.readyState==='complete',faded=false;
      function arm(){ if(armed||!loaded||!faded)return; armed=true; setTimeout(defer,300) }
      function force(){ loaded=faded=true; arm() }
      if(!loaded)window.addEventListener('load',function(){loaded=true;arm()},{once:true});
      setTimeout(function(){faded=true;arm()},450);
      setTimeout(force,5000)
    }
    function open(){
      if(opened)return; opened=true;
      // A hidden tab gets no frames: rAF never fires, so reveal outright.
      if(d.visibilityState==='hidden'){ reveal(); return; }
      requestAnimationFrame(function(){ requestAnimationFrame(reveal); });
      setTimeout(reveal,150);
    }
    setTimeout(open,first?4000:1500);
    function painted(img){
      var arrived=img.complete?Promise.resolve():new Promise(function(r){
        img.addEventListener('load',function(){r()},{once:true});
        img.addEventListener('error',function(){r()},{once:true});
      });
      var dec;
      try{ dec=img.decode().catch(function(){}) }catch(e){ dec=arrived }
      return Promise.race([dec,arrived]);
    }
    function collect(){
      var waits=[];
      // THE FACES THE FIRST SCREEN ACTUALLY USES, not every face the document
      // asks for anywhere. document.fonts.ready waits for all of them —
      // Poppins in five weights here, of which the hero uses two — and each
      // one is a request the reveal is held behind. What the rule says is
      // that nothing may paint in a fallback and swap; a weight that only
      // appears six screens down will have arrived long before anyone reads
      // it, and holding the hero for it buys nothing.
      //
      // So: walk what is in the viewport, collect the (style, weight, family)
      // triples it is set in, and wait for exactly those. If anything here
      // throws, or nothing is found, fall back to waiting for all of them.
      var fontWaits=[];
      try{
        if(d.fonts&&d.fonts.load){
          var seen={},h=window.innerHeight,els=d.body.querySelectorAll('*');
          for(var f=0;f<els.length;f++){
            var e=els[f];
            if(!e.firstChild||e.firstChild.nodeType!==3)continue;
            if(!e.firstChild.data||!e.firstChild.data.trim())continue;
            var r=e.getBoundingClientRect();
            if(r.top>h||r.bottom<0||!r.width)continue;
            var cs=getComputedStyle(e);
            seen[cs.fontStyle+' '+cs.fontWeight+' 1em '+cs.fontFamily]=1;
          }
          for(var spec in seen)fontWaits.push(d.fonts.load(spec).catch(function(){}));
        }
      }catch(err){fontWaits=[]}
      if(fontWaits.length)for(var q=0;q<fontWaits.length;q++)waits.push(fontWaits[q]);
      else if(d.fonts)waits.push(d.fonts.ready.catch(function(){}));
      var imgs=d.images;
      for(var i=0;i<imgs.length;i++){
        // Lazy images are below the fold and have not started.
        if(imgs[i].loading==='lazy')continue;
        // No boxes means display:none: never fetched, so never resolved.
        if(!imgs[i].getClientRects().length)continue;
        waits.push(painted(imgs[i]));
      }
      function awaitBg(el){
        var layers=getComputedStyle(el).backgroundImage,m,re=/url\\((['"]?)(.*?)\\1\\)/g;
        while((m=re.exec(layers))){
          var u=m[2];
          if(!u||u.indexOf('data:')===0)continue;
          var probe=new Image();probe.src=u;waits.push(painted(probe));
        }
      }
      var els=d.querySelectorAll('[data-await-bg]');
      for(var j=0;j<els.length;j++){
        if(!els[j].getClientRects().length)continue;
        awaitBg(els[j]);
      }
      // THE FIRST SCREEN IS WHEREVER THE BROWSER PUT US, not always the top
      // (Žilvinas 2026-09-19, "it really sucks when you refresh to see empty
      // places"). A refresh restores the scroll position, and the deferred
      // artwork that lands in that viewport used to arrive a second after
      // the reveal, because the observer below only arms after load and the
      // fade. So anything deferred that is in view NOW is loaded here and
      // waited for like the hero's own pictures — and only that: the rule
      // against gating on below-fold bytes still holds for everything
      // outside the viewport. A marquee group in view loads whole, as it
      // would from the observer.
      try{
        var vh=window.innerHeight,inView=function(el){
          var r=el.getBoundingClientRect();
          return (r.width||r.height)&&r.bottom>0&&r.top<vh;
        };
        var gs=d.querySelectorAll('[data-defer-group]'),seen=[];
        for(var g=0;g<gs.length;g++){
          if(!inView(gs[g]))continue;
          var kids=gs[g].querySelectorAll('img[data-src]');
          loadGroup(gs[g]);
          for(var k=0;k<kids.length;k++)if(inView(kids[k]))waits.push(painted(kids[k]));
        }
        var dfs=d.querySelectorAll(sel);
        for(var x=0;x<dfs.length;x++){
          var el=dfs[x];
          if(el.closest('[data-defer-group]')||!inView(el))continue;
          var wasImg=el.tagName==='IMG',hadBg=el.hasAttribute('data-bg');
          load(el);
          if(wasImg)waits.push(painted(el));
          if(hadBg)awaitBg(el);
        }
      }catch(e2){}
      Promise.all(waits).then(open,open);
    }
    // The document has to exist before it can be measured. On the first paint
    // this script runs in the head, so it waits for the parser; on a route
    // change the DOM is already there and it starts at once.
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',collect,{once:true});
    else collect();
  }
  window.__mushiGate=gate;
  gate(true);

})();
`;
