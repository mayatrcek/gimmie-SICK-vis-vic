/* sites: marker/weather at the headland; marine pulled just offshore.
   onshore = compass bearing the open ocean faces (also the dir onshore wind blows FROM). */
/* ---- Victorian dive/surf locations, grouped à la Surf-Forecast VIC ---- */
var REGIONS=[
 {region:'Surf Coast', onshore:200, spots:[
   {id:'bells',name:'Bells Beach',lat:-38.368,lon:144.283},
   {id:'winki',name:'Winkipop',lat:-38.367,lon:144.286},
   {id:'janjuc',name:'Jan Juc',lat:-38.345,lon:144.300},
   {id:'torquay',name:'Torquay Point',lat:-38.333,lon:144.323},
   {id:'roadknight',name:'Point Roadknight',lat:-38.428,lon:144.180},
   {id:'anglesea',name:'Anglesea',lat:-38.418,lon:144.183},
   {id:'lorne',name:'Lorne',lat:-38.540,lon:143.978},
   {id:'apollo',name:'Apollo Bay',lat:-38.755,lon:143.668}
 ]},
 {region:'Bellarine', onshore:200, spots:[
   {id:'13th',name:'13th Beach',lat:-38.276,lon:144.470},
   {id:'barwon',name:'Barwon Heads',lat:-38.278,lon:144.490},
   {id:'oceangrove',name:'Ocean Grove',lat:-38.272,lon:144.530},
   {id:'lonsdale',name:'Point Lonsdale',lat:-38.293,lon:144.610}
 ]},
 {region:'Mornington Peninsula', onshore:185, spots:[
   {id:'pointnepean',name:'Point Nepean (buoy)',lat:-38.360,lon:144.687,onshore:190},
   {id:'portsea',name:'Portsea Back Beach',lat:-38.355,lon:144.700},
   {id:'sorrento',name:'Sorrento Back Beach',lat:-38.355,lon:144.740},
   {id:'rye',name:'Rye Back Beach',lat:-38.404,lon:144.820},
   {id:'gunnamatta',name:'Gunnamatta',lat:-38.435,lon:144.876},
   {id:'schanck',name:'Cape Schanck',lat:-38.488,lon:144.891,onshore:180},
   {id:'flinders',name:'Flinders',lat:-38.480,lon:145.020,onshore:170},
   {id:'pointleo',name:'Point Leo',lat:-38.413,lon:145.073,onshore:170}
 ]},
 {region:'Phillip Island', onshore:185, spots:[
   {id:'woolamai',name:'Cape Woolamai',lat:-38.560,lon:145.350,onshore:180},
   {id:'smiths',name:'Smiths Beach',lat:-38.510,lon:145.265},
   {id:'surfbeach',name:'Surf Beach',lat:-38.512,lon:145.245},
   {id:'pyramid',name:'Pyramid Rock',lat:-38.506,lon:145.236},
   {id:'express',name:'Express Point',lat:-38.498,lon:145.205},
   {id:'summerland',name:'Summerland',lat:-38.510,lon:145.100},
   {id:'ycw',name:'YCW / Cat Bay',lat:-38.505,lon:145.130,onshore:200}
 ]},
 {region:'East Coast / Gippsland', onshore:200, spots:[
   {id:'capepat',name:'Cape Paterson',lat:-38.680,lon:145.610},
   {id:'inverloch',name:'Inverloch',lat:-38.640,lon:145.730},
   {id:'venus',name:'Venus Bay',lat:-38.680,lon:145.770},
   {id:'waratah',name:'Waratah Bay',lat:-38.800,lon:146.070},
   {id:'sandypt',name:'Sandy Point',lat:-38.800,lon:146.150},
   {id:'walkerville',name:'Walkerville',lat:-38.880,lon:146.130}
 ]},
 {region:'Far West / Shipwreck Coast', onshore:200, spots:[
   {id:'portcampbell',name:'Port Campbell',lat:-38.620,lon:142.997},
   {id:'princetown',name:'Princetown',lat:-38.690,lon:143.150},
   {id:'warrnambool',name:'Warrnambool (Logans)',lat:-38.400,lon:142.520},
   {id:'portfairy',name:'Port Fairy',lat:-38.390,lon:142.240},
   {id:'portland',name:'Portland',lat:-38.350,lon:141.600}
 ]},
 {region:'Port Phillip (sheltered)', onshore:0, spots:[
   {id:'fort',name:'South Channel Fort',lat:-38.296,lon:144.717,sheltered:true},
   {id:'blairgowrie',name:'Blairgowrie (bay)',lat:-38.357,lon:144.776,sheltered:true}
 ]}
];
var SPOTS={};
REGIONS.forEach(function(rg){ rg.spots.forEach(function(s){ s.region=rg.region; if(s.onshore==null) s.onshore=rg.onshore; if(s.sheltered==null) s.sheltered=false; SPOTS[s.id]=s; }); });
var DEFAULTS=['pointnepean','bells','woolamai','schanck'];
var selected={}, kfSST=null;
/* Surf-Forecast.com break slug for each spot (from surf-forecast.com/provinces/Victoria/breaks).
   Spots without their own page map to the nearest listed break. */
var SF_BREAK={
  bells:'Bells-Beach', winki:'Winki-Pop-V-I-C', janjuc:'Jan-Juc', torquay:'Torquay-Point-and-Beach',
  roadknight:'Point-Roadnight', anglesea:'Anglesea', lorne:'Lorne-Point', apollo:'Apollo-Bay',
  '13th':'Thirteenth-Beach_The-Beacon', barwon:'Thirteenth-Beach_The-Bluff', oceangrove:'Bancoora', lonsdale:'Point-Lonsdale',
  pointnepean:'Quarantine', portsea:'Portsea-Back-Beach', sorrento:'St-Andrews-Beach', rye:'Rye-Ocean-Beach',
  gunnamatta:'Gunnamatta-Beach', schanck:'Cape-Schanck', flinders:'Gunnery', pointleo:'Point-Leo',
  woolamai:'Woolamai', smiths:'Smiths-Beach', surfbeach:'Surf-Beach', pyramid:'Pyramid-Rock_1',
  express:'Express-Point', summerland:'Summerland-Bay', ycw:'Cat-Bay',
  capepat:'Cape-Patterson', inverloch:'Eagles-Nest', venus:'Cape-Liptrap', waratah:'Walkerville',
  sandypt:'Sandy-Point', walkerville:'Walkerville',
  portcampbell:'Gibson-Steps', princetown:'Point-Ronald', warrnambool:'Warnambool-Surf-Beach',
  portfairy:'Port-Fairy', portland:'Portland',
  fort:'Portsea-Back-Beach', blairgowrie:'Pearses-Beach'
};
var surfSel=null;

/* ---- thresholds (easy to tweak) ---- */
var TH = {SWELL_GREAT:1.0, SWELL_MARG:1.5, PERIOD_GOOD:13, PERIOD_VHIGH:14, WIND_LIGHT:15, WIND_STRONG:22, RAIN_HEAVY:15};
var cs = getComputedStyle(document.documentElement);
var COL = {
  Amazing: cs.getPropertyValue('--amazing').trim(),
  Good:    cs.getPropertyValue('--good').trim(),
  Marginal:cs.getPropertyValue('--marg').trim(),
  Poor:    cs.getPropertyValue('--poor').trim()
};
var RANK = {Amazing:4, Good:3, Marginal:2, Poor:1};
function rate(label){ return {label:label, col:COL[label], rank:RANK[label]}; }

function compass(d){
  if(d==null||isNaN(d)) return '';
  var dirs=['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(((d%360)/45))%8];
}
function windRel(from,onshore){
  if(from==null||onshore==null) return {kind:'',label:''};
  var diff=Math.abs(((from-onshore+540)%360)-180); // 0 = blowing straight onshore
  if(diff<=60) return {kind:'on',label:'onshore'};
  if(diff>=120) return {kind:'off',label:'offshore'};
  return {kind:'cross',label:'cross'};
}

/* Maya's rules:
   Amazing  -> swell <1m AND good period AND light wind
   Marginal -> swell 1-1.5m, OR (<1m AND very high period), OR strong onshore wind
   Poor     -> swell >1.5m
   Good     -> otherwise (swell <1m, not marginal, but not quite amazing)
   Heavy recent rain downgrades one tier (runoff = poor viz). */
function classify(h,p,w,windFrom,onshore,rainEff,sheltered){
  if(sheltered){
    // inside the bay: no ocean swell, so rate on wind chop + recent rain only
    var lbl;
    if(w==null) lbl='Good';
    else if(w<TH.WIND_LIGHT) lbl='Amazing';
    else if(w<TH.WIND_STRONG) lbl='Good';
    else lbl='Marginal';
    if(rainEff!=null && rainEff>=TH.RAIN_HEAVY){ if(lbl==='Amazing')lbl='Good'; else if(lbl==='Good')lbl='Marginal'; }
    return rate(lbl);
  }
  if(h==null) return rate('Marginal');
  var rel=windRel(windFrom,onshore);
  var strongOnshore = (rel.kind==='on') && (w!=null && w>=TH.WIND_STRONG);
  if(h>TH.SWELL_MARG) return rate('Poor');
  var isMarginal =
      (h>=TH.SWELL_GREAT) ||
      (h<TH.SWELL_GREAT && p!=null && p>=TH.PERIOD_VHIGH) ||
      strongOnshore;
  var label;
  if(isMarginal){ label='Marginal'; }
  else {
    var lightWind = (w!=null && w<TH.WIND_LIGHT);
    var goodPeriod = (p==null) ? true : (p<TH.PERIOD_GOOD);
    label = (lightWind && goodPeriod) ? 'Amazing' : 'Good';
  }
  if(rainEff!=null && rainEff>=TH.RAIN_HEAVY){
    if(label==='Amazing') label='Good';
    else if(label==='Good') label='Marginal';
  }
  return rate(label);
}

/* ---- data ---- */
var MARINE='https://marine-api.open-meteo.com/v1/marine';
var WEATHER='https://api.open-meteo.com/v1/forecast';
var TZ='Australia/Melbourne';

function fetchSite(s){
  var m=MARINE+'?latitude='+(s.seaLat!=null?s.seaLat:s.lat)+'&longitude='+(s.seaLon!=null?s.seaLon:s.lon)+
    '&daily=swell_wave_height_max,swell_wave_period_max,wave_height_max,wave_period_max'+
    '&hourly=sea_surface_temperature,swell_wave_height,swell_wave_period,sea_level_height_msl'+
    '&timezone='+TZ+'&forecast_days=7';
  var w=WEATHER+'?latitude='+s.lat+'&longitude='+s.lon+
    '&daily=precipitation_sum,rain_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant'+
    '&hourly=wind_speed_10m,wind_direction_10m'+
    '&timezone='+TZ+'&forecast_days=7&past_days=1';
  return Promise.all([fetch(m).then(function(r){return r.json();}), fetch(w).then(function(r){return r.json();})])
    .then(function(res){
      var md=res[0].daily, mh=res[0].hourly||{}, wd=res[1].daily, wIdx={};
      wd.time.forEach(function(d,i){ wIdx[d]=i; });
      var sstSum={}, sstN={};
      if(mh.time){ mh.time.forEach(function(t,k){ var d=t.slice(0,10); var v=mh.sea_surface_temperature?mh.sea_surface_temperature[k]:null; if(v!=null){ sstSum[d]=(sstSum[d]||0)+v; sstN[d]=(sstN[d]||0)+1; } }); }
      var rows=[];
      md.time.forEach(function(date,i){
        var h=(md.swell_wave_height_max&&md.swell_wave_height_max[i]!=null)?md.swell_wave_height_max[i]:(md.wave_height_max?md.wave_height_max[i]:null);
        var p=(md.swell_wave_period_max&&md.swell_wave_period_max[i]!=null)?md.swell_wave_period_max[i]:(md.wave_period_max?md.wave_period_max[i]:null);
        var wi=wIdx[date];
        var wind=(wi!=null)?wd.wind_speed_10m_max[wi]:null;
        var wdir=(wi!=null)?wd.wind_direction_10m_dominant[wi]:null;
        var rToday=(wi!=null)?(wd.precipitation_sum[wi]||0):0;
        var rYest=(wi!=null&&wi>0)?(wd.precipitation_sum[wi-1]||0):0;
        var rEff=rToday+0.5*rYest;
        var sst=(sstN[date])?(sstSum[date]/sstN[date]):null;
        rows.push({date:date,h:h,p:p,sst:sst,wind:wind,wdir:wdir,rel:windRel(wdir,s.onshore),
                   rainToday:rToday,rainEff:rEff,rating:classify(h,p,wind,wdir,s.onshore,rEff,s.sheltered)});
      });
      var hourly={ mtime:(mh.time||[]), swellH:(mh.swell_wave_height||[]), swellP:(mh.swell_wave_period||[]), tide:(mh.sea_level_height_msl||[]),
                   wtime:(res[1].hourly?res[1].hourly.time:[]), wind:(res[1].hourly?res[1].hourly.wind_speed_10m:[]), wdir:(res[1].hourly?res[1].hourly.wind_direction_10m:[]) };
      return {rows:rows, hourly:hourly};
    });
}

/* ---- rendering ---- */
function fmt(n,d){ d=(d==null)?1:d; return (n==null||isNaN(n))?'—':Number(n).toFixed(d); }
function dname(ds){
  var dt=new Date(ds+'T00:00:00'); var today=new Date(); today.setHours(0,0,0,0);
  var diff=Math.round((dt-today)/86400000);
  if(diff===0) return 'Today'; if(diff===1) return 'Tomorrow';
  return dt.toLocaleDateString(undefined,{weekday:'short'})+' '+dt.getDate()+'/'+(dt.getMonth()+1);
}
function windCell(r){
  if(r.wind==null) return '—';
  var tag = r.rel.kind ? ' '+compass(r.wdir)+'·'+r.rel.kind : '';
  return fmt(r.wind,0)+' km/h'+tag;
}
/* ---- selected locations + side panel ---- */
function tomorrowRating(rows){
  if(!rows||!rows.length) return {label:'—',col:'#d7d4c8',rank:0};
  var t=null; for(var i=0;i<rows.length;i++){ if(dname(rows[i].date)==='Tomorrow'){t=rows[i];break;} } if(!t) t=rows[0];
  return t.rating;
}
function todayRating(rows){
  if(!rows||!rows.length) return {label:'—',col:'#d7d4c8',rank:0};
  return todayRow(rows).rating;
}
function outlookTable(s,rows){
  var h='<table><thead><tr><th class="day" style="text-align:left">Day</th><th>Swell</th><th>Period</th><th>SST</th><th>Wind</th><th>Rain</th><th>Rating</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr><td class="day">'+dname(r.date)+'</td><td>'+(s.sheltered?'—':fmt(r.h)+' m')+'</td><td>'+(s.sheltered?'—':fmt(r.p,0)+' s')+'</td>'+
      '<td>'+fmt(r.sst,1)+'&deg;C</td><td>'+windCell(r)+'</td><td>'+fmt(r.rainToday,1)+' mm</td>'+
      '<td><span class="rate" style="background:'+r.rating.col+'">'+r.rating.label+'</span></td></tr>';
  });
  return h+'</tbody></table>';
}
function popupHTML(s,tr){
  var t = tr ? ('Today: <span style="color:'+tr.col+';font-weight:700">'+tr.label+'</span>') : '<i>loading…</i>';
  return '<b>'+s.name+'</b><br><span style="color:#5b6b7b">'+s.region+(s.sheltered?' · sheltered':'')+'</span><br>'+t;
}
function fitMarkers(){
  var pts=[]; for(var id in selected){ if(selected[id].marker) pts.push(selected[id].marker.getLatLng()); }
  if(pts.length===1) map.setView(pts[0],9);
  else if(pts.length>1) map.fitBounds(L.latLngBounds(pts),{padding:[30,30]});
}
function addFromSelect(el){ var id=el.value; el.value=''; if(id) addSpot(id); }
function renderSurf(){
  var box=document.getElementById('surfbox'); if(!box) return;
  if(!surfSel||!SPOTS[surfSel]||!SF_BREAK[surfSel]){ box.hidden=true; return; }
  var s=SPOTS[surfSel], slug=SF_BREAK[surfSel];
  box.hidden=false;
  document.getElementById('surfName').textContent=s.name;
  document.getElementById('surfLink').href='https://www.surf-forecast.com/breaks/'+slug+'/forecasts/latest/six_day';
  var fr=document.getElementById('surfFrame');
  if(fr.getAttribute('data-slug')!==slug){
    fr.setAttribute('data-slug',slug);
    fr.src='https://www.surf-forecast.com/breaks/'+slug+'/forecasts/widget/a';
  }
}
function addSpot(id){
  var s=SPOTS[id]; if(!s) return;
  surfSel=id; renderSurf();
  if(selected[id]){ if(selected[id].marker) map.panTo(selected[id].marker.getLatLng()); return; }
  var st={rows:null,marker:null,expanded:false,loading:true};
  st.marker=L.marker([s.lat,s.lon],{icon:dotIcon('#1b6ca8')}).addTo(map).bindPopup(popupHTML(s,null));
  selected[id]=st;
  fitMarkers(); renderSidePanel();
  fetchSite(s).then(function(res){
    st.rows=res.rows; st.hourly=res.hourly; st.loading=false; var tr=todayRating(res.rows);
    st.marker.setIcon(dotIcon(tr.col)); st.marker.bindPopup(popupHTML(s,tr));
    renderSidePanel(); refreshStretch();
  }).catch(function(){ st.loading=false; st.rows=null; renderSidePanel(); });
}
function removeSpot(id){
  if(!selected[id]) return;
  if(selected[id].marker) map.removeLayer(selected[id].marker);
  delete selected[id];
  if(surfSel===id){ var k=Object.keys(selected); surfSel=k.length?k[k.length-1]:null; renderSurf(); }
  renderSidePanel(); refreshStretch();
}
function toggleExpand(id){ if(selected[id]){ selected[id].expanded=!selected[id].expanded; renderSidePanel(); } }
function renderSidePanel(){
  var el=document.getElementById('sidepanel'); if(!el) return;
  var ids=Object.keys(selected);
  if(!ids.length){ destroyCharts(); el.innerHTML='<div class="empty">Pick a Victorian spot from the menu above to add it below. Each card shows today at a glance — click to expand wind, swell &amp; tide graphs and the week ahead.</div>'; return; }
  var h='';
  ids.forEach(function(id){
    var s=SPOTS[id], st=selected[id];
    var td=st.rows?todayRow(st.rows):null;
    var tr=td?td.rating:{label:(st.loading?'…':'n/a'),col:'#d7d4c8'};
    var today=td?('<span class="tg">'+ICON.wave+' '+(s.sheltered?'sheltered':fmt(td.h,1)+' m / '+fmt(td.p,0)+' s')+'</span><span class="tg">'+ICON.wind+' '+fmt(td.wind,0)+' km/h'+(td.wdir!=null?' '+compass(td.wdir):'')+'</span><span class="tg">'+ICON.temp+' '+fmt(td.sst,1)+'&deg;C</span>'):(st.loading?'loading…':'unavailable');
    h+='<div class="scard">'+
      '<div class="schead" onclick="toggleExpand(\''+id+'\')">'+
        '<span class="chev">'+(st.expanded?'▾':'▸')+'</span>'+
        '<div class="smeta"><div class="sname">'+s.name+' <span class="sreg">'+s.region+(s.sheltered?' · sheltered':'')+'</span></div><div class="stoday">'+today+'</div></div>'+
        '<span class="pill" style="background:'+tr.col+'">'+tr.label+'</span>'+
        '<button class="rm" title="Remove" onclick="event.stopPropagation();removeSpot(\''+id+'\')">&times;</button>'+
      '</div>'+
      (st.expanded?('<div class="sbody"><div class="sbtop"><button class="sbclose" onclick="toggleExpand(\''+id+'\')" aria-label="Close outlook for '+s.name+'" title="Close outlook">&times; Close outlook</button></div>'+(st.hourly?
          ('<div class="chartwrap"><div class="ctitle">Wind (km/h)</div><canvas id="wind-'+id+'"></canvas></div>'+
           '<div class="chartwrap"><div class="ctitle">Swell height (m) &amp; period (s)</div><canvas id="swell-'+id+'"></canvas></div>'+
           '<div class="chartwrap"><div class="ctitle">Tide — sea level (m)</div><canvas id="tide-'+id+'"></canvas></div>'+
           '<div class="ctitle">The week ahead</div>'+(st.rows?weekStrip(s,st.rows):''))
          :(st.loading?'<div class="pad">Loading forecast…</div>':'<div class="pad">Forecast unavailable.</div>'))+'</div>'):'')+
      '</div>';
  });
  el.innerHTML=h;
  buildCharts();
}
function refreshStretch(){
  var sv=[], mx=null;
  for(var id in selected){ var r=selected[id].rows; if(r&&r[0]&&r[0].sst!=null){ sv.push(r[0].sst); if(mx==null||r[0].sst>mx) mx=r[0].sst; } }
  if(sv.length){ var a=sv.reduce(function(x,y){return x+y;},0)/sv.length; sstMin=(a-1).toFixed(1); sstMax=(a+1).toFixed(1); setSSTImages(); var e=document.getElementById('sst-range'); if(e) e.textContent='('+sstMin+'–'+sstMax+'°C)'; }
  kfSST=mx; if(document.getElementById('fishcards')) renderFish();
}
function refreshSelected(){
  Object.keys(selected).forEach(function(id){
    var s=SPOTS[id], st=selected[id]; st.loading=true;
    fetchSite(s).then(function(res){ st.rows=res.rows; st.hourly=res.hourly; st.loading=false; var tr=todayRating(res.rows); if(st.marker){ st.marker.setIcon(dotIcon(tr.col)); st.marker.bindPopup(popupHTML(s,tr)); } renderSidePanel(); refreshStretch(); })
      .catch(function(){ st.loading=false; renderSidePanel(); });
  });
  renderSidePanel();
}
function populateSelect(){
  var sel=document.getElementById('spotSelect'); if(!sel) return;
  var h='<option value="">Choose a Victorian spot…</option>';
  REGIONS.forEach(function(rg){ h+='<optgroup label="'+rg.region+'">'; rg.spots.forEach(function(s){ h+='<option value="'+s.id+'">'+s.name+'</option>'; }); h+='</optgroup>'; });
  sel.innerHTML=h;
}
/* ---- charts + weekly overview ---- */
function todayRow(rows){ for(var i=0;i<rows.length;i++){ if(dname(rows[i].date)==='Today') return rows[i]; } return rows[0]; }
function dnameShort(ds){ var dt=new Date(ds+'T00:00:00'); var t=new Date(); t.setHours(0,0,0,0); var diff=Math.round((dt-t)/86400000); if(diff===0)return 'Today'; if(diff===1)return 'Tmw'; return dt.toLocaleDateString(undefined,{weekday:'short'}); }
function weekStrip(s,rows){
  var h='<div class="weekstrip">';
  rows.forEach(function(r){ var rt=r.rating; h+='<div class="wcell"><div class="wd">'+dnameShort(r.date)+'</div>'+
    '<div class="wbar" style="background:'+rt.col+'" title="'+rt.label+'"></div>'+
    '<div class="wv">'+(s.sheltered?'—':fmt(r.h,1)+'m')+'</div>'+
    '<div class="wv2">'+fmt(r.wind,0)+'k</div></div>'; });
  return h+'</div>';
}
var charts={};
var ICON={
 wave:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c-.8-4-4.6-6.3-8.4-4.6C9.3 8.8 8 12.4 9.2 15.4c.9 2.2 3.4 3.2 5.4 2 1.5-.9 1.9-2.9.8-4.3"/><path d="M2 18c2.6 0 3.7-1 4.8-2.8"/></svg>',
 wind:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1b6ca8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h14a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>',
 temp:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/></svg>'
};
function destroyCharts(){ for(var k in charts){ try{charts[k].destroy();}catch(e){} } charts={}; }
function hLabels(times){ return times.map(function(t){ var d=new Date(t); var hh=d.getHours(); var ap=hh<12?'a':'p'; var h12=hh%12; if(h12===0)h12=12; return d.getDate()+'/'+(d.getMonth()+1)+' '+h12+ap; }); }
function fromToday(times,vals){ var t=new Date(); t.setHours(0,0,0,0); var end=new Date(t.getTime()+3*86400000); var L=[],V=[]; for(var i=0;i<times.length;i++){ var d=new Date(times[i]); if(d>=t&&d<end){ L.push(times[i]); V.push(vals?vals[i]:null);} } return {L:L,V:V}; }
function baseOpts(){ return {responsive:true,maintainAspectRatio:false,layout:{padding:{bottom:18}},interaction:{mode:'index',intersect:false},
  plugins:{legend:{display:false},tooltip:{callbacks:{title:function(items){ var c=items[0].chart,t=c.$times?c.$times[items[0].dataIndex]:null; if(!t)return ''; var d=new Date(t); return d.toLocaleDateString(undefined,{weekday:'short'})+' '+d.toLocaleTimeString(undefined,{hour:'numeric'}); }}}},
  scales:{x:{ticks:{autoSkip:false,maxRotation:0,font:{size:9},callback:function(v,i){ var t=this.chart.$times; if(!t||!t[i])return ''; var d=new Date(t[i]); if(d.getHours()%3!==0)return ''; var h=d.getHours(),ap=h<12?'a':'p',h12=h%12; if(h12===0)h12=12; return h12+ap; }},grid:{display:false}},
          y:{ticks:{font:{size:10}},grid:{color:'#eef2f6'}}}}; }
function nearestFrac(times){ if(!times.length)return null; var n=Date.now(); for(var i=0;i<times.length-1;i++){ var a=new Date(times[i]).getTime(),b=new Date(times[i+1]).getTime(); if(n>=a&&n<=b) return i+(n-a)/(b-a); } if(n<new Date(times[0]).getTime())return 0; return times.length-1; }
var windArrows={ id:'windArrows', afterDatasetsDraw:function(chart){
  var dirs=chart.$dirs; if(!dirs||!dirs.length) return; var ctx=chart.ctx, meta=chart.getDatasetMeta(0), area=chart.chartArea;
  var step=Math.max(1,Math.round(dirs.length/12)); ctx.save(); ctx.strokeStyle='#1b6ca8'; ctx.fillStyle='#1b6ca8'; ctx.lineWidth=1.4;
  for(var i=0;i<dirs.length;i+=step){ var pt=meta.data[i]; if(!pt||dirs[i]==null) continue; var x=pt.x, y=area.top+9, rad=(dirs[i]+180)*Math.PI/180, dx=Math.sin(rad), dy=-Math.cos(rad), len=7;
    ctx.beginPath(); ctx.moveTo(x-dx*len,y-dy*len); ctx.lineTo(x+dx*len,y+dy*len); ctx.stroke();
    var tx=x+dx*len, ty=y+dy*len, bx=x+dx*(len-4), by=y+dy*(len-4), px=-dy*3, py=dx*3;
    ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(bx+px,by+py); ctx.lineTo(bx-px,by-py); ctx.closePath(); ctx.fill();
  } ctx.restore();
}};
var axisExtras={ id:'axisExtras', afterDraw:function(chart){
  var times=chart.$times; if(!times||!times.length) return; var ctx=chart.ctx, area=chart.chartArea, pts=chart.getDatasetMeta(0).data; if(!pts||!pts.length) return;
  var f=nearestFrac(times);
  if(f!=null){ var lo=Math.floor(f),hi=Math.min(lo+1,pts.length-1); var x=pts[lo].x+(f-lo)*(pts[hi].x-pts[lo].x);
    ctx.save(); ctx.strokeStyle='#d9534f'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(x,area.top); ctx.lineTo(x,area.bottom); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#d9534f'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.fillText('now',x,area.top-1); ctx.restore(); }
  var groups={}, order=[];
  for(var i=0;i<times.length;i++){ var d=new Date(times[i]); var k=d.getMonth()+'-'+d.getDate(); if(!groups[k]){ groups[k]={i0:i,i1:i,wd:d.toLocaleDateString(undefined,{weekday:'short'})}; order.push(k);} groups[k].i1=i; }
  ctx.save(); ctx.fillStyle='#5b6b7b'; ctx.font='600 11px sans-serif'; ctx.textAlign='center'; var y=chart.height-3;
  order.forEach(function(k,gi){ var g=groups[k]; if(!pts[g.i0]||!pts[g.i1])return; var xc=(pts[g.i0].x+pts[g.i1].x)/2; ctx.fillText(g.wd,xc,y);
    if(gi>0){ ctx.strokeStyle='#dce3ea'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pts[g.i0].x,area.top); ctx.lineTo(pts[g.i0].x,area.bottom); ctx.stroke(); } });
  ctx.restore();
}};
function mkLine(cid,times,data,color){ var c=document.getElementById(cid); if(!c||typeof Chart==='undefined')return; var ch=new Chart(c.getContext('2d'),{type:'line',data:{labels:times,datasets:[{data:data,borderColor:color,backgroundColor:color+'22',borderWidth:2,pointRadius:0,tension:0.3,fill:true}]},options:baseOpts(),plugins:[axisExtras]}); ch.$times=times; ch.update('none'); charts[cid]=ch; }
function buildCharts(){
  destroyCharts(); if(typeof Chart==='undefined') return;
  Object.keys(selected).forEach(function(id){
    var st=selected[id]; if(!st.expanded||!st.hourly) return; var hy=st.hourly;
    var wf=fromToday(hy.wtime,hy.wind), wd2=fromToday(hy.wtime,hy.wdir);
    (function(){ var c=document.getElementById('wind-'+id); if(c&&typeof Chart!=='undefined'){ var o=baseOpts(); o.plugins.tooltip.callbacks.afterLabel=function(ctx){ var dg=wd2.V[ctx.dataIndex]; return (dg==null)?'':('from '+compass(dg)+' ('+Math.round(dg)+'°)'); };
      var ch=new Chart(c.getContext('2d'),{type:'line',data:{labels:wf.L,datasets:[{data:wf.V,borderColor:'#1b6ca8',backgroundColor:'#1b6ca822',borderWidth:2,pointRadius:0,tension:0.3,fill:true}]},options:o,plugins:[windArrows,axisExtras]});
      ch.$dirs=wd2.V; ch.$times=wf.L; ch.update('none'); charts['wind-'+id]=ch; } })();
    var tf=fromToday(hy.mtime,hy.tide); mkLine('tide-'+id, tf.L, tf.V, '#6a9bcc');
    var sf=fromToday(hy.mtime,hy.swellH), pf=fromToday(hy.mtime,hy.swellP);
    var c=document.getElementById('swell-'+id);
    if(c){ var o=baseOpts();
      o.scales.y={position:'left',ticks:{font:{size:10}},grid:{color:'#eef2f6'},title:{display:true,text:'m',font:{size:10}}};
      o.scales.y1={position:'right',ticks:{font:{size:10}},grid:{display:false},title:{display:true,text:'s',font:{size:10}}};
      o.plugins.legend={display:true,labels:{boxWidth:10,font:{size:10}}};
      var ch2=new Chart(c.getContext('2d'),{type:'line',data:{labels:sf.L,datasets:[
        {label:'Swell (m)',data:sf.V,yAxisID:'y',borderColor:'#2e7d6b',backgroundColor:'#2e7d6b22',borderWidth:2,pointRadius:0,tension:0.3,fill:true},
        {label:'Period (s)',data:pf.V,yAxisID:'y1',borderColor:'#d97757',borderWidth:2,pointRadius:0,tension:0.3}
      ]},options:o,plugins:[axisExtras]});
      ch2.$times=sf.L; ch2.update('none'); charts['swell-'+id]=ch2; }
  });
}

/* ---- map ---- */
var map, markers={};
function dotIcon(col){
  return L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:'+col+';border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',iconSize:[18,18],iconAnchor:[9,9],popupAnchor:[0,-10]});
}
function initMap(){
  map=L.map('map',{scrollWheelZoom:true,maxBounds:[[-44.2,139.5],[-33.8,150.8]],maxBoundsViscosity:1.0,minZoom:6}).setView([-38.75,145.35],7);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution:'Imagery &copy; Esri, Maxar, Earthstar Geographics',maxZoom:19}).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:19,opacity:0.9}).addTo(map);
  try{
    var sst=L.tileLayer.wms('https://coastwatch.pfeg.noaa.gov/erddap/wms/jplMURSST41/request?',
      {layers:'jplMURSST41:analysed_sst',format:'image/png',transparent:true,version:'1.3.0',opacity:0.55,attribution:'SST: NOAA CoastWatch'});
    L.control.layers(null,{'SST overlay (NOAA)':sst},{collapsed:false}).addTo(map);
  }catch(e){}
  /* markers are added dynamically as the user picks locations */
}

/* ---- Custom wind / swell / wave map (replaces the Windy embed) ----
   Samples a lattice of points over the dive coast from Open-Meteo, converts each
   magnitude+direction to U/V components, and animates particles with leaflet-velocity.
   Three switchable fields (Wind, Swell, Waves); only the active one is on the map. */
// Sampling grid runs wide (W of SA to the Tasman) so the particle field reaches the
// map's left/right edges; the visible/pannable area is locked to WM_BOUNDS below.
var WINDMAP={lonMin:132.0, lonMax:159.0, latMin:-42.9, latMax:-33.0, step:1.5};
var WM_BOUNDS=[[-41.7,140.6],[-34.0,150.4]]; // lock: Victoria + northern Tasmania
var WM_HOME=[-38.10,144.83], WM_HOME_ZOOM=8; // default view: centred on Port Phillip Bay
var DIVE_SCORE={Amazing:5, Good:4, Marginal:2, Poor:1};
var FIELDS={
  wind:{label:'Wind', unit:'km/h', maxVelocity:65, velocityScale:0.0035, spreadHi:8, src:'GFS · ECMWF',
        colorScale:['#4a7fb5','#5cc6c9','#7ed957','#f4e04d','#f0a93b','#e8553a','#b23aa8'],
        legend:['0','15','30','45','60+'],
        api:'weather', mag:'wind_speed_10m', dir:'wind_direction_10m'},
  swell:{label:'Swell', unit:'m', maxVelocity:4, velocityScale:0.03, spreadHi:0.6, src:'gwam · Météo-France',
         colorScale:['#3b6fb0','#4aa9d8','#5cc6a8','#a8d96b','#f4d24d','#f0923b'],
         legend:['0','1','2','3','4+'],
         api:'marine', mag:'swell_wave_height', dir:'swell_wave_direction'},
  waves:{label:'Waves', unit:'m', maxVelocity:5, velocityScale:0.025, spreadHi:0.7, src:'gwam · Météo-France',
         colorScale:['#2c7fb8','#41b6c4','#7fcdbb','#c7e9b4','#f4e04d','#f0a93b','#e8553a'],
         legend:['0','1','2','3','4','5+'],
         api:'marine', mag:'wave_height', dir:'wave_direction'}};
// each field is averaged across a couple of forecast models (a multi-source ensemble).
// kept to 2 models + a coarse grid to stay within Open-Meteo's free daily call budget.
var WIND_MODELS=['gfs_seamless','ecmwf_ifs025'];        // NOAA + ECMWF
var MARINE_MODELS=['gwam','meteofrance_wave'];          // DWD + Meteo-France
var windMap, wmLayers={}, wmColorLayers={}, wmSpreadLayers={}, wmData={}, wmGridCache=null, wmActive='wind', wmReady=false, wmShown=false, wmLandMask=null;
// time slider: raw per-model hourly data is fetched once, then scrubbed client-side
var wmRaw={}, wmTimes=[], wmStep=0, wmCurHour=0, wmStepHours=1, wmStepCount=1, wmBuiltHour={}, wmStepTimer=null;
function wmGrid(){
  var W=WINDMAP, nx=Math.round((W.lonMax-W.lonMin)/W.step)+1, ny=Math.round((W.latMax-W.latMin)/W.step)+1, pts=[];
  for(var r=0;r<ny;r++){ var lat=+(W.latMax-r*W.step).toFixed(4); for(var c=0;c<nx;c++){ pts.push([lat, +(W.lonMin+c*W.step).toFixed(4)]); } }
  return {nx:nx, ny:ny, pts:pts};
}
function wmAsArr(x){ return Array.isArray(x)?x:[x]; }
function wmJson(r){ return r.json(); }
function wmNote(msg){ if(windMap) L.popup({closeButton:true,autoPan:true,className:'wm-popup'}).setLatLng(windMap.getCenter()).setContent('<div class="wm-pop">'+msg+'</div>').openOn(windMap); }
function initWindMap(){
  if(!document.getElementById('windmap')) return;
  windMap=L.map('windmap',{scrollWheelZoom:true,maxBounds:WM_BOUNDS,maxBoundsViscosity:1.0,minZoom:6,maxZoom:9}).setView(WM_HOME, WM_HOME_ZOOM);
  // flat land/ocean canvas (no satellite): land reads as grey, ocean as pale grey, so for the
  // marine fields only the water gets colour-coded and land stays neutral underneath
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {attribution:'Basemap &copy; Esri; Wind/wave data: Open-Meteo',maxZoom:16}).addTo(windMap);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:19,opacity:0.9}).addTo(windMap).setZIndex(650);
  // land geography over the colour field: multiply leaves the (near-white) ocean colours untouched
  // but greys the land, so coastlines/landforms show through for orientation (used for Wind)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:16, opacity:1, className:'wm-landshade'}).addTo(windMap).setZIndex(300);
  // opaque grey land mask (transparent over ocean) shown only for Swell/Waves, so the colour can be
  // extended to the coastline and land stays clean. Toggled per field in setWmField.
  wmLandMask=L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
    {layers:'OSM_Land_Mask', format:'image/png', transparent:true, version:'1.3.0', opacity:0, className:'wm-landmask', attribution:''});
  wmLandMask.addTo(windMap).setZIndex(400);
  L.control.scale({metric:true, imperial:false, position:'bottomright'}).addTo(windMap);
  windMap.on('click', function(e){ wmShowReadout(e.latlng); openWmForecast(e.latlng); wmCenterSelected(e.latlng); });
  renderWmLegend();
  // data is fetched lazily the first time the Wind map tab is opened (see showTab)
}
function loadWindFields(){
  if(!windMap) return;
  if(typeof L.velocityLayer!=='function'){ wmNote('Wind animation couldn’t load — check your connection and Reload.'); return; }
  var g=wmGrid(); wmGridCache=g;
  var lats=[], lons=[]; g.pts.forEach(function(p){ lats.push(p[0]); lons.push(p[1]); });
  var ll='latitude='+lats.join(',')+'&longitude='+lons.join(',');
  function getJson(url){ return fetch(url).then(wmJson).catch(function(){ return null; }); }
  // one request per API, both models in it (hourly + models=); 7 forecast days stays in the cheap call tier
  var wUrl=WEATHER+'?'+ll+'&hourly=wind_speed_10m,wind_direction_10m&models='+WIND_MODELS.join(',')+'&forecast_days=7&timezone='+TZ;
  var mUrl=MARINE+'?'+ll+'&hourly=wave_height,wave_direction,swell_wave_height,swell_wave_direction&models='+MARINE_MODELS.join(',')+'&forecast_days=7&timezone='+TZ;
  Promise.all([getJson(wUrl), getJson(mUrl)]).then(function(res){
    var wArr=res[0]&&wmAsArr(res[0]), mArr=res[1]&&wmAsArr(res[1]);
    if(!wArr||!wArr.length||!wArr[0].hourly){ wmNote('Couldn’t load the wind field — try again later.'); return; }
    wmRaw.wind = buildHourly(wArr, WIND_MODELS, 'wind_speed_10m', 'wind_direction_10m');
    if(mArr && mArr.length && mArr[0].hourly){
      wmRaw.waves = buildHourly(mArr, MARINE_MODELS, 'wave_height', 'wave_direction');
      wmRaw.swell = buildHourly(mArr, MARINE_MODELS, 'swell_wave_height', 'swell_wave_direction');
    } else { wmRaw.waves=null; wmRaw.swell=null; }
    wmTimes = wArr[0].hourly.time || [];
    wmInitSlider();
    Object.keys(FIELDS).forEach(function(k){ if(wmRaw[k]) wmRebuildField(k); });
    wmReady=true; setWmField(wmActive, true);
  }).catch(function(){ wmNote('Couldn’t load the wind field — try again later.'); });
}
// reshape a multi-model hourly response into [model][cell]{mag:[hourly], dir:[hourly]}
function buildHourly(arr, models, magKey, dirKey){
  return models.map(function(m){
    return arr.map(function(el){
      var h=(el&&el.hourly)||{};
      return { mag: h[magKey+'_'+m]||[], dir: h[dirKey+'_'+m]||[] };
    });
  });
}
// per-model {mag,dir} samples for one timestep, ready for averageModels()
function modelsAtStep(key, hourIdx){
  return (wmRaw[key]||[]).map(function(modelCells){
    return modelCells.map(function(cell){ return {mag: cell.mag[hourIdx], dir: cell.dir[hourIdx]}; });
  });
}
// (re)build one field's averaged data + layers at the currently selected hour
function wmRebuildField(key){
  var g=wmGridCache; if(!g||!wmRaw[key]) return;
  wmData[key]=averageModels(modelsAtStep(key, wmCurHour));
  var d=toVelocityData(wmData[key], g.nx, g.ny);
  if(wmLayers[key]) wmLayers[key].setData(d); else wmLayers[key]=makeVelocityLayer(key, d);
  var url=buildFieldImage(key), bounds=wmFieldBounds();
  if(url){
    if(wmColorLayers[key]){ wmColorLayers[key].setBounds(L.latLngBounds(bounds)); wmColorLayers[key].setUrl(url); }
    else { wmColorLayers[key]=L.imageOverlay(url, bounds, {opacity:1, pane:'tilePane', interactive:false}); wmColorLayers[key].setZIndex(200); }
  }
  var wasOn = wmSpreadLayers[key] && windMap.hasLayer(wmSpreadLayers[key]);
  if(wasOn) windMap.removeLayer(wmSpreadLayers[key]);
  wmSpreadLayers[key]=buildSpreadLayer(key);
  if(wasOn && wmSpreadLayers[key]) wmSpreadLayers[key].addTo(windMap);
  wmBuiltHour[key]=wmCurHour;
}
function wmInitSlider(){
  var n=wmTimes.length; if(!n) return;
  wmStepCount=Math.floor((n-1)/wmStepHours)+1;
  var now=Date.now(), best=0, bd=Infinity;
  for(var s=0;s<wmStepCount;s++){ var t=new Date(wmTimes[s*wmStepHours]).getTime(); var dd=Math.abs(t-now); if(dd<bd){ bd=dd; best=s; } }
  wmStep=best; wmCurHour=best*wmStepHours;
  var sl=document.getElementById('wmTime'); if(sl){ sl.min=0; sl.max=wmStepCount-1; sl.value=wmStep; }
  wmBuildDayLabels();
  updateWmTimeLabel();
}
// a label per forecast day under the slider, each cell spanning that day's 24h
function wmBuildDayLabels(){
  var el=document.getElementById('wmTimeDays'); if(!el||!wmTimes.length) return;
  var nDays=Math.ceil(wmTimes.length/24), html='', today=new Date(); today.setHours(0,0,0,0);
  for(var d=0;d<nDays;d++){
    var dt=new Date(wmTimes[Math.min(d*24, wmTimes.length-1)]); var dd=new Date(dt); dd.setHours(0,0,0,0);
    var diff=Math.round((dd-today)/86400000);
    var lbl = diff===0 ? 'Today' : (diff===1 ? 'Tmrw' : dt.toLocaleDateString(undefined,{weekday:'short'})+' '+dt.getDate());
    html+='<span class="wm-day">'+lbl+'</span>';
  }
  el.innerHTML=html;
}
function wmSetStep(v){
  wmStep=+v; wmCurHour=Math.min(wmTimes.length-1, wmStep*wmStepHours);
  updateWmTimeLabel();
  clearTimeout(wmStepTimer);
  wmStepTimer=setTimeout(function(){ if(wmReady) wmRebuildField(wmActive); }, 50);
}
function wmJumpNow(){ wmInitSlider(); if(wmReady) wmRebuildField(wmActive); }
function updateWmTimeLabel(){ var el=document.getElementById('wmTimeLabel'); if(el) el.textContent=wmStepLabel(wmCurHour); }
function wmStepLabel(hourIdx){
  var t=wmTimes[hourIdx]; if(!t) return '—';
  var d=new Date(t), today=new Date(); today.setHours(0,0,0,0);
  var dd=new Date(d); dd.setHours(0,0,0,0);
  var diff=Math.round((dd-today)/86400000);
  var day = diff===0?'Today':(diff===1?'Tomorrow':d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'}));
  var h=d.getHours(), ap=h<12?'am':'pm', h12=h%12; if(h12===0) h12=12;
  return day+' · '+h12+' '+ap;
}
// average several models per cell on the U/V vectors (handles direction wrap-around),
// and measure disagreement as the RMS vector spread between models.
function averageModels(modelLists){
  var valid=modelLists.filter(function(a){ return a && a.length; });
  var ncells=valid.length ? valid[0].length : 0, out=new Array(ncells), i, m, k;
  for(i=0;i<ncells;i++){
    var us=[], vs=[];
    for(m=0;m<valid.length;m++){
      var s=valid[m][i]; if(!s) continue;
      var mag=s.mag, dir=s.dir;
      if(mag==null||dir==null||isNaN(mag)||isNaN(dir)) continue;
      var rad=dir*Math.PI/180; us.push(-mag*Math.sin(rad)); vs.push(-mag*Math.cos(rad));
    }
    var n=us.length;
    if(!n){ out[i]={u:0,v:0,mag:null,dir:null,n:0,spread:0}; continue; }
    var ub=0,vb=0; for(k=0;k<n;k++){ ub+=us[k]; vb+=vs[k]; } ub/=n; vb/=n;
    var sd=0; for(k=0;k<n;k++){ var du=us[k]-ub, dv=vs[k]-vb; sd+=du*du+dv*dv; }
    out[i]={u:ub, v:vb, mag:Math.sqrt(ub*ub+vb*vb), dir:(Math.atan2(-ub,-vb)*180/Math.PI+360)%360, n:n, spread:Math.sqrt(sd/n)};
  }
  return out;
}
// subtle hollow rings at cells where the models disagree (spread over the field's threshold)
function buildSpreadLayer(key){
  var g=wmGridCache, data=wmData[key], f=FIELDS[key]; if(!g||!data) return null;
  var hi=f.spreadHi||1, grp=L.layerGroup();
  for(var r=0;r<g.ny;r++){ for(var c=0;c<g.nx;c++){
    var i=r*g.nx+c, cell=data[i];
    if(!cell || cell.mag==null || cell.n<2 || cell.spread<hi) continue;
    var rad=Math.min(9, 4+(cell.spread/hi-1)*4);
    L.circleMarker(g.pts[i],{radius:rad,color:'#ffffff',weight:1.4,opacity:0.75,fillColor:'#0d1b2a',fillOpacity:0.12,interactive:false}).addTo(grp);
  } }
  return grp;
}
function buildField(arr, magKey, dirKey){
  return arr.map(function(el){
    var c=(el&&el.current)?el.current:((el&&el.hourly)?{}:{});
    var m=c[magKey], d=c[dirKey];
    if(m==null && el&&el.hourly&&el.hourly[magKey]&&el.hourly[magKey].length){ m=el.hourly[magKey][0]; d=el.hourly[dirKey]?el.hourly[dirKey][0]:null; }
    return {mag:m, dir:d};
  });
}
// averaged U/V components per cell straight into the velocity grid (null cells -> 0, no particle).
function toVelocityData(cells, nx, ny){
  var W=WINDMAP, u=[], v=[], i;
  for(i=0;i<cells.length;i++){ var c=cells[i]||{}; u.push(c.u||0); v.push(c.v||0); }
  var la2=+(W.latMax-(ny-1)*W.step).toFixed(4), lo2=+(W.lonMin+(nx-1)*W.step).toFixed(4);
  function rec(num, data){ return {header:{parameterCategory:2, parameterNumber:num, parameterUnit:'m.s-1',
    nx:nx, ny:ny, lo1:W.lonMin, la1:W.latMax, lo2:lo2, la2:la2, dx:W.step, dy:W.step,
    refTime:new Date().toISOString(), forecastTime:0}, data:data}; }
  return [rec(2,u), rec(3,v)]; // 2 = U component, 3 = V component
}
function makeVelocityLayer(key, data){
  var f=FIELDS[key];
  return L.velocityLayer({
    displayValues:false, data:data, maxVelocity:f.maxVelocity, velocityScale:f.velocityScale,
    colorScale:f.colorScale, particleAge:90, lineWidth:1.4, particleMultiplier:1/600, frameRate:18
  });
}
// interpolate a hex colorScale at t in [0,1] -> [r,g,b]
function colorAt(scale, t){
  if(t<0) t=0; if(t>1) t=1;
  var n=scale.length-1, f=t*n, i=Math.floor(f), frac=f-i;
  if(i>=n) return hexToRgb(scale[n]);
  var a=hexToRgb(scale[i]), b=hexToRgb(scale[i+1]);
  return [Math.round(a[0]+(b[0]-a[0])*frac), Math.round(a[1]+(b[1]-a[1])*frac), Math.round(a[2]+(b[2]-a[2])*frac)];
}
// bounds expanded by a 1-cell transparent ring + half a cell, so the padded image's
// data pixels still centre on the sample points and the field fades out at the edges.
function wmFieldBounds(){
  var W=WINDMAP, g=wmGridCache, hb=W.step*1.5;
  var la2=W.latMax-(g.ny-1)*W.step, lo2=W.lonMin+(g.nx-1)*W.step;
  return [[W.latMax+hb, W.lonMin-hb],[la2-hb, lo2+hb]];
}
// paint an (nx+2)-by-(ny+2) image coloured by magnitude, with a transparent border ring
// and transparent null cells; the browser smooths it across the bounds, giving a
// Windy-style shaded field that feathers out at the edges, under the particles.
function buildFieldImage(key){
  var f=FIELDS[key], g=wmGridCache, data=wmData[key]; if(!g||!data) return null;
  var mags=new Array(data.length), i;
  for(i=0;i<data.length;i++){ var d=data[i]; mags[i]=(d&&d.mag!=null&&!isNaN(d.mag))?d.mag:null; }
  // marine: extend colour over null (nearshore/land) cells so it reaches the coast; land is hidden by the mask
  if(f.api==='marine') mags=fillNulls(mags, g.nx, g.ny);
  var w=g.nx+2, h=g.ny+2;
  var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  var ctx=cv.getContext('2d'), im=ctx.createImageData(w, h), px=im.data;
  for(var r=0;r<g.ny;r++){ for(var c=0;c<g.nx;c++){
    var m=mags[r*g.nx+c]; if(m==null) continue;
    var rgb=colorAt(f.colorScale, m/f.maxVelocity), o=((r+1)*w+(c+1))*4;
    px[o]=rgb[0]; px[o+1]=rgb[1]; px[o+2]=rgb[2]; px[o+3]=255;
  } }
  ctx.putImageData(im, 0, 0);
  return cv.toDataURL('image/png');
}
// fill null grid cells with the nearest valid cell's value (so a sparse field reaches the coast)
function fillNulls(arr, nx, ny){
  var out=arr.slice(), valid=[], i;
  for(i=0;i<arr.length;i++) if(arr[i]!=null) valid.push(i);
  if(!valid.length) return out;
  for(i=0;i<arr.length;i++){
    if(out[i]!=null) continue;
    var r=Math.floor(i/nx), c=i%nx, best=valid[0], bd=Infinity;
    for(var k=0;k<valid.length;k++){ var j=valid[k], dr=Math.floor(j/nx)-r, dc=(j%nx)-c, d=dr*dr+dc*dc; if(d<bd){ bd=d; best=j; } }
    out[i]=arr[best];
  }
  return out;
}
function setWmField(key, force){
  if(!FIELDS[key]) return;
  wmActive=key;
  Object.keys(FIELDS).forEach(function(k){
    var b=document.getElementById('wmtab-'+k); if(b) b.classList.toggle('active', k===key);
    if(k!==key){
      if(wmLayers[k] && windMap.hasLayer(wmLayers[k])) windMap.removeLayer(wmLayers[k]);
      if(wmColorLayers[k] && windMap.hasLayer(wmColorLayers[k])) windMap.removeLayer(wmColorLayers[k]);
      if(wmSpreadLayers[k] && windMap.hasLayer(wmSpreadLayers[k])) windMap.removeLayer(wmSpreadLayers[k]);
    }
  });
  if(wmReady){
    if(wmRaw[key] && wmBuiltHour[key]!==wmCurHour) wmRebuildField(key); // refresh if the slider moved while another field was shown
    if(wmColorLayers[key] && !windMap.hasLayer(wmColorLayers[key])){ wmColorLayers[key].addTo(windMap); wmColorLayers[key].setZIndex(200); }
    if(wmLayers[key] && !windMap.hasLayer(wmLayers[key])) wmLayers[key].addTo(windMap);
    if(wmSpreadLayers[key] && !windMap.hasLayer(wmSpreadLayers[key])) wmSpreadLayers[key].addTo(windMap);
  }
  if(wmLandMask) wmLandMask.setOpacity(FIELDS[key].api==='marine' ? 1 : 0); // mask land for Swell/Waves only
  renderWmLegend();
}
function renderWmLegend(){
  var el=document.getElementById('wmlegend'); if(!el) return; var f=FIELDS[wmActive];
  var grad='linear-gradient(90deg,'+f.colorScale.join(',')+')';
  var ticks=f.legend.map(function(t){ return '<span>'+t+'</span>'; }).join('');
  el.innerHTML='<div class="wm-leg-label">'+f.label+' ('+f.unit+')</div>'+
    '<div class="wm-leg-bar" style="background:'+grad+'"></div>'+
    '<div class="wm-leg-ticks">'+ticks+'</div>'+
    '<div class="wm-leg-note"><span class="wm-leg-ring"></span> models disagree &middot; avg of '+f.src+'</div>';
}
function wmNearestIdx(ll){
  var g=wmGridCache; if(!g) return -1; var W=WINDMAP;
  var c=Math.round((ll.lng-W.lonMin)/W.step), r=Math.round((W.latMax-ll.lat)/W.step);
  c=Math.max(0,Math.min(g.nx-1,c)); r=Math.max(0,Math.min(g.ny-1,r));
  return r*g.nx+c;
}
var wmSelDot=null;
function wmDotIcon(){ return L.divIcon({className:'wm-seldot-wrap',html:'<span class="wm-seldot"></span>',iconSize:[24,24],iconAnchor:[12,12]}); }
// drop/move the selection dot at the clicked point (the values live in the forecast panel)
function wmShowReadout(ll){
  if(!wmReady) return;
  if(!wmSelDot) wmSelDot=L.marker(ll,{icon:wmDotIcon(),interactive:false,keyboard:false,zIndexOffset:1000}).addTo(windMap);
  else wmSelDot.setLatLng(ll);
}
// nearest known dive site -> borrow its onshore bearing so the off-spot dive rating is sensible
function nearestSpot(lat,lon){
  var best=null, bd=1e9;
  for(var id in SPOTS){ var s=SPOTS[id], dx=s.lat-lat, dy=s.lon-lon, d=dx*dx+dy*dy; if(d<bd){ bd=d; best=s; } }
  return best;
}
// WMO weather code -> glyph
function weatherIcon(c){
  if(c==null||isNaN(c)) return '·';
  if(c===0) return '☀️'; if(c<=2) return '🌤️'; if(c===3) return '☁️';
  if(c<=48) return '🌫️'; if(c<=57) return '🌧️'; if(c<=67) return '🌧️';
  if(c<=77) return '🌨️'; if(c<=82) return '🌦️'; if(c<=86) return '🌨️'; return '⛈️';
}
function fetchPointForecast(lat,lon){
  var w=WEATHER+'?latitude='+lat+'&longitude='+lon+'&hourly=weather_code,wind_speed_10m,wind_direction_10m&timezone='+TZ+'&forecast_days=3';
  var m=MARINE+'?latitude='+lat+'&longitude='+lon+'&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period,sea_level_height_msl&timezone='+TZ+'&forecast_days=3';
  return Promise.all([fetch(w).then(wmJson), fetch(m).then(wmJson)]);
}
var wmfReq=0;
function openWmForecast(ll){
  var box=document.getElementById('wmforecast'); if(!box) return;
  box.hidden=false;
  document.getElementById('wmfName').textContent='Loading…';
  document.getElementById('wmfCoord').textContent=ll.lat.toFixed(3)+', '+ll.lng.toFixed(3)+' · 48-hour outlook, 3-hourly';
  document.getElementById('wmfBody').innerHTML='<div class="pad" style="padding:14px;color:var(--muted);font-size:13px">Loading point forecast…</div>';
  var rid=++wmfReq;
  jsonp('https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat='+ll.lat+'&lon='+ll.lng, function(d){
    if(rid!==wmfReq) return; var nm=null;
    if(d){ var a=d.address||{}; nm=a.hamlet||a.village||a.town||a.suburb||a.city||a.county||a.state||null; }
    var e=document.getElementById('wmfName'); if(e) e.textContent=nm||'Offshore Victoria';
  }, 'json_callback');
  fetchPointForecast(ll.lat, ll.lng).then(function(res){
    if(rid!==wmfReq) return; renderWmForecast(ll, res[0], res[1]);
  }).catch(function(){
    if(rid!==wmfReq) return;
    document.getElementById('wmfBody').innerHTML='<div class="pad" style="padding:14px;color:var(--muted);font-size:13px">Couldn’t load the forecast for this point — try another cell.</div>';
  });
}
function closeWmForecast(){ var b=document.getElementById('wmforecast'); if(b) b.hidden=true; wmfReq++; destroyWmCharts(); wmRestoreLock(); }
// pan so the clicked point rises to the centre of the area above the forecast panel,
// keeping it (and its popup) clear of the table. Relaxes the region lock for the pan.
function wmCenterSelected(ll){
  if(!windMap) return;
  var size=windMap.getSize();
  var panelFootprint=524;                 // forecast panel: ~460px (table + 2 charts) + 62px bottom offset
  var desiredY=Math.max(50,(size.y-panelFootprint)/2);
  var z=windMap.getZoom();
  windMap.setMaxBounds(null);             // relax the lock so the centring pan isn't clamped back
  var ptPx=windMap.project(ll,z);
  var newCenter=windMap.unproject(ptPx.add(size.divideBy(2)).subtract(L.point(size.x/2,desiredY)),z);
  windMap.panTo(newCenter,{animate:true});
}
// re-apply the Victoria + N Tasmania lock and snap the view back to it
function wmRestoreLock(){ if(windMap){ windMap.setMaxBounds(WM_BOUNDS); windMap.panInsideBounds(WM_BOUNDS,{animate:true}); } }
function wmHourCell(d, showDay){
  var h=d.getHours(), ap=h<12?'a':'p', h12=h%12; if(h12===0) h12=12;
  var day=showDay?('<span class="wmf-d">'+d.toLocaleDateString(undefined,{weekday:'short'})+'</span>'):'';
  return day+h12+ap;
}
// forecast-panel charts live in their own registry so they don't collide with the Conditions tab's
var wmFcCharts={};
function destroyWmCharts(){ for(var k in wmFcCharts){ try{wmFcCharts[k].destroy();}catch(e){} } wmFcCharts={}; }
function hourLabel(t){ var d=new Date(t), h=d.getHours(), ap=h<12?'a':'p', h12=h%12; if(h12===0) h12=12; return h12+ap; }
// a colour-coded arrow (colour = speed on the wind scale, pointing the way the wind blows) + the speed
function windArrowCell(speed, dir){
  if(speed==null||isNaN(speed)) return '<td>—</td>';
  var rgb=colorAt(FIELDS.wind.colorScale, speed/FIELDS.wind.maxVelocity), col='rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
  var rot=(dir!=null&&!isNaN(dir))?(dir+180)%360:0; // met dir is "from"; arrow points downwind
  return '<td><div class="wmf-windcell">'+
    '<svg class="wmf-arrow" viewBox="0 0 24 24" style="transform:rotate('+rot+'deg);color:'+col+'">'+
    '<path d="M12 21 V4 M6 10 L12 3 L18 10" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
    '<span class="wmf-ws">'+fmt(speed,0)+'</span></div></td>';
}
// local maxima/minima of the tide series -> labelled high/low points
function tidePeaks(times, vals){
  var peaks=[];
  for(var i=1;i<vals.length-1;i++){
    if(vals[i]==null||vals[i-1]==null||vals[i+1]==null) continue;
    if(vals[i]>vals[i-1] && vals[i]>=vals[i+1]) peaks.push({idx:i,type:'H',time:hourLabel(times[i])});
    else if(vals[i]<vals[i-1] && vals[i]<=vals[i+1]) peaks.push({idx:i,type:'L',time:hourLabel(times[i])});
  }
  return peaks;
}
var wmTidePeaks={ id:'wmTidePeaks', afterDatasetsDraw:function(chart){
  var peaks=chart.$peaks; if(!peaks||!peaks.length) return; var meta=chart.getDatasetMeta(0), ctx=chart.ctx, area=chart.chartArea;
  ctx.save(); ctx.textAlign='center'; ctx.font='bold 9px sans-serif';
  peaks.forEach(function(p){ var pt=meta.data[p.idx]; if(!pt) return; var isH=p.type==='H', c=isH?'#1b6ca8':'#c47f2e';
    ctx.fillStyle=c; ctx.beginPath(); ctx.arc(pt.x,pt.y,3,0,2*Math.PI); ctx.fill();
    var ly=isH?Math.max(area.top+8,pt.y-6):Math.min(area.bottom-3,pt.y+13);
    ctx.fillText((isH?'H ':'L ')+p.time, pt.x, ly);
  });
  ctx.restore();
}};
// day separators + tiny corner max/min labels (no axis, no now line — the Time row is the shared axis)
var wmFcAxis={ id:'wmFcAxis', afterDraw:function(chart){
  var times=chart.$times; if(!times||!times.length) return; var ctx=chart.ctx, area=chart.chartArea, pts=chart.getDatasetMeta(0).data; if(!pts||!pts.length) return;
  ctx.save();
  for(var i=1;i<times.length;i++){ if(new Date(times[i-1]).getDate()!==new Date(times[i]).getDate() && pts[i]){ ctx.strokeStyle='#e2e8ee'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pts[i].x,area.top); ctx.lineTo(pts[i].x,area.bottom); ctx.stroke(); } }
  var mx=-Infinity, mn=Infinity;
  chart.data.datasets.forEach(function(ds){ ds.data.forEach(function(v){ if(v!=null&&!isNaN(v)){ if(v>mx)mx=v; if(v<mn)mn=v; } }); });
  if(mx>-Infinity){ ctx.fillStyle='#9aa6b4'; ctx.font='9px sans-serif'; ctx.textAlign='left';
    ctx.textBaseline='top'; ctx.fillText(fmt(mx,1), area.left+2, area.top+1);
    ctx.textBaseline='bottom'; ctx.fillText(fmt(mn,1), area.left+2, area.bottom-1); }
  ctx.restore();
}};
// chart options: y-axis hidden so the plot fills the canvas and lines up exactly with the table columns
function wmFcOpts(p1, p2){
  return {responsive:true,maintainAspectRatio:false,layout:{padding:{top:3,right:1,bottom:3,left:0}},interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:false},tooltip:{callbacks:{
      title:function(items){ var t=items[0].chart.$times[items[0].dataIndex], d=new Date(t); return d.toLocaleDateString(undefined,{weekday:'short'})+' '+d.toLocaleTimeString(undefined,{hour:'numeric'}); },
      afterLabel:(p1?function(ctx){ var p=(ctx.datasetIndex===0?p1:p2)[ctx.dataIndex]; return (p==null)?'':('period '+fmt(p,0)+' s'); }:undefined)
    }}},
    scales:{ x:{type:'category',offset:true,ticks:{display:false},grid:{display:false},border:{display:false}},
      y:{display:false,grace:'8%'} }};
}
function buildWmCharts(times, wh, mh, mIdx, cols){
  if(typeof Chart==='undefined') return;
  var L=[], swH=[], wvH=[], swP=[], wvP=[], tide=[];
  cols.forEach(function(k){ var t=times[k], mk=mIdx[t]; L.push(t);
    swH.push(mk!=null?mh.swell_wave_height[mk]:null); wvH.push(mk!=null?mh.wave_height[mk]:null);
    swP.push(mk!=null?mh.swell_wave_period[mk]:null); wvP.push(mk!=null?mh.wave_period[mk]:null);
    tide.push(mk!=null?mh.sea_level_height_msl[mk]:null);
  });
  var c1=document.getElementById('wmf-sw');
  if(c1){ var ch=new Chart(c1.getContext('2d'),{type:'line',data:{labels:L,datasets:[
      {label:'Swell',data:swH,borderColor:'#3b6fb0',backgroundColor:'#3b6fb022',borderWidth:2,pointRadius:0,tension:0.35,fill:true},
      {label:'Waves',data:wvH,borderColor:'#2e7d6b',borderWidth:2,pointRadius:0,tension:0.35}
    ]},options:wmFcOpts(swP,wvP),plugins:[wmFcAxis]});
    ch.$times=L; ch.update('none'); wmFcCharts['sw']=ch;
  }
  var c2=document.getElementById('wmf-tide');
  if(c2){ var ch2=new Chart(c2.getContext('2d'),{type:'line',data:{labels:L,datasets:[
      {label:'Tide',data:tide,borderColor:'#6a9bcc',backgroundColor:'#6a9bcc22',borderWidth:2,pointRadius:0,tension:0.4,fill:true}
    ]},options:wmFcOpts(),plugins:[wmFcAxis,wmTidePeaks]});
    ch2.$times=L; ch2.$peaks=tidePeaks(L,tide); ch2.update('none'); wmFcCharts['tide']=ch2;
  }
}
function renderWmForecast(ll, wRes, mRes){
  destroyWmCharts();
  var wh=wRes.hourly||{}, mh=mRes.hourly||{}, times=wh.time||[];
  if(!times.length){ document.getElementById('wmfBody').innerHTML='<div class="pad" style="padding:14px;color:var(--muted);font-size:13px">No forecast available here.</div>'; return; }
  var mIdx={}; (mh.time||[]).forEach(function(t,k){ mIdx[t]=k; });
  var now=Date.now(), start=0, i;
  for(i=0;i<times.length;i++){ if(new Date(times[i]).getTime()>=now-3600000){ start=i; break; } }
  var cols=[]; for(i=start;i<times.length && cols.length<16;i+=3){ cols.push(i); }
  var spot=nearestSpot(ll.lat, ll.lng), onshore=spot?spot.onshore:200;
  function row(label, cls, fn){ return '<tr'+(cls?' class="'+cls+'"':'')+'><th>'+label+'</th>'+cols.map(fn).join('')+'</tr>'; }
  var prevDay=null;
  var timeRow='<tr class="wmf-time"><th>Time</th>'+cols.map(function(k){
    var d=new Date(times[k]), dk=d.getDate(), show=(dk!==prevDay); prevDay=dk; return '<td>'+wmHourCell(d, show)+'</td>';
  }).join('')+'</tr>';
  var H='<div class="wmf-grid"><table class="wmf-table"><tbody>';
  H+=timeRow;
  H+=row('Dive','',function(k){
    var t=times[k], mk=mIdx[t];
    var swH=(mk!=null)?mh.swell_wave_height[mk]:null, swP=(mk!=null)?mh.swell_wave_period[mk]:null;
    var wind=wh.wind_speed_10m?wh.wind_speed_10m[k]:null, wdir=wh.wind_direction_10m?wh.wind_direction_10m[k]:null;
    var rt=classify(swH, swP, wind, wdir, onshore, null, false), sc=DIVE_SCORE[rt.label]||0;
    return '<td><span class="wmf-rate" style="background:'+rt.col+'" title="'+rt.label+'">'+sc+'</span></td>';
  });
  H+=row('Sky','',function(k){ return '<td class="wmf-sky">'+weatherIcon(wh.weather_code?wh.weather_code[k]:null)+'</td>'; });
  H+=row('Wind','wmf-windrow',function(k){ return windArrowCell(wh.wind_speed_10m?wh.wind_speed_10m[k]:null, wh.wind_direction_10m?wh.wind_direction_10m[k]:null); });
  H+='</tbody></table>';
  H+='<div class="wmf-crow"><div class="wmf-clabel"><span class="wmf-leg" style="color:#3b6fb0"><i style="background:#3b6fb0"></i>Swell</span><span class="wmf-leg" style="color:#2e7d6b"><i style="background:#2e7d6b"></i>Waves</span></div><div class="wmf-cbox"><canvas id="wmf-sw"></canvas></div></div>';
  H+='<div class="wmf-crow"><div class="wmf-clabel">Tide</div><div class="wmf-cbox"><canvas id="wmf-tide"></canvas></div></div>';
  H+='</div>';
  document.getElementById('wmfBody').innerHTML=H;
  buildWmCharts(times, wh, mh, mIdx, cols);
}

/* ---- 2-day chlorophyll composite (stacked image overlays) ---- */
var compMap, compLayers=[];
function initCompMap(){
  compMap=L.map('compmap',{scrollWheelZoom:true,maxBounds:[[-44.2,139.5],[-33.8,150.8]],maxBoundsViscosity:1.0,minZoom:6}).setView([-39.0,145.6],7);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution:'Imagery &copy; Esri, Maxar, Earthstar Geographics; Chlorophyll: NASA GIBS (VIIRS NOAA-20)',maxZoom:19}).addTo(compMap).setZIndex(100);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:19,opacity:0.9}).addTo(compMap).setZIndex(650);
  buildOceanClip();
}
// Build an ocean mask (opaque over water, transparent over land) by inverting the alpha of GIBS OSM_Land_Mask, then expose it as a CSS mask (.chlclip) so the chlorophyll is clipped to the sea and the satellite land shows through. Falls back to an opaque cream land mask if the mask can't be built (e.g. CORS blocked).
function buildOceanClip(){
  var img=new Image(); img.crossOrigin='anonymous';
  img.onload=function(){
    try{
      var cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
      var cx=cv.getContext('2d'); cx.drawImage(img,0,0);
      var id=cx.getImageData(0,0,cv.width,cv.height), d=id.data, i;
      for(i=0;i<d.length;i+=4){ d[i]=d[i+1]=d[i+2]=255; d[i+3]=255-d[i+3]; }
      cx.putImageData(id,0,0);
      var u=cv.toDataURL('image/png'), s=document.createElement('style');
      s.textContent='.chlclip{-webkit-mask-image:url('+u+');mask-image:url('+u+');-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;}';
      document.head.appendChild(s);
    }catch(e){ compFallbackMask(); }
  };
  img.onerror=function(){ compFallbackMask(); };
  img.src='https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857&BBOX=15529069,-5496679,16786978,-4001005&WIDTH=1280&HEIGHT=1523&FORMAT=image/png&TRANSPARENT=true';
}
function compFallbackMask(){
  L.imageOverlay('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857&BBOX=15529069,-5496679,16786978,-4001005&WIDTH=2048&HEIGHT=2436&FORMAT=image/png&TRANSPARENT=true',
    [[-44.2,139.5],[-33.8,150.8]],{pane:'tilePane',className:'compmask',attribution:'',interactive:false}).addTo(compMap).setZIndex(600);
}
function loadComposite(){
  if(!compMap) return;
  compLayers.forEach(function(l){compMap.removeLayer(l);}); compLayers=[];
  // NASA GIBS VIIRS NOAA-20 chlorophyll as single images over the fixed extent (so the .chlclip CSS ocean-mask can clip them to the sea). Last few days stacked to fill cloud gaps.
  var B=[[-44.2,139.5],[-33.8,150.8]], bbox='15529069,-5496679,16786978,-4001005', offsets=[4,3,2];
  offsets.forEach(function(off,i){
    var d=new Date(Date.now()-off*864e5), ymd=d.toISOString().slice(0,10);
    var url='https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=VIIRS_NOAA20_Chlorophyll_A&CRS=EPSG:3857&BBOX='+bbox+'&WIDTH=1024&HEIGHT=1218&FORMAT=image/png&TRANSPARENT=true&TIME='+ymd;
    var lyr=L.imageOverlay(url,B,{pane:'tilePane',className:'chlclip',opacity:1,attribution:'Chlorophyll: NASA GIBS (VIIRS NOAA-20)'}).addTo(compMap);
    lyr.setZIndex(200+i); compLayers.push(lyr);
  });
  var e=document.getElementById('chl-date'); if(e) e.textContent='to '+new Date(Date.now()-2*864e5).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
}
var liveLoaded=false;
function loadLiveTab(){
  if(liveLoaded) return; liveLoaded=true;
  setSSTImages();
  var sl=document.getElementById('sstlink'); if(sl) sl.href=BASE+'jplMURSST41.graph';
  loadComposite();
  loadDataStamps();
}
// On phones, render the Ports Victoria dashboard at its desktop width and scale it down to fit, so it keeps the multi-column desktop layout instead of stacking one panel per row.
function fitLiveEmbed(){
  var c=document.querySelector('.liveframe'); if(!c) return;
  var ifr=c.querySelector('iframe'); if(!ifr) return;
  var cw=c.clientWidth;
  if(window.innerWidth>560 || cw===0){ ifr.style.width='100%'; ifr.style.height='1500px'; ifr.style.transform=''; c.style.height='820px'; return; }
  var DW=1060, CROP=820, s=cw/DW;
  ifr.style.width=DW+'px'; ifr.style.height='1500px'; ifr.style.transformOrigin='top left'; ifr.style.transform='scale('+s+')';
  c.style.height=Math.round(CROP*s)+'px';
}
window.addEventListener('resize',fitLiveEmbed);

/* ---- SST / Chl images ---- */
var BASE='https://coastwatch.pfeg.noaa.gov/erddap/griddap/';
var LAT='(-44):(-37.5)', LAT_DESC='(-37.5):(-44)', LON='(140):(151)';
var bump=0, sstMin=null, sstMax=null;
function sstURL(){
  var cb=(sstMin!=null&&sstMax!=null) ? 'Rainbow%7C%7C%7C'+sstMin+'%7C'+sstMax+'%7C' : 'Rainbow%7C%7C%7C%7C%7C';
  // transparentPng = just the data grid (no axes, margins or legend) so the map fills the full width with no white blank space on the sides.
  return BASE+'jplMURSST41.transparentPng?analysed_sst%5B(last)%5D%5B(-39.7):(-37.1)%5D%5B(140.8):(150.2)%5D&.draw=surface&.vars=longitude%7Clatitude%7Canalysed_sst&.colorBar='+cb+'&.land=over&.size=1560%7C'+(432+bump);
}
function sstLegendURL(){
  var cb=(sstMin!=null&&sstMax!=null) ? 'Rainbow%7C%7C%7C'+sstMin+'%7C'+sstMax+'%7C' : 'Rainbow%7C%7C%7C%7C%7C';
  return BASE+'jplMURSST41.png?analysed_sst%5B(last)%5D%5B(-39.7):(-37.1)%5D%5B(140.8):(150.2)%5D&.draw=surface&.vars=longitude%7Clatitude%7Canalysed_sst&.colorBar='+cb+'&.legend=Only';
}
function setSSTImages(){ wireImg('sst', sstURL()); var lg=document.getElementById('sstlegend'); if(lg) lg.src=sstLegendURL(); }
function chlURL(){return BASE+'nesdisVHNchlaDaily.png?chlor_a%5B(last)%5D%5B(0.0)%5D%5B'+LAT_DESC+'%5D%5B'+LON+'%5D&.draw=surface&.vars=longitude%7Clatitude%7Cchlor_a&.colorBar=%7C%7C%7C%7C%7C&.land=over&.size=720%7C'+(600+bump);}
function wireImg(id,url){
  var img=document.getElementById(id), ph=img.parentElement.querySelector('.ph');
  ph.style.display='block'; img.style.display='none';
  img.onload=function(){ph.style.display='none';img.style.display='block';};
  img.onerror=function(){ph.textContent='Could not load this layer — try Reload or click Open data.';};
  img.src=url;
}

/* ---- orchestration ---- */
function jsonp(url,cb,param){
  var fn='__erd_cb_'+(jsonp._n=(jsonp._n||0)+1);
  var s=document.createElement('script'); var done=false;
  function cleanup(){ try{delete window[fn];}catch(e){window[fn]=undefined;} if(s&&s.parentNode) s.parentNode.removeChild(s); }
  window[fn]=function(data){ done=true; try{cb(data);}catch(e){cb(null);} cleanup(); };
  s.onerror=function(){ if(!done){ cb(null); cleanup(); } };
  setTimeout(function(){ if(!done){ cb(null); cleanup(); } },7000);
  s.src=url+(url.indexOf('?')>=0?'&':'?')+(param||'.jsonp')+'='+fn;
  document.head.appendChild(s);
}
function fetchLastTime(ds,cb,base){
  jsonp((base||BASE)+ds+'.json?time%5B(last)%5D',function(j){
    var t=(j&&j.table&&j.table.rows&&j.table.rows[0])?j.table.rows[0][0]:null; cb(t);
  });
}
function fmtDataDate(t){ if(!t) return 'unavailable'; var d=new Date(t); return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}); }
function loadDataStamps(){
  fetchLastTime('jplMURSST41',function(t){ var e=document.getElementById('sst-date'); if(e) e.textContent=fmtDataDate(t); });
}
function reloadAll(){
  bump++;
  setSSTImages();
  document.getElementById('sstlink').href=BASE+'jplMURSST41.graph';
  document.getElementById('stamp').textContent='Updated '+new Date().toLocaleString();
  refreshSelected();
  loadComposite();
  loadDataStamps();
  if(windMap && wmShown) loadWindFields();
}
/* ---- Fish guide ---- */
var MONTH_LBL=['J','F','M','A','M','J','J','A','S','O','N','D'];
var siteSST={};
var SVG={
 snapper:'<svg viewBox="0 0 120 64"><path d="M22 34 Q34 13 62 15 Q92 17 100 34 Q92 51 62 53 Q34 55 22 34Z" fill="#e07b7b"/><path d="M99 34 L118 23 L113 34 L118 45Z" fill="#d36a6a"/><path d="M44 17 Q60 7 76 16" stroke="#d36a6a" stroke-width="4" fill="none"/><circle cx="36" cy="30" r="3" fill="#22303a"/></svg>',
 kingfish:'<svg viewBox="0 0 120 64"><path d="M12 34 Q40 20 96 28 Q106 30 112 34 Q106 38 96 40 Q40 48 12 34Z" fill="#6f97b3"/><path d="M112 34 L122 26 L116 34 L122 42Z" fill="#e6c34a"/><rect x="22" y="32" width="82" height="3.4" fill="#e6c34a" opacity="0.85"/><circle cx="22" cy="33" r="2.6" fill="#1f2d36"/></svg>',
 tuna:'<svg viewBox="0 0 120 64"><path d="M14 34 Q44 16 92 28 Q103 30 108 34 Q103 38 92 40 Q44 52 14 34Z" fill="#3f6f9e"/><path d="M108 34 Q120 23 116 34 Q120 45 108 34Z" fill="#33597f"/><path d="M58 18 L70 12 L66 23Z" fill="#33597f"/><path d="M60 50 L72 56 L66 45Z" fill="#f0c33b"/><circle cx="26" cy="32" r="3" fill="#16242f"/></svg>',
 whiting:'<svg viewBox="0 0 120 64"><path d="M14 34 Q50 24 98 31 Q106 32 110 34 Q106 36 98 37 Q50 44 14 34Z" fill="#cdb98c"/><path d="M110 34 L120 29 L116 34 L120 39Z" fill="#b8a071"/><circle cx="24" cy="33" r="2.4" fill="#3a3320"/><g fill="#9c8650"><circle cx="42" cy="33" r="1.6"/><circle cx="58" cy="33" r="1.6"/><circle cx="74" cy="33" r="1.6"/></g></svg>',
 flathead:'<svg viewBox="0 0 120 64"><path d="M30 30 Q70 28 100 33 Q108 34 112 36 Q108 38 100 39 Q70 42 40 40 L30 38Z" fill="#9a8b6a"/><path d="M8 36 L30 26 L40 31 L40 39 L30 46Z" fill="#8a7c5d"/><path d="M112 36 L120 31 L120 41Z" fill="#8a7c5d"/><circle cx="22" cy="31" r="2.2" fill="#2b2719"/><circle cx="30" cy="31" r="2.2" fill="#2b2719"/></svg>',
 squid:'<svg viewBox="0 0 120 64"><path d="M60 5 Q78 5 78 30 L74 44 Q60 50 46 44 L42 30 Q42 5 60 5Z" fill="#e0a0a8"/><path d="M42 13 L29 9 L44 22Z" fill="#cf8d96"/><path d="M78 13 L91 9 L76 22Z" fill="#cf8d96"/><g stroke="#cf8d96" stroke-width="3" fill="none" stroke-linecap="round"><path d="M50 46 Q48 58 44 62"/><path d="M57 48 Q56 60 54 63"/><path d="M64 48 Q64 60 66 63"/><path d="M70 46 Q72 58 76 62"/></g><circle cx="53" cy="29" r="3" fill="#3a2530"/><circle cx="67" cy="29" r="3" fill="#3a2530"/></svg>',
 cray:'<svg viewBox="0 0 120 64"><ellipse cx="62" cy="34" rx="26" ry="13" fill="#c0563f"/><path d="M88 26 L106 34 L88 42Z" fill="#a8472f"/><g stroke="#9b3f29" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M40 30 Q20 18 7 12"/><path d="M40 38 Q20 50 7 56"/></g><g stroke="#a8472f" stroke-width="3" stroke-linecap="round"><path d="M52 46 L48 58"/><path d="M62 47 L60 59"/><path d="M72 46 L76 58"/></g><circle cx="44" cy="30" r="2" fill="#2b1410"/></svg>'
};
var SPECIES=[
 {id:'snapper',name:'Snapper',sci:'Chrysophrys auratus',good:[10,11,12,1,2,3,4,5],peak:'Oct–Nov & Apr–May runs (water 15–19°C)',
  env:['Bay reef edges','Channels','Sand/mud'],
  spots:'Port Phillip Bay — Fawkner Beacon, Mornington, Hampton–Black Rock, Altona–Pt Wilson; Western Port.',
  tech:'Berley and bait on reef edges and channel drop-offs; best at dawn/dusk and tide change.'},
 {id:'kingfish',name:'Yellowtail Kingfish',sci:'Seriola lalandi',good:[11,12,1,2,3,4],peak:'Late Dec–Mar (inshore Oct–Apr)',
  env:['Bommies/pinnacles','Breaking reefs','Headlands'],
  spots:'Pyramid Rock, The Pinnacle (Cape Woolamai), Seal Rocks; Port Phillip kingfish reefs.',
  tech:'Live bait, jigs or stickbaits in current around bommies; fish the wash on a moving tide.'},
 {id:'tuna',name:'Southern Bluefin Tuna (schoolies)',sci:'Thunnus maccoyii',good:[2,3,4,5,6,7,8],peak:'Warmer months — schoolies push inshore; Portland run Apr–Jul',
  env:['Inshore off Barwon Heads','Open ocean / shelf','Current lines'],
  spots:'Schoolies run into Barwon Heads through the warmer months; also Portland, outside the Heads, east to the Prom.',
  tech:'Troll skirts/divers along temp breaks and bait schools. Best on glassed-out, calm days — watch for working birds.'},
 {id:'squid',name:'Southern Calamari',sci:'Sepioteuthis australis',good:[4,5,6,7,8],peak:'Apr–Aug (clear, cool water); big spawners in spring',
  env:['Seagrass meadows','Shallow reef/weed','Piers'],
  spots:'Southern Port Phillip — Lonsdale Bight, Pt Nepean, Queenscliff, St Leonards; Western Port.',
  tech:'Egi jigs over weed beds and reef in 1–6 m; dawn and dusk are prime.'},
 {id:'whiting',name:'King George Whiting',sci:'Sillaginodes punctata',good:[5,6,7,8,9],peak:'May–Sep (good all year)',
  env:['Broken ground','Sand + weed patches','Channels'],
  spots:'Southern Port Phillip Bay, Western Port, Anderson/Corner/Shallow Inlets, Portland.',
  tech:'Bait on broken ground in 3–6 m; fish the two hours after high tide, dawn/dusk.'},
 {id:'flathead',name:'Southern Sand Flathead',sci:'Platycephalus bassensis',good:[1,2,3,4,5,6,7,8,9,10,11,12],peak:'Year-round; best summer–autumn',
  env:['Sand bottom','Mud/shell grit','10–30 m'],
  spots:'Port Phillip Bay (the main fishery); coastal waters and estuaries statewide.',
  tech:'Drift baits or soft plastics across sand and shell-grit flats.'},
 {id:'cray',name:'Southern Rock Lobster',sci:'Jasus edwardsii',good:[11,12,1,2,3,4,5],peak:'Season opens ~16 Nov',
  env:['Rocky reef <5 m','Cracks & holes','Granite/basalt/limestone'],
  spots:'Coastal reef statewide — Prom granite, Phillip Island basalt, Portland limestone.',
  tech:'Dive/loop reef ledges and holes. Bag limit 2; return berried & soft-shell lobster.',
  reg:true}
];
function crayStatus(){
  var d=new Date(), md=(d.getMonth()+1)*100+d.getDate();
  if(md>=1116 || md<=531) return {t:'Open · males & females',c:'in'};
  if(md>=601 && md<=914) return {t:'Males only · females closed',c:'mid'};
  return {t:'Closed · season shut',c:'off'};
}
function monthBar(good){
  var h='<div class="mbar">';
  for(var i=1;i<=12;i++){ h+='<span class="'+(good.indexOf(i)>=0?'on':'')+'">'+MONTH_LBL[i-1]+'</span>'; }
  return h+'</div>';
}
function kingfishNote(){
  var t=kfSST;
  if(t==null) return '<div class="fnote" style="background:#eef4f9;border-color:#cfe0ee;color:#1c4a6b">Chance of fish wherever water is &gt;16&deg;C. Sighted late May off Pyramid &amp; Seal Rocks.</div>';
  if(t>16) return '<div class="fnote" style="background:#eaf6ee;border-color:#cfe8da;color:#15692f"><b>Possible now</b> &mdash; Pyramid Rock '+t.toFixed(1)+'&deg;C (&gt;16&deg;). Sighted late May off Pyramid &amp; Seal Rocks.</div>';
  return '<div class="fnote">Quiet &mdash; Pyramid Rock '+t.toFixed(1)+'&deg;C (&lt;16&deg;). They turn up once it nudges past 16&deg;; sighted late May off Pyramid &amp; Seal Rocks.</div>';
}
function renderFish(){
  var cur=new Date().getMonth()+1, h='';
  SPECIES.forEach(function(s){
    var badge;
    if(s.reg){ var cstat=crayStatus(); badge='<span class="badge '+cstat.c+'">'+cstat.t+'</span>'; }
    else { var on=s.good.indexOf(cur)>=0; badge='<span class="badge '+(on?'in':'off')+'">'+(on?'In season now':'Off-peak now')+'</span>'; }
    h+='<div class="fish"><div class="fishtop"><div class="ficon">'+(SVG[s.id]||'')+'</div>'
      +'<div><div class="fname">'+s.name+'</div><div class="fsci">'+s.sci+'</div></div>'+badge+'</div>'
      +'<div class="frow"><b>Best:</b> '+s.peak+'</div>'
      + monthBar(s.good)
      +'<div class="chips">'+s.env.map(function(e){return '<span class="chip2">'+e+'</span>';}).join('')+'</div>'
      +'<div class="frow"><b>Where:</b> '+s.spots+'</div>'
      +'<div class="frow"><b>How:</b> '+s.tech+'</div>'
      +(s.reg?'<div class="fnote">Rock lobster has a closed season and strict rules — confirm current dates, sizes and bag limits with the VFA before taking.</div>':'')
      +(s.id==='kingfish'?kingfishNote():'')
      +'</div>';
  });
  document.getElementById('fishcards').innerHTML=h;
}
/* ---- underwater geography map (CoastKit seabed-habitat data + bathymetry) ---- */
var geoMap, bathyMap, habitatLayer, bathyLayer, contourLayer, LEGEND_COLORS=null, geoInfoEl=null;
var geoPin=null, bathyPin=null;
function gmPinIcon(){ return L.divIcon({className:'gmpin',html:'<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.4 1 1 6.4 1 13c0 8.7 12 24 12 24s12-15.3 12-24C25 6.4 19.6 1 13 1z" fill="#ea4335" stroke="#ffffff" stroke-width="1.4"/><circle cx="13" cy="13" r="4.4" fill="#8b1a0e"/></svg>',iconSize:[26,38],iconAnchor:[13,37],popupAnchor:[0,-34]}); }
// Drop a single Google-Maps-style pin where the user clicks, with the coordinates. Clicking again moves it; the popup has Copy / Remove.
function dropPin(map, latlng, key){
  var prev=(key==='geo')?geoPin:bathyPin; if(prev){ try{map.removeLayer(prev);}catch(e){} }
  var m=L.marker(latlng,{icon:gmPinIcon(),keyboard:false}).addTo(map);
  m.on('click', function(){ try{map.removeLayer(m);}catch(e){} if(key==='geo')geoPin=null; else bathyPin=null; });
  if(key==='geo') geoPin=m; else bathyPin=m;
}
// Minimal ArcGIS dynamic-export layer: requests a reprojected PNG per map tile (works for services without WMS/tile cache, any source CRS)
var EsriExport=L.TileLayer.extend({
  getTileUrl:function(coords){
    var b=this._tileCoordsToBounds(coords),
        sw=L.CRS.EPSG3857.project(b.getSouthWest()),
        ne=L.CRS.EPSG3857.project(b.getNorthEast()),
        sz=this.getTileSize();
    return this.options.baseUrl+'/export?f=image&format=png32&transparent=true&dpi=96'
      +'&bbox='+[sw.x,sw.y,ne.x,ne.y].join(',')
      +'&bboxSR=3857&imageSR=3857&size='+sz.x+','+sz.y
      +'&layers=show:'+this.options.layerIds;
  }
});
function esriExport(opts){ return new EsriExport('', L.extend({tileSize:512},opts)); } // 512px tiles = ~1/4 as many on-demand export requests
var geoBasesAdded=false;
// Extent the pre-rendered base images cover — southern Port Phillip Bay (must match SW/NE in tools/prerender-geo.js).
var GEO_BASE_BOUNDS=[[-38.60,144.35],[-38.10,145.15]];
// Show a pre-rendered static image (assets/geo/*.png) instantly under a slow live layer, then drop it once the live layer has finished loading. If the image is missing it simply doesn't show — the live layer still loads.
function addGeoBase(map, file, liveLayer, opacity, z){
  if(!map||!liveLayer) return;
  var base=L.imageOverlay('assets/geo/'+file, GEO_BASE_BOUNDS, {opacity:opacity, pane:'tilePane', interactive:false});
  base.setZIndex(z); base.addTo(map);
  liveLayer.once('load', function(){ setTimeout(function(){ try{map.removeLayer(base);}catch(e){} }, 200); });
}
function initGeoMap(){
  geoMap=L.map('geomap',{scrollWheelZoom:true,maxBounds:[[-44.2,139.5],[-33.8,150.8]],maxBoundsViscosity:1.0,minZoom:6}).setView([-38.29,144.66],12);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Imagery &copy; Esri, Maxar; Habitat &copy; Seamap Australia (IMAS/UTAS); Depth &copy; DEECA',maxZoom:19}).addTo(geoMap);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.9}).addTo(geoMap).setZIndex(650);
  habitatLayer=L.tileLayer.wms('https://geoserver.imas.utas.edu.au/geoserver/seamap/wms',{layers:'SeamapAus_National_Benthic_Habitat_Layer',format:'image/png',transparent:true,version:'1.1.1',opacity:0.62,crossOrigin:true,attribution:'Seamap Australia'}).addTo(geoMap);
  habitatLayer.setZIndex(400);
  contourLayer=esriExport({baseUrl:'https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer',layerIds:'1,2,4,5,7,8,10,11,13,14,15,17,18',opacity:0.9,attribution:'Depth contours &copy; DEECA Victoria (CoastKit)'});
  contourLayer.setZIndex(500);
  contourLayer.addTo(geoMap);
  L.control.layers(null,{'Seabed habitat (Seamap Australia)':habitatLayer,'Depth contours (DEECA)':contourLayer},{collapsed:false}).addTo(geoMap);// removed coloured (DEECA 5 m)':bathyLayer},{collapsed:false}).addTo(geoMap);
  buildLegendColors();
  geoMap.on('click', geoClick);
  geoMap.on('click', function(e){ dropPin(geoMap, e.latlng, 'geo'); });
  geoInfoEl=L.DomUtil.create('div','geoinfo',geoMap.getContainer());
  geoInfoEl.innerHTML='<div class="gi-hover gi-hint">Hover the seabed to identify it &middot; click for detail</div><div class="gi-detail" hidden></div>';
  L.DomEvent.disableClickPropagation(geoInfoEl);
  var hTimer=null;
  geoMap.on('mousemove', function(ev){
    clearTimeout(hTimer); var cp=ev.containerPoint, ll=ev.latlng;
    hTimer=setTimeout(function(){
      geoQuery(ll, cp, function(raw){ var g=raw?classifyHab(raw):null, hv=geoInfoEl.querySelector('.gi-hover'); if(!hv) return; hv.className='gi-hover';
        hv.innerHTML = g ? ('<span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:'+g.col+';vertical-align:-1px;margin-right:5px"></span>Under cursor: <b>'+g.name+'</b>') : 'Under cursor: Open water';
      });
    }, 200);
  });
  loadGeoLegend();
}
var bathyInfoEl=null;
function segDist(px,py,ax,ay,bx,by){ var dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy,t=l2?((px-ax)*dx+(py-ay)*dy)/l2:0; t=t<0?0:t>1?1:t; var cx=ax+t*dx,cy=ay+t*dy; return Math.sqrt((px-cx)*(px-cx)+(py-cy)*(py-cy)); }
// Read depth at a clicked point from the DEECA contour layers (vector, via JSONP — the raster point-query is too slow). Returns each nearby contour with its distance so we can show the two nearest distinct depths (the bracket the point sits between).
function bathyDepthAt(latlng, cb){
  var P=L.CRS.EPSG3857, p=P.project(latlng), b=bathyMap.getBounds(),
      sw=P.project(b.getSouthWest()), ne=P.project(b.getNorthEast()), sz=bathyMap.getSize();
  var url='https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer/identify'
    +'?f=json&geometryType=esriGeometryPoint&sr=3857&returnGeometry=true&tolerance=200'
    +'&geometry='+Math.round(p.x)+','+Math.round(p.y)
    +'&mapExtent='+[Math.round(sw.x),Math.round(sw.y),Math.round(ne.x),Math.round(ne.y)].join(',')
    +'&imageDisplay='+sz.x+','+sz.y+',96&layers=all';
  jsonp(url,function(j){
    var arr=[], mpp=(ne.x-sw.x)/sz.x;
    if(j&&j.results){ j.results.forEach(function(r){
      var n=parseFloat((r.attributes||{}).DEPTH); if(isNaN(n)) return;
      var g=r.geometry, best=Infinity;
      if(g&&g.paths){ g.paths.forEach(function(path){ for(var i=0;i<path.length-1;i++){ var d=segDist(p.x,p.y,path[i][0],path[i][1],path[i+1][0],path[i+1][1]); if(d<best)best=d; } }); }
      arr.push({d:Math.abs(n),dist:best});
    }); }
    cb(arr, mpp);
  },'callback');
}
function initBathyMap(){
  bathyMap=L.map('bathymap',{scrollWheelZoom:true,maxBounds:[[-44.2,139.5],[-33.8,150.8]],maxBoundsViscosity:1.0,minZoom:6}).setView([-38.29,144.66],12);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Imagery &copy; Esri, Maxar; Depth &copy; DEECA Victoria (CoastKit)',maxZoom:19}).addTo(bathyMap);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.9}).addTo(bathyMap).setZIndex(650);
  bathyLayer=esriExport({baseUrl:'https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/Bathymetry/MapServer',layerIds:'10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25',opacity:0.85,attribution:'Bathymetry &copy; DEECA Victoria (CoastKit)'});
  bathyLayer.setZIndex(300); bathyLayer.addTo(bathyMap);
  var bcon=esriExport({baseUrl:'https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer',layerIds:'1,2,4,5,7,8,10,11,13,14,15,17,18',opacity:0.95,attribution:'Depth contours &copy; DEECA Victoria (CoastKit)'});
  bcon.setZIndex(500); bcon.addTo(bathyMap);
  L.control.layers(null,{'Coloured depth (DEECA 5m)':bathyLayer,'Depth contours (DEECA)':bcon},{collapsed:false}).addTo(bathyMap);
  bathyMap.on('click', function(e){ dropPin(bathyMap, e.latlng, 'bathy'); });
  bathyInfoEl=L.DomUtil.create('div','geoinfo',bathyMap.getContainer());
  bathyInfoEl.innerHTML='<div class="gi-hint">Click the map to read the depth here</div>';
  L.DomEvent.disableClickPropagation(bathyInfoEl);
  bathyMap.on('click', function(e){
    bathyInfoEl.innerHTML='<b>Depth</b> &middot; reading…';
    var done=false, to=setTimeout(function(){ if(!done){done=true; bathyInfoEl.innerHTML='<b>Depth</b><br><span class="gi-hint">server slow — try again</span>'; } },9000);
    bathyDepthAt(e.latlng, function(arr, mpp){
      if(done) return; done=true; clearTimeout(to);
      if(!arr.length){ bathyInfoEl.innerHTML='<b>Depth</b><br><span class="gi-hint">no depth contour near here</span>'; return; }
      arr.sort(function(a,b){return a.dist-b.dist;});
      var html;
      if(arr[0].dist < mpp*4){ html='&asymp; <b>'+arr[0].d+' m</b> <span class="gi-hint">(on contour)</span>'; }
      else { var ds=[]; for(var i=0;i<arr.length&&ds.length<2;i++){ if(ds.indexOf(arr[i].d)<0) ds.push(arr[i].d); } ds.sort(function(a,b){return a-b;});
        html=(ds.length<2)?('&asymp; <b>'+ds[0]+' m</b>'):('between <b>'+ds[0]+' &amp; '+ds[1]+' m</b>'); }
      bathyInfoEl.innerHTML='<b>Depth</b><br>'+html;
    });
  });
  // Defer this (below-the-fold) map's tile loading until it's scrolled into view, so the top habitat map loads first without competing for the same servers.
  if('IntersectionObserver' in window){
    var bio2=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ try{bathyMap.invalidateSize();}catch(err){} addGeoBase(bathyMap,'depth.png',bathyLayer,0.85,250); addGeoBase(bathyMap,'contours.png',bcon,0.95,255); bio2.disconnect(); } }); },{threshold:0.01});
    bio2.observe(document.getElementById('bathymap'));
  }
}
function habFromFeatures(feats){
  if(!feats||!feats.length) return null;
  var bad=['habitat map','statewide','seamap','dataset','source','survey','program','method','version','classification scheme'];
  function looksBad(v){ var lv=v.toLowerCase(); for(var i=0;i<bad.length;i++){ if(lv.indexOf(bad[i])>=0) return true; } return false; }
  var bio=['seagrass','macroalg','kelp','macrophyt','vegetation','algae','sponge','bryozoan','ascidian','filter feeder','shell','invertebrate','urchin','coral','bioturbat'];
  var sub=['reef','bedrock','boulder','rock','hard substrat','soft substrat','substrat','sand','mud','gravel','sediment','consolidat'];
  var gen=['biota'];
  function scan(words){
    for(var fi=0;fi<feats.length;fi++){ var p=feats[fi].properties||{};
      for(var k in p){ var v=p[k]; if(typeof v==='string' && v.length>1 && !looksBad(v)){ var lv=v.toLowerCase();
        for(var i=0;i<words.length;i++){ if(lv.indexOf(words[i])>=0) return v; } } } }
    return null;
  }
  return scan(bio) || scan(sub) || scan(gen);
}
function geoFeatureInfo(url,cb){
  fetch(url+'&info_format=application/json').then(function(r){return r.json();}).then(function(d){cb(d);}).catch(function(){cb(null);});
}
function hexToRgb(h){ h=(h||'').replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; if(h.length<6) return null; var n=parseInt(h.slice(0,6),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function buildLegendColors(){
  fetch('https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=application/json&layer=SeamapAus_National_Benthic_Habitat_Layer')
  .then(function(r){return r.json();}).then(function(j){
    var rules=(j&&j.Legend&&j.Legend[0]&&j.Legend[0].rules)||[]; var out=[];
    rules.forEach(function(ru){
      var t=ru.title||ru.name; if(!t) return; var col=null, sy=ru.symbolizers||[];
      for(var i=0;i<sy.length;i++){ var s=sy[i], g=s.Polygon||s.Point||s.Line||s.Raster; if(g){ col=g.fill||g.stroke||(g.graphic&&g.graphic.fill); if(col) break; } }
      var rgb=col?hexToRgb(col):null; if(rgb) out.push({rgb:rgb,title:t});
    });
    if(out.length) LEGEND_COLORS=out;
  }).catch(function(){});
}
function nearestClass(rgb){
  if(!LEGEND_COLORS) return null; var best=null,bd=1e9;
  for(var i=0;i<LEGEND_COLORS.length;i++){ var c=LEGEND_COLORS[i].rgb, dr=rgb[0]-c[0],dg=rgb[1]-c[1],db=rgb[2]-c[2], d=dr*dr+dg*dg+db*db; if(d<bd){bd=d;best=LEGEND_COLORS[i];} }
  return (bd<2600)?best.title:null;
}
function readHabitatColor(cp){
  if(!habitatLayer) return false;
  var cont=habitatLayer.getContainer?habitatLayer.getContainer():(habitatLayer._container||null); if(!cont) return false;
  var imgs=cont.getElementsByTagName('img'), mr=geoMap.getContainer().getBoundingClientRect();
  var px=mr.left+cp.x, py=mr.top+cp.y, found=false;
  for(var i=imgs.length-1;i>=0;i--){ var img=imgs[i]; if(!img.complete||!img.naturalWidth) continue; var r=img.getBoundingClientRect();
    if(px>=r.left&&px<r.right&&py>=r.top&&py<r.bottom){ found=true;
      try{ var cv=document.createElement('canvas'); cv.width=img.naturalWidth; cv.height=img.naturalHeight; var x2=cv.getContext('2d'); x2.drawImage(img,0,0);
        var sx=Math.floor((px-r.left)*(img.naturalWidth/r.width)), sy=Math.floor((py-r.top)*(img.naturalHeight/r.height));
        var d=x2.getImageData(sx,sy,1,1).data;
        if(d[3]<25) return null; return [d[0],d[1],d[2]];
      }catch(e){ return false; }
    }
  }
  return found?false:null;
}
function geoQuery(ll,cp,cb){
  var px=readHabitatColor(cp);
  if(px===null){ cb(null); return; }
  if(px && LEGEND_COLORS){ var t=nearestClass(px); if(t){ cb(t); return; } }
  serverFeatureInfo(ll,cp,cb);
}
function serverFeatureInfo(ll,cp,cb){
  var size=geoMap.getSize(), b=geoMap.getBounds();
  var sw=geoMap.options.crs.project(b.getSouthWest()), ne=geoMap.options.crs.project(b.getNorthEast());
  var url='https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetFeatureInfo'+
    '&layers=SeamapAus_National_Benthic_Habitat_Layer&query_layers=SeamapAus_National_Benthic_Habitat_Layer'+
    '&feature_count=10&buffer=3&srs=EPSG:3857&width='+size.x+'&height='+size.y+
    '&bbox='+sw.x+','+sw.y+','+ne.x+','+ne.y+'&x='+Math.round(cp.x)+'&y='+Math.round(cp.y);
  geoFeatureInfo(url, function(j){ cb(habFromFeatures((j&&j.features)?j.features:[])); });
}
function geoClick(e){
  var ll=e.latlng, el=geoInfoEl; if(!el) return;
  var det=el.querySelector('.gi-detail'); if(!det) return; det.hidden=false;
  var st={name:null,grp:null,raw:null};
  function render(){
    var h='<div style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px"></div>'+
      '<div style="font-weight:700;font-size:13px">'+(st.name||'Selected point')+'</div>'+
      '<div style="font-size:11px;color:var(--muted);margin:2px 0 6px">'+ll.lat.toFixed(3)+', '+ll.lng.toFixed(3)+'</div>';
    if(st.grp){ h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px"><span style="width:13px;height:13px;border-radius:3px;background:'+st.grp.col+';flex:0 0 13px"></span><b>'+st.grp.name+'</b></div>'+
      '<div style="font-size:12px;color:var(--muted);line-height:1.4">'+st.grp.desc+'</div>'+
      (st.raw?'<div style="font-size:11px;color:var(--muted);margin-top:5px">Seamap class: '+st.raw+'</div>':''); }
    else if(st.raw===false){ h+='<div style="font-size:12px;color:var(--muted)">Open water &mdash; no seabed habitat here.</div>'; }
    else { h+='<div style="font-size:12px;color:var(--muted)">Reading&hellip;</div>'; }
    det.innerHTML=h;
  }
  render();
  jsonp('https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&addressdetails=1&lat='+ll.lat+'&lon='+ll.lng, function(d){
    if(d){ var a=d.address||{}; st.name=a.hamlet||a.village||a.town||a.suburb||a.city||a.county||a.state||(d.display_name?d.display_name.split(',')[0]:null); }
    if(!st.name) st.name='Offshore Victoria'; render();
  }, 'json_callback');
  geoQuery(ll, e.containerPoint, function(raw){ if(raw){ st.raw=raw; st.grp=classifyHab(raw); } else { st.raw=false; } render(); });
}
function legendImageFallback(){
  var url='https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image%2Fpng&transparent=true&layer=SeamapAus_National_Benthic_Habitat_Layer&legend_options=fontSize:11;fontColor:0x444444;dpi:96';
  return '<img src="'+url+'" alt="Seamap habitat classes" style="max-width:100%;background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px">';
}
var GEO_GROUPS=[
  {col:'#8a3b3b',name:'Reef &amp; rocky bottom',desc:'Hard rock, ledges and boulders &mdash; prime reef habitat.'},
  {col:'#39b54a',name:'Seagrass meadow',desc:'Underwater grass beds &mdash; nurseries for fish, squid &amp; whiting.'},
  {col:'#2e7d6b',name:'Kelp &amp; seaweed',desc:'Macroalgae and kelp growing on reef.'},
  {col:'#e6a6b8',name:'Sponge gardens &amp; filter feeders',desc:'Sponges, sea squirts and lace corals, often on deeper reef.'},
  {col:'#9aa0a8',name:'Shellfish &amp; invertebrates',desc:'Shell beds and mixed bottom-dwelling life.'},
  {col:'#6a3d9a',name:'Urchin barren',desc:'Reef grazed bare by sea urchins.'},
  {col:'#cdb98c',name:'Sand &amp; mud',desc:'Open soft bottom &mdash; sand, mud and shell grit.'},
  {col:'#3b6f9e',name:'Other marine life',desc:'Microbial mats and mixed seabed communities.'}
];
function classifyHab(raw){
  if(!raw) return null; var s=(''+raw).toLowerCase();
  function h(w){ return s.indexOf(w)>=0; }
  if(h('seagrass')) return GEO_GROUPS[1];
  if(h('urchin')) return GEO_GROUPS[5];
  if(h('macroalg')||h('kelp')||h('macrophyt')||h('vegetation')||h('algae')) return GEO_GROUPS[2];
  if(h('sponge')||h('bryozoan')||h('ascidian')||h('filter feeder')) return GEO_GROUPS[3];
  if(h('shell')||h('invertebrate')||h('bioturbat')) return GEO_GROUPS[4];
  if(h('reef')||h('hard')||h('rock')||h('bedrock')||h('boulder')||h('consolidat')) return GEO_GROUPS[0];
  if(h('sand')||h('mud')||h('soft')||h('unconsolidat')||h('gravel')||h('sediment')) return GEO_GROUPS[6];
  if(h('coral')) return {col:'#d24dbb',name:'Coral / tropical biota',desc:'Coral community (uncommon this far south).'};
  return GEO_GROUPS[7];
}
function loadGeoLegend(){
  var lg=document.getElementById('geolegend'); if(!lg) return;
  var h='<div style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:8px">Seabed types &mdash; simple guide</div>';
  GEO_GROUPS.forEach(function(g){
    h+='<div style="display:flex;gap:8px;margin:8px 0"><span style="width:16px;height:16px;border-radius:4px;background:'+g.col+';border:1px solid rgba(0,0,0,.15);flex:0 0 16px;margin-top:2px"></span><div><div style="font-size:13px;font-weight:600;color:var(--ink)">'+g.name+'</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35">'+g.desc+'</div></div></div>';
  });
  h+='<div style="font-size:11px;color:var(--muted);margin:8px 0;line-height:1.4">Simplified from <a href="https://seamapaustralia.org/" target="_blank" rel="noopener">Seamap Australia</a>. Map colours show finer detail.</div>';
  h+='<button onclick="toggleFullLegend()" id="fullLegBtn" style="font:inherit;font-size:12px;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 10px;color:var(--accent);cursor:pointer">Show full Seamap classes</button>';
  h+='<div id="fulllegend" hidden style="margin-top:8px"></div>';
  lg.innerHTML=h;
}
function toggleFullLegend(){
  var d=document.getElementById('fulllegend'), b=document.getElementById('fullLegBtn'); if(!d) return;
  if(d.hidden){ d.hidden=false; d.innerHTML=legendImageFallback(); if(b) b.textContent='Hide full Seamap classes'; }
  else { d.hidden=true; d.innerHTML=''; if(b) b.textContent='Show full Seamap classes'; }
}
function setTheme(dark){
  document.body.classList.toggle('dark', dark);
  try{ localStorage.setItem('vicdive-theme', dark?'dark':'light'); }catch(e){}
  var t=document.getElementById('themeToggle'); if(t) t.checked=dark;
}
function restoreTheme(){
  var dark=false; try{ dark=localStorage.getItem('vicdive-theme')==='dark'; }catch(e){}
  setTheme(dark);
}
// top-level tabs; the parents (conditions/live/geo) remember their last-open sub-tab
var TOP_TABS=['home','conditions','fish','live','geo','about','feedback'];
var activeSub={conditions:'divesites', live:'chl', geo:'habitat'};
function showTab(t){
  TOP_TABS.forEach(function(name){
    var p=document.getElementById('tab-'+name), btn=document.getElementById('btn-'+name);
    if(p) p.hidden=(name!==t);
    if(btn) btn.classList.toggle('active', name===t);
  });
  if(activeSub[t]) showSub(t, activeSub[t]);
}
function showSub(parent, s){
  activeSub[parent]=s;
  var panel=document.getElementById('tab-'+parent); if(!panel) return;
  var subs=panel.getElementsByClassName('subpanel');
  for(var i=0;i<subs.length;i++) subs[i].hidden=(subs[i].id!=='sub-'+s);
  var btns=panel.getElementsByClassName('subtab');
  for(var j=0;j<btns.length;j++) btns[j].classList.toggle('active', btns[j].getAttribute('data-sub')===s);
  subSetup(s);
}
// size/load the right map or feed when a section becomes visible (maps init hidden -> need invalidateSize)
function subSetup(s){
  setTimeout(function(){ try{
    if(s==='divesites'){ map.invalidateSize(); }
    else if(s==='windmap'){ windMap.invalidateSize(); if(!wmShown){ wmShown=true; windMap.setView(WM_HOME, WM_HOME_ZOOM); loadWindFields(); } }
    else if(s==='chl'){ loadLiveTab(); compMap.invalidateSize(); }
    else if(s==='nepean'){ loadLiveTab(); fitLiveEmbed(); }
    else if(s==='sst'){ loadLiveTab(); }
    else if(s==='habitat'){ geoMap.invalidateSize(); if(!geoBasesAdded){ geoBasesAdded=true; addGeoBase(geoMap,'habitat.png',habitatLayer,0.62,250); addGeoBase(geoMap,'contours.png',contourLayer,0.95,255); } }
    else if(s==='depth'){ bathyMap.invalidateSize(); if(!('IntersectionObserver' in window)){ /* observer handles base load when supported */ } }
  }catch(e){} }, 70);
}

initMap();
initWindMap();
initCompMap();
initGeoMap();
initBathyMap();
populateSelect();
renderFish();
document.getElementById('stamp').textContent='Updated '+new Date().toLocaleString();
DEFAULTS.forEach(function(id){ addSpot(id); });
restoreTheme();
