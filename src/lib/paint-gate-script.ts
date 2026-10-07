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
import { LOCAL_CURRENCIES, type LocalCurrency } from "@/lib/pricing";

/**
 * A CURRENCY AREA BY TIME ZONE: the one thing about where a visitor is that
 * a static page knows before it has painted. Cloudflare's country would mean
 * a request first, and a "$5" that turns into "€5" on screen is the swap the
 * paint gate exists to prevent. Every zone of a country on that currency,
 * and no other: Liechtenstein (Vaduz) is on the franc, not the euro; the
 * Channel Islands and the Isle of Man are on the pound. `?currency=eur`
 * (gbp, chf, usd) overrides it for the visit, kept in sessionStorage, which
 * is how it is tested without a VPN. Each entry here is a currency in
 * pricing.ts's LOCAL_CURRENCIES — npm test holds the two lists together.
 */
export const CURRENCY_ZONES: Array<[LocalCurrency, string[]]> = [
  [
    "eur",
    [
      "Europe/(Amsterdam|Andorra|Athens|Berlin|Bratislava|Brussels|Busingen|Dublin|Helsinki|Lisbon|Ljubljana|Luxembourg|Madrid|Malta|Mariehamn|Monaco|Nicosia|Paris|Podgorica|Riga|Rome|San_Marino|Tallinn|Vatican|Vienna|Vilnius|Zagreb)",
      "Atlantic/(Azores|Canary|Madeira)",
      "Asia/Nicosia",
    ],
  ],
  ["gbp", ["Europe/(London|Belfast|Guernsey|Jersey|Isle_of_Man)"]],
  ["chf", ["Europe/(Zurich|Vaduz)"]],
];
// Inside a regex literal a slash ends it: escaped, or the whole gate is a
// syntax error and the page never shows (seen 2026-10-06, first build).
const zoneTests = CURRENCY_ZONES.map(
  ([currency, zones]) => `if(/^(${zones.join("|").replace(/\//g, "\\/")})$/.test(tz))c='${currency}';`,
).join("");

export const PAINT_GATE_SCRIPT = `
(function(){
  var d=document,root=d.documentElement;
  // THE VISITOR'S CURRENCY, named on <html> before anything is painted — see
  // src/lib/money.ts. Only a currency the catalog sells in may be named.
  try{
    var sold=${JSON.stringify(["usd", ...LOCAL_CURRENCIES])},q=/[?&]currency=([a-z]{3})/i.exec(location.search),c=q?q[1].toLowerCase():'',ss=window.sessionStorage;
    if(sold.indexOf(c)<0)c='';
    if(c)ss.setItem('currency',c);else c=ss.getItem('currency')||'';
    if(sold.indexOf(c)<0){var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';c='usd';${zoneTests}}
    if(c!=='usd')root.setAttribute('data-currency',c);
  }catch(e){}
  // BELOW THE FOLD, NOTHING IS ON THE WIRE UNTIL THE FIRST SCREEN IS DONE —
  // AND THEN ALL OF IT IS, IN ORDER (see warm(), 2026-10-04). What follows
  // is how the URLs are kept from the browser until then.
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
  // comes within a screen and a half of the viewport, or when warm() reaches
  // it, whichever is first.
  //
  // The failure mode is the same as the gate's: show it anyway. No
  // IntersectionObserver, or an error, and everything is restored at once;
  // with JavaScript off the <noscript> block in layout.tsx does the same.
  var sel='[data-src],[data-bg]';
  // Calls back once a picture has arrived AND decoded — or failed, or taken
  // HOLD_MS, because nothing here may wait for ever.
  //
  // "Arrived" is the load event, or complete WITH pixels. Not complete alone:
  // an <img> that has just been given its src still answers complete=true
  // until the browser gets round to the request, and decode() on an SVG can
  // reject outright — either of which called a picture loaded while it was
  // still on the wire, and showed its card without it.
  //
  // HOLD_MS is long on purpose (Žilvinas 2026-10-04: an unloaded picture is
  // never to be seen). It is the ceiling for a line that has stalled, not a
  // budget: a card shows the moment its pictures are in.
  var HOLD_MS=12000;
  function settle(img,cb){
    var f=0,fin=function(){if(f)return;f=1;cb()};
    var dec=function(){try{img.decode().then(fin,fin)}catch(e){fin()}};
    setTimeout(fin,HOLD_MS);
    if(img.complete&&img.naturalWidth>0)dec();
    else{img.addEventListener('load',dec,{once:true});img.addEventListener('error',fin,{once:true})}
  }
  // The file a deferred background will draw at this width, as a probe.
  function bgProbe(el){
    var wide=window.matchMedia&&window.matchMedia('(min-width:768px)').matches;
    var v=(wide&&el.getAttribute('data-bg-md'))||el.getAttribute('data-bg')||'';
    var m=/url\\((['"]?)(.*?)\\1\\)/.exec(v);
    if(!m||!m[2]||m[2].indexOf('data:')===0)return null;
    var p=new Image();p.src=m[2];return p;
  }
  // A CARD IS SHOWN WITH ITS PICTURES OR NOT AT ALL (Žilvinas 2026-10-04,
  // after the pre-loading below was live: "once I am in the page I can't
  // see, as a user, an unloaded image"). Loading everything early makes the
  // gap short; it cannot make it zero for a reader who scrolls the moment
  // the page appears. So the gap is made invisible instead: before the veil
  // lifts, every card (article, li, figure) that has a deferred picture in
  // it is hidden — words, plate and all — and it comes back, finished, when
  // the last of its pictures has arrived and decoded. What the reader can
  // meet is a card that is not there yet, never one that is half there.
  //
  // A card with a deferred BACKGROUND holds itself the same way through
  // data-bg (see load), so those are left to it. Cards in a marquee group
  // just appear; a fade would fight the rail's own transitions. HOLD_MS
  // after a card's first picture is asked for it is shown regardless.
  function hold(){
    var c=d.querySelectorAll('img[data-src]');
    for(var i=0;i<c.length;i++){
      var el=c[i];
      if(el.__card)continue;
      // Rendered pictures only — what this breakpoint does not draw is never
      // fetched, and a card must not wait for it. EXCEPT in a rail: its far
      // cards are display:none until the rail turns to them, their pictures
      // are fetched with the group all the same (gateOnly makes them eager),
      // and a card that turned up before its picture did is exactly what
      // the page-quality gate caught on /case-studies' phone rails.
      if(!el.getClientRects().length&&!(el.loading==='eager'&&el.closest('[data-defer-group]')))continue;
      var card=el.closest('article,li,figure');
      if(!card||card.hasAttribute('data-bg')||card.closest('[data-bg],[data-bg-wait]'))continue;
      card.__n=(card.__n||0)+1;el.__card=card;
      card.setAttribute('data-hold','');
    }
  }
  function release(card){
    if(!card.hasAttribute('data-hold'))return;
    if(!card.closest('[data-defer-group]')){
      card.setAttribute('data-hold-in','');
      setTimeout(function(){card.removeAttribute('data-hold-in')},600);
    }
    card.removeAttribute('data-hold');
  }
  function load(el){
      var s=el.getAttribute('data-src');
      if(s){
        // Its turn has come, so it must not wait a second time on Chrome's
        // own lazy threshold — which is what loading=lazy would do to a
        // picture warm() reaches while it is still screens away. Only if it
        // is rendered: an eager <img> under display:none is fetched all the
        // same, and that is the other breakpoint's artwork.
        if(el.getClientRects().length)el.loading='eager';
        // Inside a <picture>, the sources first: their URLs are deferred the
        // same way (Img.tsx), and they have to be in place before the <img>
        // gets its src or the browser picks the wrong file and then the
        // right one.
        var pic=el.parentNode;
        if(pic&&pic.tagName==='PICTURE'){
          var so=pic.querySelectorAll('source[data-srcset]');
          for(var o=0;o<so.length;o++){so[o].setAttribute('srcset',so[o].getAttribute('data-srcset'));so[o].removeAttribute('data-srcset')}
        }
        var ss=el.getAttribute('data-srcset');
        if(ss){el.setAttribute('srcset',ss);el.removeAttribute('data-srcset')}
        el.setAttribute('src',s);el.removeAttribute('data-src');
        // NOT SEEN UNTIL IT IS ALL THERE (globals.css hides data-src-wait):
        // a picture still arriving is one a reader can watch arrive.
        el.setAttribute('data-src-wait','');
        var card=el.__card;
        if(card&&!card.__t)card.__t=setTimeout(function(){release(card)},HOLD_MS);
        settle(el,function(){
          el.removeAttribute('data-src-wait');
          if(card&&!--card.__n)release(card);
        });
      }
      var b=el.getAttribute('data-bg');
      if(b){
        // A CARD IS SHOWN WHOLE OR NOT AT ALL (Žilvinas 2026-10-04, a card's
        // text sitting on an empty plate: "either don't show anything when
        // pictures are not loaded or load everything beforehand"). Both are
        // done; this is the first half. An element with a deferred
        // background is invisible while it carries data-bg (globals.css),
        // and from here it carries data-bg-wait instead until its artwork
        // has arrived and decoded — together with every picture and nested
        // background inside it, which are loaded now for that reason. Then
        // it fades in, finished. HOLD_MS is the ceiling.
        var n=1,up=0,inner=[];
        var show=function(){
          if(up)return;up=1;
          el.setAttribute('data-bg-in','');el.removeAttribute('data-bg-wait');
          setTimeout(function(){el.removeAttribute('data-bg-in')},600);
        };
        var one=function(){if(!--n)show()};
        if(el.getClientRects().length){
          var pr=bgProbe(el);
          if(pr){n++;settle(pr,one)}
          var ins=el.querySelectorAll(sel);
          for(var q=0;q<ins.length;q++){
            if(!ins[q].getClientRects().length)continue;
            var ip=ins[q].tagName==='IMG'?ins[q]:bgProbe(ins[q]);
            if(ip){n++;settle(ip,one)}
            inner.push(ins[q]);
          }
          el.setAttribute('data-bg-wait','');
          setTimeout(show,HOLD_MS);
        }
        // The property is what the stylesheet already points at: every
        // deferred background is background-image:var(--bg,none), so setting
        // it here is the whole of "load it now". --bg-md is the desktop
        // twin, and the media query in the class decides which is used.
        el.style.setProperty('--bg',b);
        var bm=el.getAttribute('data-bg-md');
        if(bm)el.style.setProperty('--bg-md',bm);
        el.removeAttribute('data-bg');el.removeAttribute('data-bg-md');
        for(var w=0;w<inner.length;w++)load(inner[w]);
        one();
      }
  }
  function loadGroup(g){
    var kids=g.querySelectorAll(sel);
    for(var k=0;k<kids.length;k++)load(kids[k]);
    load(g);
  }
  // WHAT IS ON SCREEN IS LOADED, FROM THE START (2026-10-05). defer() below
  // does not arm until the first screen has finished arriving and the veil
  // has gone — up to five seconds — and until it does nothing was watching:
  // a reader who scrolled at once, or a browser that restored the scroll
  // position late, sat on held cards nobody had asked for yet. This observer
  // has NO margin, so it fetches nothing the reader is not actually looking
  // at, and the rule that the first screen owes nothing to what is under it
  // stands. defer() takes over from it, with its two screens of warning.
  function onScreen(){
    if(!('IntersectionObserver' in window))return;
    if(window.__mushiIO0)window.__mushiIO0.disconnect();
    var o=window.__mushiIO0=new IntersectionObserver(function(es){
      for(var i=0;i<es.length;i++){
        if(!es[i].isIntersecting)continue;
        var t=es[i].target;o.unobserve(t);
        if(t.hasAttribute('data-defer-group'))loadGroup(t);else load(t);
      }
    });
    var c=d.querySelectorAll(sel+',[data-defer-group]');
    for(var j=0;j<c.length;j++){
      if(c[j].hasAttribute('data-defer-group')||!c[j].closest('[data-defer-group]'))o.observe(c[j]);
    }
  }
  // THE REST OF THE PAGE LOADS ITSELF, TOP TO BOTTOM, ONCE THE FIRST SCREEN
  // IS DONE (Žilvinas 2026-10-04: "it can't be that once you scroll down
  // there are images that weren't yet loaded — that kills the conversion").
  //
  // The observer alone meant a picture was asked for when the reader was two
  // thirds of a screen away from it. For a 950 KB illustration that is not
  // enough on any connection: it arrived, and was decoded, in front of them.
  //
  // So when defer() arms — and not before: the first screen still owes
  // nothing to what is under it — this walks every deferred picture and
  // background in document order and loads it, six at a time, waiting for
  // each to arrive AND decode before taking the next. In order, so the
  // sections fill in the order they are read; a few at a time, so the next
  // section is not sharing the line with the last one. The observer stays:
  // whatever the reader gets near jumps the queue.
  //
  // Skipped: anything not rendered (the other breakpoint's artwork), and
  // the whole pass for a visitor who has asked for less data or is on a 2G
  // connection — they keep the observer's just-in-time loading.
  function warm(){
    var c=navigator.connection;
    if(c&&(c.saveData||/2g/.test(c.effectiveType||'')))return;
    var list=d.querySelectorAll(sel+',[data-defer-group]'),i=0,busy=0;
    function done(){busy--;next()}
    function next(){
      while(busy<6&&i<list.length){
        var el=list[i++];
        if(!el.getClientRects().length)continue;
        if(el.hasAttribute('data-defer-group')){
          var kids=el.querySelectorAll('img[data-src]'),left=kids.length;
          if(!left&&!el.hasAttribute('data-bg')&&!el.querySelector('[data-bg]'))continue;
          busy++;loadGroup(el);
          if(!left){done();continue}
          for(var k=0;k<kids.length;k++)settle(kids[k],function(){if(!--left)done()});
          continue;
        }
        if(el.closest('[data-defer-group]'))continue;
        var isImg=el.tagName==='IMG'&&el.hasAttribute('data-src');
        if(!isImg&&!el.hasAttribute('data-bg'))continue;
        var probe=isImg?el:bgProbe(el);
        busy++;load(el);
        if(probe)settle(probe,done);else done();
      }
    }
    next();
    // And the few pictures that were left to the browser's own lazy loading
    // (small vectors with a real src) are asked for now as well, rather than
    // when Chrome decides the reader is close enough.
    var lz=d.querySelectorAll('img[loading="lazy"][src]');
    for(var z=0;z<lz.length;z++)if(lz[z].getClientRects().length)lz[z].loading='eager';
  }
  function defer(){
    // A MARQUEE LOADS AS A GROUP. The showcase wall and the creatives rail
    // drift sideways for ever: a tile four screens to the right is a few
    // seconds away, not a scroll away, so per-tile intersection would have it
    // arrive blank and fill in under the reader. An element marked
    // data-defer-group loads everything inside it the moment the GROUP comes
    // into range, and its children are left off the individual pass.
    var groups=d.querySelectorAll('[data-defer-group]');
    if(window.__mushiIO0){window.__mushiIO0.disconnect();window.__mushiIO0=null}
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
    // Vertical: two screens of warning (it was two thirds of one, 600px,
    // while this observer was the only thing loading the page). warm() now
    // loads everything in order regardless, so the margin's job is only to
    // let what the reader is heading for jump that queue — the earlier the
    // better.
    // Horizontal: much wider, because the creatives rail and the tile strips
    // travel sideways — a card three screens to the right is seconds away, not
    // a scroll away, and 0 here would pop it in mid-marquee.
    },{rootMargin:'1600px 3000px'});
    for(var j=0;j<all.length;j++)io.observe(all[j]);
    var gio=new IntersectionObserver(function(entries){
      for(var i=0;i<entries.length;i++){
        if(entries[i].isIntersecting){gio.unobserve(entries[i].target);loadGroup(entries[i].target)}
      }
    // A group is loaded on the vertical margin alone — its own width is the
    // horizontal reach, and that is the point of grouping it.
    },{rootMargin:'1600px 0px'});
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
    try{warm()}catch(e){}
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
      try{hold()}catch(e0){}
      try{onScreen()}catch(e1){}
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
      function awaitBg(el,into){
        var layers=getComputedStyle(el).backgroundImage,m,re=/url\\((['"]?)(.*?)\\1\\)/g;
        while((m=re.exec(layers))){
          var u=m[2];
          if(!u||u.indexOf('data:')===0)continue;
          var probe=new Image();probe.src=u;(into||waits).push(painted(probe));
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
      //
      // WAITED FOR UNTIL IT IS ON SCREEN, FINISHED (Žilvinas 2026-10-05, the
      // team's portraits after a reload: "I still sometimes don't see
      // pictures immediately"). These went through painted(), which trusts
      // img.complete — and an <img> handed its src a moment ago still answers
      // complete=true until the browser gets round to the request, so each
      // one counted as loaded on the spot and the veil lifted over the gap
      // (measured on the live page: reveal 50-100ms before the last of them).
      // done() is the stricter test load() already uses to show a picture:
      // arrived WITH pixels, and decoded. A background, and the card either
      // sits in, is waited for until its own hold has come off — which is
      // when every picture inside it is in as well.
      var shown=function(el){
        return new Promise(function(res){
          var n=0,t=setInterval(function(){
            if(++n>400||!(el.hasAttribute('data-src-wait')||el.hasAttribute('data-bg-wait')||el.hasAttribute('data-hold'))){clearInterval(t);res()}
          },30);
        });
      };
      var done=function(el){
        return new Promise(function(res){
          var box=el.tagName==='IMG'?(el.__card||null):el;
          var held=function(){return box&&(box.hasAttribute('data-bg-wait')||box.hasAttribute('data-hold'))};
          var wait=function(){
            if(!held())return res();
            var n=0,t=setInterval(function(){if(!held()||++n>400){clearInterval(t);res()}},30);
          };
          if(el.tagName==='IMG')settle(el,wait);else wait();
        });
      };
      var sweep=function(into){
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
          for(var k=0;k<kids.length;k++)if(inView(kids[k]))into.push(done(kids[k]));
        }
        var dfs=d.querySelectorAll(sel);
        for(var x=0;x<dfs.length;x++){
          var el=dfs[x];
          if(el.closest('[data-defer-group]')||!inView(el))continue;
          var wasImg=el.tagName==='IMG',hadBg=el.hasAttribute('data-bg');
          load(el);
          if(wasImg)into.push(done(el));
          if(hadBg){awaitBg(el,into);into.push(done(el))}
        }
        // And what is in view and ALREADY on its way — asked for by
        // onScreen() the moment the page jumped here, so no longer carrying
        // the data-src or data-bg the pass above looks for. Still not shown,
        // so still waited for.
        var mid=d.querySelectorAll('img[data-src-wait],[data-bg-wait],[data-hold]');
        for(var y=0;y<mid.length;y++)if(inView(mid[y]))into.push(shown(mid[y]));
      }catch(e2){}
      };
      sweep(waits);
      // AND ONCE MORE BEFORE THE VEIL LIFTS, because the browser may not have
      // put us anywhere yet. Chrome restores the scroll position before
      // DOMContentLoaded; Safari does it after the load event (measured in
      // WebKit, same day: this pass ran at y=0, the page jumped to y=5543
      // 13ms after load, and the veil lifted on two portraits that then took
      // a second to turn up). So on a reload or a Back, the reveal waits for
      // load and a beat more, and whatever is in view THEN is swept and
      // waited for as well. A first visit has no position to be restored to
      // and waits for nothing extra; its second sweep finds nothing new.
      // The gate's own 4s ceiling still bounds all of it.
      try{
        var nav=first&&performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
        if(nav&&(nav.type==='reload'||nav.type==='back_forward')&&d.readyState!=='complete'){
          waits.push(new Promise(function(r){
            window.addEventListener('load',function(){setTimeout(r,80)},{once:true});
          }));
        }
      }catch(e3){}
      var again=function(){
        var more=[];sweep(more);
        if(more.length)Promise.all(more).then(open,open);else open();
      };
      Promise.all(waits).then(again,open);
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
