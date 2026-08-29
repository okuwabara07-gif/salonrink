(function(){
var U="https://fmpmgilgvvfezursmyic.supabase.co";
var K=""eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcG1naWxndnZmZXp1cnNteWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjM4MzMsImV4cCI6MjA5MTk5OTgzM30.cOJarUiOQdBpTI8_iISIZSiC9Bh9eaTyz_7To-LQjUw"";
function aid(){try{var k="sr_anon_id",v=localStorage.getItem(k);if(!v){v="a_"+Date.now().toString(36)+Math.random().toString(36).slice(2,10);localStorage.setItem(k,v);}return v;}catch(e){return "a_x";}}
function q(n){var m=new RegExp("[?&]"+n+"=([^&]+)").exec(location.search);return m?decodeURIComponent(m[1]):null;}
function pg(){var p=location.pathname.replace(/\/+$/,"");var l=p.substring(p.lastIndexOf("/")+1)||"index";return l.replace(/\.html$/,"");}
var A=aid(),R=q("ref"),S=q("session_id")||q("session"),L=q("line_user_id")||q("uid");
function send(step,meta){try{var b={anon_id:A,line_user_id:L||null,session_id:S||null,step:step,page:pg(),ref:R||null,variant:window.SR_VARIANT||null,meta:meta||null,referrer:document.referrer||null,utm_source:q("utm_source"),utm_medium:q("utm_medium"),utm_campaign:q("utm_campaign")};fetch(U+"/rest/v1/funnel_events",{method:"POST",headers:{"Content-Type":"application/json","apikey":K,"Authorization":"Bearer "+K,"Prefer":"return=minimal"},body:JSON.stringify(b),keepalive:true}).catch(function(){});}catch(e){}}
window.srTrack=send;
function go(){var p=pg();send(p==="index"?"lp_view":"tool_view",{page:p});document.addEventListener("click",function(e){var el=e.target.closest("[data-sr-track],a,button");if(!el)return;var lb=el.getAttribute("data-sr-track");if(lb){send("cta_click",{label:lb,page:p});return;}var h=el.getAttribute("href")||"";if(/lin\.ee|line\.me/.test(h)){send("cta_click",{label:"line_register",href:h,page:p});}},true);}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",go);}else{go();}
})();
