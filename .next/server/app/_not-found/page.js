(()=>{var e={};e.id=409,e.ids=[409],e.modules={399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},209:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9348:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},412:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},5315:e=>{"use strict";e.exports=require("path")},621:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>c,pages:()=>u,routeModule:()=>p,tree:()=>d});var s=r(3003),i=r(4293),o=r(6550),n=r.n(o),a=r(6979),l={};for(let e in a)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>a[e]);r.d(t,l);let d=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.t.bind(r,2075,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,6877)),"D:\\Code\\Business_Process_Management_Platform\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,2075,23)),"next/dist/client/components/not-found-error"]}],u=[],c={require:r,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:i.RouteKind.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},178:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,2639,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23)),Promise.resolve().then(r.t.bind(r,2816,23))},5179:()=>{},6877:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a,metadata:()=>n});var s=r(9351),i=r(6921),o=r.n(i);r(7272);let n={title:"业务流程管理平台",description:"用于创建、管理和监控企业业务流程的综合性平台"};function a({children:e}){return(0,s.jsx)("html",{lang:"zh-CN",className:o().variable,children:(0,s.jsxs)("body",{className:"bg-gray-100 antialiased",children:[(0,s.jsx)("script",{dangerouslySetInnerHTML:{__html:`
          // Initialize localStorage if needed
          (function() {
            const INIT_KEY = 'storageInitialized';
            const keys = ['websites', 'assistantItems', 'projects', 'resources', 'businessFlows'];
            
            // Check if localStorage is already initialized
            const isInitialized = localStorage.getItem(INIT_KEY);
            if (isInitialized === 'true') return;
            
            // Initialize each feature with empty arrays
            for (const key of keys) {
              if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
              }
            }
            
            // Initialize dashboard
            if (!localStorage.getItem('dashboard')) {
              localStorage.setItem('dashboard', JSON.stringify({
                stats: {
                  businessFlows: 0,
                  projects: 0,
                  resources: 0
                }
              }));
            }
            
            // Mark storage as initialized
            localStorage.setItem(INIT_KEY, 'true');
            console.log('LocalStorage manually initialized');
          })();
        `}}),e]})})}},7272:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[267,83],()=>r(621));module.exports=s})();