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
  function defer(){
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
    var all=d.querySelectorAll(sel);
    if(!('IntersectionObserver' in window)){
      for(var i=0;i<all.length;i++)load(all[i]);
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
  }
  // The ceiling on the hold, first paint and route change. See PaintGate.tsx.
  function gate(first){
    var opened=false,revealed=false;
    root.removeAttribute('data-ready');
    function reveal(){
      if(revealed)return; revealed=true;
      root.setAttribute('data-ready','');
      // AFTER the first screen, never before it. Anything below the fold that
      // starts loading while the gate is still shut is bandwidth taken from
      // the screen the visitor is waiting on — and on a fast connection it
      // also lands before the first paint, which is how Lighthouse ends up
      // charging the whole page's artwork to Largest Contentful Paint.
      defer();
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
      if(d.fonts)waits.push(d.fonts.ready.catch(function(){}));
      var imgs=d.images;
      for(var i=0;i<imgs.length;i++){
        // Lazy images are below the fold and have not started.
        if(imgs[i].loading==='lazy')continue;
        // No boxes means display:none: never fetched, so never resolved.
        if(!imgs[i].getClientRects().length)continue;
        waits.push(painted(imgs[i]));
      }
      var els=d.querySelectorAll('[data-await-bg]');
      for(var j=0;j<els.length;j++){
        if(!els[j].getClientRects().length)continue;
        var layers=getComputedStyle(els[j]).backgroundImage,m,re=/url\\((['"]?)(.*?)\\1\\)/g;
        while((m=re.exec(layers))){
          var u=m[2];
          if(!u||u.indexOf('data:')===0)continue;
          var probe=new Image();probe.src=u;waits.push(painted(probe));
        }
      }
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
