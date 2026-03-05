(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,53290,e=>{"use strict";var t=e.i(34782),l=e.i(48667);function a({initialData:e}){let[a,s]=(0,l.useState)(!1);return(0,l.useEffect)(()=>{(async()=>{try{let e=await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vS_placeholder_replace_me/pub?output=csv"),t=(await e.text()).split("\n").map(e=>e.split(",")),l=t[0],a=t.slice(1).map(e=>{let t={};return l.forEach((l,a)=>t[l.trim()]=e[a]?.replace(/"/g,"").trim()),t}).filter(e=>e.Title);if(a.length>0){let e=document.querySelector(".job-list-container");if(e){let t=a.map(e=>`
              <div class="job live-job" style="border-left: 4px solid #db2777; margin-bottom: 10px; background: #fffafb;">
                <div class="main-column">
                  <div><a href="${e.URL}" target="_blank" class="job-title"><strong>${e.Title}</strong> <span style="font-size: 10px; background: #db2777; color: white; padding: 2px 6px; border-radius: 10px; margin-left: 10px;">LIVE</span></a></div>
                  <div class="info-column"><div class="info-items">
                    <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                      <p style="display:flex;"><span>📍 ${e.Location}</span></p>
                      <p style="display:flex;"><span>🏢 ${e.Department}</span></p>
                    </div>
                  </div></div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                  <div style="display: table-cell; vertical-align: middle;">
                    <div class="apply-link"><a href="${e.URL}" target="_blank"><span>Apply Now</span></a></div>
                  </div>
                </div>
              </div>
            `).join("");e.insertAdjacentHTML("afterbegin",t)}}}catch(e){console.error("Live Sync Failed:",e)}})()},[]),(0,t.jsxs)("html",{lang:"en",className:e.htmlClass,children:[(0,t.jsx)("head",{dangerouslySetInnerHTML:{__html:e.head}}),(0,t.jsx)("body",{className:e.bodyClass,style:{margin:0,padding:0},dangerouslySetInnerHTML:{__html:e.body}})]})}e.s(["default",()=>a])}]);