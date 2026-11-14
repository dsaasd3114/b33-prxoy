/* B33 Proxy launcher — adapted from the Vela project. */
import { BareMuxConnection } from "../baremux/index.mjs";

const DEFAULT_WISP = "wss://vela-wisp.onrender.com/";
const WISP_URL = localStorage.getItem("b33:wisp") || DEFAULT_WISP;
const SEARCH_ENGINE = "https://www.google.com/search?q=%s";
const BASE = new URL(".", document.baseURI).pathname;

function getEngine(){return localStorage.getItem("b33:engine")==="scramjet"?"scramjet":"uv"}
function setEngine(engine){localStorage.setItem("b33:engine",engine);reflectEngineUI()}
let scramjet=null,scramjetReady=false,ready=false,bootError=null;
function normalizeInput(raw){
 const input=raw.trim();if(!input)return null;
 if(/^https?:\/\//i.test(input))return input;
 if(/^[^\s.]+\.[^\s]+$/.test(input)&&!input.includes(" "))return "https://"+input;
 return SEARCH_ENGINE.replace("%s",encodeURIComponent(input));
}
function toProxyUrl(url){
 if(getEngine()==="scramjet"&&scramjetReady)return scramjet.encodeUrl(url);
 return __uv$config.prefix+__uv$config.encodeUrl(url);
}
async function boot(){
 if(!navigator.serviceWorker)throw new Error("This browser does not support service workers.");
 if(!window.isSecureContext)throw new Error("B33 Proxy needs HTTPS or localhost.");
 await navigator.serviceWorker.register("./sw.js",{scope:BASE});
 await navigator.serviceWorker.ready;
 const workerUrl=new URL("baremux/worker.js",document.baseURI).href;
 const epoxyUrl=new URL("epoxy/index.mjs",document.baseURI).href;
 const conn=new BareMuxConnection(workerUrl);
 if(await conn.getTransport()!==epoxyUrl)await conn.setTransport(epoxyUrl,[{wisp:WISP_URL}]);
 try{
  const {ScramjetController}=$scramjetLoadController();
  scramjet=new ScramjetController({prefix:BASE+"scramjet/",files:{wasm:BASE+"scram/scramjet.wasm.wasm",all:BASE+"scram/scramjet.all.js",sync:BASE+"scram/scramjet.sync.js"}});
  await scramjet.init();scramjetReady=true;
 }catch(error){console.warn("[B33] Scramjet initialization failed; Ultraviolet remains available.",error)}
 ready=true;
}
const form=document.getElementById("search-form");
const field=document.getElementById("search-field");
const status=document.getElementById("status");
const engineButtons=document.querySelectorAll("[data-engine]");
function setStatus(message,kind=""){status.textContent=message;status.dataset.kind=kind}
function reflectEngineUI(){
 const active=getEngine();
 engineButtons.forEach(button=>{const selected=button.dataset.engine===active;button.classList.toggle("active",selected);button.setAttribute("aria-pressed",String(selected))});
}
async function launch(raw){
 const target=normalizeInput(raw);if(!target)return;
 if(bootError){setStatus("Proxy startup failed: "+bootError.message,"error");return}
 if(!ready){setStatus("Starting proxy engine…","loading");try{await bootPromise}catch(error){setStatus("Proxy startup failed: "+error.message,"error");return}}
 if(getEngine()==="scramjet"&&!scramjetReady)setStatus("Scramjet unavailable. Switch to Ultraviolet.","error");
 else setStatus("Opening destination…","ok");
 location.href=toProxyUrl(target);
}
form.addEventListener("submit",event=>{event.preventDefault();launch(field.value)});
document.querySelectorAll("[data-launch]").forEach(button=>button.addEventListener("click",()=>launch(button.dataset.launch)));
engineButtons.forEach(button=>button.addEventListener("click",()=>setEngine(button.dataset.engine)));
document.getElementById("settings-btn").addEventListener("click",()=>{
 const current=localStorage.getItem("b33:wisp")||DEFAULT_WISP;
 const next=prompt("WISP server URL (WebSocket). Leave blank to use the default:",current);
 if(next===null)return;
 if(!next.trim()){localStorage.removeItem("b33:wisp");alert("Default WISP server restored. Reload the page.");return}
 if(!/^wss?:\/\//i.test(next.trim())){alert("Enter a valid ws:// or wss:// address.");return}
 localStorage.setItem("b33:wisp",next.trim());alert("WISP server saved. Reload the page to reconnect.");
});
reflectEngineUI();
setStatus("Starting proxy services…","loading");
const bootPromise=boot().then(()=>setStatus("Ready. Enter a destination.","ok")).catch(error=>{bootError=error;setStatus("Proxy startup failed: "+error.message,"error");console.error("[B33]",error)});
