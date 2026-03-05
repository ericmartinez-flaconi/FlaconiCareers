(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,53290,e=>{"use strict";var n=e.i(34782),t=e.i(48667);function s({initialData:e}){return(0,t.useEffect)(()=>{!async function(){try{let e=await fetch("/FlaconiCareers/captured_dom/jobs_live.json"),n=await e.json(),t=document.querySelector(".job-table");t&&n.length>0&&(t.innerHTML="",n.forEach(e=>{let n=document.createElement("div");n.className="job",n.innerHTML=`
                <div class="main-column">
                    <div>
                        <a href="${e.URL||"#"}" class="job-title">
                            <strong>${e.Title||"Job Opening"}</strong>
                        </a>
                    </div>
                    <div class="info-column">
                        <div class="info-items">
                            <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                                <p style="display:flex; margin-bottom: unset;">
                                    <img src="https://www.flaconi.de/karriere/wp-content/uploads/2024/03/standort.jpg" height="24" width="19" style="width: 19px;">
                                    &nbsp;<span>${e.Location||"Remote / Berlin"}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                    <div style="display: table-cell; vertical-align: middle;">
                        <div class="apply-link">
                            <a href="${e.URL||"#"}" target="blank">
                                <span>more details</span>
                                <span class="icon kb-svg-icon-wrap kb-svg-icon-fe_chevronRight kt-btn-icon-side-right">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </span>
                            </a>
                        </div>
                    </div>
                </div>
             `,t.appendChild(n)}),console.log("Live jobs injected:",n.length))}catch(e){console.error("Failed to sync live jobs:",e)}}()},[]),(0,n.jsxs)("html",{lang:"en",className:e.htmlClass,children:[(0,n.jsx)("head",{dangerouslySetInnerHTML:{__html:e.head}}),(0,n.jsx)("body",{className:e.bodyClass,style:{margin:0,padding:0},dangerouslySetInnerHTML:{__html:e.body}})]})}e.s(["default",()=>s])}]);