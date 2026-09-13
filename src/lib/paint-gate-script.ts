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
  // The ceiling on the hold, first paint and route change. See PaintGate.tsx.
  function gate(first){
    var opened=false,revealed=false;
    root.removeAttribute('data-ready');
    function reveal(){ if(revealed)return; revealed=true; root.setAttribute('data-ready',''); }
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
