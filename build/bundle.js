var app=function(){"use strict";function t(){}const n=t=>t;function e(t){return t()}function o(){return Object.create(null)}function l(t){t.forEach(e)}function r(t){return"function"==typeof t}function c(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function s(t,n,e,o){return t[1]&&o?function(t,n){for(const e in n)t[e]=n[e];return t}(e.ctx.slice(),t[1](o(n))):e.ctx}const i="undefined"!=typeof window;let u=i?()=>window.performance.now():()=>Date.now(),a=i?t=>requestAnimationFrame(t):t;const d=new Set;function f(t){d.forEach((n=>{n.c(t)||(d.delete(n),n.f())})),0!==d.size&&a(f)}function $(t){let n;return 0===d.size&&a(f),{promise:new Promise((e=>{d.add(n={c:t,f:e})})),abort(){d.delete(n)}}}function h(t,n){t.appendChild(n)}function p(t){if(!t)return document;const n=t.getRootNode?t.getRootNode():t.ownerDocument;return n&&n.host?n:t.ownerDocument}function g(t){const n=k("style");return function(t,n){h(t.head||t,n)}(p(t),n),n.sheet}function m(t,n,e){t.insertBefore(n,e||null)}function v(t){t.parentNode.removeChild(t)}function w(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function k(t){return document.createElement(t)}function y(t){return document.createTextNode(t)}function b(){return y(" ")}function x(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function C(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function L(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function _(t,n){t.value=null==n?"":n}function M(t,n,e){t.classList[e?"add":"remove"](n)}function j(t,n,e=!1){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,e,!1,n),o}const E=new Map;let F,z=0;function A(t,n,e,o,l,r,c,s=0){const i=16.666/o;let u="{\n";for(let t=0;t<=1;t+=i){const o=n+(e-n)*r(t);u+=100*t+`%{${c(o,1-o)}}\n`}const a=u+`100% {${c(e,1-e)}}\n}`,d=`__svelte_${function(t){let n=5381,e=t.length;for(;e--;)n=(n<<5)-n^t.charCodeAt(e);return n>>>0}(a)}_${s}`,f=p(t),{stylesheet:$,rules:h}=E.get(f)||function(t,n){const e={stylesheet:g(n),rules:{}};return E.set(t,e),e}(f,t);h[d]||(h[d]=!0,$.insertRule(`@keyframes ${d} ${a}`,$.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?`${m}, `:""}${d} ${o}ms linear ${l}ms 1 both`,z+=1,d}function R(t,n){const e=(t.style.animation||"").split(", "),o=e.filter(n?t=>t.indexOf(n)<0:t=>-1===t.indexOf("__svelte")),l=e.length-o.length;l&&(t.style.animation=o.join(", "),z-=l,z||a((()=>{z||(E.forEach((t=>{const{stylesheet:n}=t;let e=n.cssRules.length;for(;e--;)n.deleteRule(e);t.rules={}})),E.clear())})))}function S(t){F=t}function D(){if(!F)throw new Error("Function called outside component initialization");return F}function N(t){D().$$.after_update.push(t)}function P(){const t=D();return(n,e)=>{const o=t.$$.callbacks[n];if(o){const l=j(n,e);o.slice().forEach((n=>{n.call(t,l)}))}}}function q(t,n){D().$$.context.set(t,n)}function H(t){return D().$$.context.get(t)}function T(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach((t=>t.call(this,n)))}const V=[],B=[],K=[],O=[],U=Promise.resolve();let I=!1;function X(t){K.push(t)}function J(t){O.push(t)}const Y=new Set;let G,Q=0;function W(){const t=F;do{for(;Q<V.length;){const t=V[Q];Q++,S(t),Z(t.$$)}for(S(null),V.length=0,Q=0;B.length;)B.pop()();for(let t=0;t<K.length;t+=1){const n=K[t];Y.has(n)||(Y.add(n),n())}K.length=0}while(V.length);for(;O.length;)O.pop()();I=!1,Y.clear(),S(t)}function Z(t){if(null!==t.fragment){t.update(),l(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(X)}}function tt(){return G||(G=Promise.resolve(),G.then((()=>{G=null}))),G}function nt(t,n,e){t.dispatchEvent(j(`${n?"intro":"outro"}${e}`))}const et=new Set;let ot;function lt(){ot={r:0,c:[],p:ot}}function rt(){ot.r||l(ot.c),ot=ot.p}function ct(t,n){t&&t.i&&(et.delete(t),t.i(n))}function st(t,n,e,o){if(t&&t.o){if(et.has(t))return;et.add(t),ot.c.push((()=>{et.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}const it={duration:0};function ut(e,o,l){let c,s,i=o(e,l),a=!1,d=0;function f(){c&&R(e,c)}function h(){const{delay:o=0,duration:l=300,easing:r=n,tick:h=t,css:p}=i||it;p&&(c=A(e,0,1,l,o,r,p,d++)),h(0,1);const g=u()+o,m=g+l;s&&s.abort(),a=!0,X((()=>nt(e,!0,"start"))),s=$((t=>{if(a){if(t>=m)return h(1,0),nt(e,!0,"end"),f(),a=!1;if(t>=g){const n=r((t-g)/l);h(n,1-n)}}return a}))}let p=!1;return{start(){p||(p=!0,R(e),r(i)?(i=i(),tt().then(h)):h())},invalidate(){p=!1},end(){a&&(f(),a=!1)}}}function at(e,o,c){let s,i=o(e,c),a=!0;const d=ot;function f(){const{delay:o=0,duration:r=300,easing:c=n,tick:f=t,css:h}=i||it;h&&(s=A(e,1,0,r,o,c,h));const p=u()+o,g=p+r;X((()=>nt(e,!1,"start"))),$((t=>{if(a){if(t>=g)return f(0,1),nt(e,!1,"end"),--d.r||l(d.c),!1;if(t>=p){const n=c((t-p)/r);f(1-n,n)}}return a}))}return d.r+=1,r(i)?tt().then((()=>{i=i(),f()})):f(),{end(t){t&&i.tick&&i.tick(1,0),a&&(s&&R(e,s),a=!1)}}}const dt="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function ft(t,n){st(t,1,1,(()=>{n.delete(t.key)}))}function $t(t,n,e){const o=t.$$.props[n];void 0!==o&&(t.$$.bound[o]=e,e(t.$$.ctx[o]))}function ht(t){t&&t.c()}function pt(t,n,o,c){const{fragment:s,on_mount:i,on_destroy:u,after_update:a}=t.$$;s&&s.m(n,o),c||X((()=>{const n=i.map(e).filter(r);u?u.push(...n):l(n),t.$$.on_mount=[]})),a.forEach(X)}function gt(t,n){const e=t.$$;null!==e.fragment&&(l(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function mt(t,n){-1===t.$$.dirty[0]&&(V.push(t),I||(I=!0,U.then(W)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function vt(n,e,r,c,s,i,u,a=[-1]){const d=F;S(n);const f=n.$$={fragment:null,ctx:null,props:i,update:t,not_equal:s,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(d?d.$$.context:[])),callbacks:o(),dirty:a,skip_bound:!1,root:e.target||d.$$.root};u&&u(f.root);let $=!1;if(f.ctx=r?r(n,e.props||{},((t,e,...o)=>{const l=o.length?o[0]:e;return f.ctx&&s(f.ctx[t],f.ctx[t]=l)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](l),$&&mt(n,t)),e})):[],f.update(),$=!0,l(f.before_update),f.fragment=!!c&&c(f.ctx),e.target){if(e.hydrate){const t=function(t){return Array.from(t.childNodes)}(e.target);f.fragment&&f.fragment.l(t),t.forEach(v)}else f.fragment&&f.fragment.c();e.intro&&ct(n.$$.fragment),pt(n,e.target,e.anchor,e.customElement),W()}S(d)}class wt{$destroy(){gt(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function kt(n){let e,o,r,c;return{c(){e=k("textarea"),C(e,"spellcheck","false"),C(e,"placeholder",n[1]),C(e,"style",o=`--white-space:${n[2]};`),C(e,"class","svelte-166p9k7")},m(t,o){m(t,e,o),_(e,n[0]),n[11](e),r||(c=[x(e,"input",n[10]),x(e,"load",n[4]),x(e,"input",n[4]),x(e,"keydown",n[7]),x(e,"focus",n[8]),x(e,"blur",n[9])],r=!0)},p(t,[n]){2&n&&C(e,"placeholder",t[1]),4&n&&o!==(o=`--white-space:${t[2]};`)&&C(e,"style",o),1&n&&_(e,t[0])},i:t,o:t,d(t){t&&v(e),n[11](null),r=!1,l(c)}}}function yt(t,n,e){let o,l,{value:r}=n,{placeholder:c=""}=n,{nowrap:s=!1}=n;function i(){e(3,l.value=l.value.replace(/\r?\n|\r/g,""),l),e(3,l.style.height="0px",l),e(3,l.style.height=l.scrollHeight+"px",l)}N((function(){i()}));return t.$$set=t=>{"value"in t&&e(0,r=t.value),"placeholder"in t&&e(1,c=t.placeholder),"nowrap"in t&&e(5,s=t.nowrap)},t.$$.update=()=>{32&t.$$.dirty&&e(2,o=s?"nowrap":"auto")},[r,c,o,l,i,s,()=>{l.focus()},function(n){T.call(this,t,n)},function(n){T.call(this,t,n)},function(n){T.call(this,t,n)},function(){r=this.value,e(0,r)},function(t){B[t?"unshift":"push"]((()=>{l=t,e(3,l)}))}]}class bt extends wt{constructor(t){super(),vt(this,t,yt,kt,c,{value:0,placeholder:1,nowrap:5,focus:6})}get focus(){return this.$$.ctx[6]}}function xt(n){let e,o,l=n[1].svg+"";return{c(){var t;t="svg",e=document.createElementNS("http://www.w3.org/2000/svg",t),C(e,"style",o=`width:${n[0]};height:${n[0]};display:block;margin:auto;`),C(e,"viewBox","0 0 100 100"),C(e,"fill","none"),C(e,"stroke","var(--color)")},m(t,n){m(t,e,n),e.innerHTML=l},p(t,[n]){1&n&&o!==(o=`width:${t[0]};height:${t[0]};display:block;margin:auto;`)&&C(e,"style",o)},i:t,o:t,d(t){t&&v(e)}}}function Ct(t,n,e){let{name:o}=n,{size:l="1rem"}=n,r=[{name:"arrowRight",svg:'<path d="M27 7L74 50L27 93" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'},{name:"arrowLeft",svg:'<path d="M74 93L27 50L74 7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'},{name:"arrowUp",svg:'<path d="M7.5 73.5L50.5 26.5L93.5 73.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'},{name:"arrowDown",svg:'<path d="M93.5 26.5L50.5 73.5L7.5 26.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'},{name:"delete",svg:'<path d="M78.5685 22L22 78.5685" stroke-width="10" stroke-linecap="round"/>\n<path d="M22 22L78.5685 78.5685" stroke-width="10" stroke-linecap="round"/>'},{name:"add",svg:'<path d="M50 10L50 90" stroke-width="10" stroke-linecap="round"/>\n<path d="M10 50H90" stroke-width="10" stroke-linecap="round"/>'},{name:"download",svg:'<path d="M71 45L50 68L29 45" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M50 66L50 14" stroke-width="10" stroke-linecap="round"/>'},{name:"upload",svg:'<path d="M29 37L50 14L71 37" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M50 16L50 68" stroke-width="10" stroke-linecap="round"/>'},{name:"addUp",svg:'<path d="M85 25V25C87.7614 25 90 27.2386 90 30V70C90 75.5228 85.5228 80 80 80H20C14.4772 80 10 75.5228 10 70L10 30C10 27.2386 12.2386 25 15 25V25" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M35 25H65" stroke-width="10" stroke-linecap="round"/>\n<path d="M50 40V10" stroke-width="10" stroke-linecap="round"/>'},{name:"addDown",svg:'<path d="M15 75V75C12.2386 75 10 72.7614 10 70L10 30C10 24.4772 14.4772 20 20 20L80 20C85.5228 20 90 24.4772 90 30L90 70C90 72.7614 87.7614 75 85 75V75" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M65 75H35" stroke-width="10" stroke-linecap="round"/>\n<path d="M50 60L50 90" stroke-width="10" stroke-linecap="round"/>'},{name:"addRight",svg:'<path d="M75 85V85C75 87.7614 72.7614 90 70 90H30C24.4772 90 20 85.5228 20 80V20C20 14.4772 24.4772 10 30 10H70C72.7614 10 75 12.2386 75 15V15" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M75 35V65" stroke-width="10" stroke-linecap="round"/>\n<path d="M60 50H90" stroke-width="10" stroke-linecap="round"/>'}].find((t=>t.name===o));return t.$$set=t=>{"name"in t&&e(2,o=t.name),"size"in t&&e(0,l=t.size)},[l,r,o]}class Lt extends wt{constructor(t){super(),vt(this,t,Ct,xt,c,{name:2,size:0})}}function _t(n){let e,o;return{c(){e=k("div"),C(e,"class","top svelte-11u8azr"),C(e,"style",o=`--this-background-color:${n[0]}`)},m(t,n){m(t,e,n)},p(t,[n]){1&n&&o!==(o=`--this-background-color:${t[0]}`)&&C(e,"style",o)},i:t,o:t,d(t){t&&v(e)}}}function Mt(t,n,e){let{background:o}=n;return t.$$set=t=>{"background"in t&&e(0,o=t.background)},[o]}class jt extends wt{constructor(t){super(),vt(this,t,Mt,_t,c,{background:0})}}function Et(t){return-t*(t-2)}function Ft(t,{duration:n=300}){const e=t.clientHeight;return{duration:n,css:t=>{const n=Et(t);return`\n        height: ${n*e}px;\n        overflow: visible;\n        clip-path: inset(${(1-n)*e-2}px 0 -${e}px 0);\n        transform: translateY(${(1-n)*-e}px);\n        `}}}function zt(t,{duration:n=300}){const e=t.clientHeight;return{duration:n,css:t=>{const n=Et(t);return`\n        height: ${n*e}px;\n        overflow: visible;\n        clip-path: inset(${(1-n)*e}px 0 0 0);\n        transform: translateY(${(1-n)*-e}px);\n        `}}}function At(t,{delay:n=0,duration:e=300}){return{delay:n,duration:e,css:t=>`\n        opacity:${t};\n      `}}function Rt(t,{delay:n=0,duration:e=300}){return{delay:n,duration:e,css:t=>{const n=Et(t);return`\n        clip-path:inset(0% ${100*(1-n)}% 0% 0%);\n        transform: translateX(${50*(1-n)}%);\n      `}}}function St(t,{delay:n=0,duration:e=300}){return{delay:n,duration:e,css:t=>{const n=function(t){return t*t}(t);return`\n      clip-path:inset(0% ${100*(1-n)}% 0% 0%);\n      transform: translateX(${50*(1-n)}%)`}}}function Dt(t,{duration:n=300}){const e=t.clientHeight;return{duration:n,css:t=>{const n=Et(t);return`\n        height: ${e*n}px;\n        overflow: hidden;\n        transform: translateX(${-100*(1-n)}%);\n      `}}}function Nt(t,n,e){const o=t.slice();return o[33]=n[e],o[34]=n,o[35]=e,o}function Pt(n){let e,o,r,c,s,i;return o=new Lt({props:{name:"add"}}),{c(){e=k("button"),ht(o.$$.fragment),C(e,"class","add svelte-6ndbzr")},m(t,l){m(t,e,l),pt(o,e,null),c=!0,s||(i=[x(e,"click",n[26]),x(e,"mousedown",Tt)],s=!0)},p:t,i(t){c||(ct(o.$$.fragment,t),t&&(r||X((()=>{r=ut(e,At,{}),r.start()}))),c=!0)},o(t){st(o.$$.fragment,t),c=!1},d(t){t&&v(e),gt(o),s=!1,l(i)}}}function qt(t,n){let e,o,l,r;function c(t){n[27](t,n[33],n[34],n[35])}let s={addSibling:n[14],deleteSelf:n[15],focusSibling:n[16],focusParent:n[17],parentPath:n[6]};return void 0!==n[33]&&(s.data=n[33]),o=new Bt({props:s}),B.push((()=>$t(o,"data",c))),o.$on("saveFocus",n[8]),{key:t,first:null,c(){e=y(""),ht(o.$$.fragment),this.first=e},m(t,n){m(t,e,n),pt(o,t,n),r=!0},p(t,e){n=t;const r={};64&e[0]&&(r.parentPath=n[6]),!l&&1&e[0]&&(l=!0,r.data=n[33],J((()=>l=!1))),o.$set(r)},i(t){r||(ct(o.$$.fragment,t),r=!0)},o(t){st(o.$$.fragment,t),r=!1},d(t){t&&v(e),gt(o,t)}}}function Ht(t){let n,e,o,l,r,c,s,i,u,a,d,f,$,p,g,w,y,x,L,_,j,E,F=[],z=new Map;function A(n){t[24](n)}r=new jt({props:{background:t[2]}});let R={placeholder:t[5]};void 0!==t[0].content&&(R.value=t[0].content),u=new bt({props:R}),B.push((()=>$t(u,"value",A))),t[25](u),u.$on("keydown",t[13]),u.$on("blur",t[12]),u.$on("focus",t[11]),$=new jt({props:{background:t[2]}});let S=0==t[0].children.length&&t[0].level<t[10]&&Pt(t),D=t[0].children;const N=t=>t[33];for(let n=0;n<D.length;n+=1){let e=Nt(t,D,n),o=N(e);z.set(o,F[n]=qt(o,e))}return{c(){n=k("div"),e=k("div"),o=k("div"),l=k("div"),ht(r.$$.fragment),i=b(),ht(u.$$.fragment),d=b(),f=k("div"),ht($.$$.fragment),w=b(),S&&S.c(),x=b(),L=k("ul");for(let t=0;t<F.length;t+=1)F[t].c();C(l,"class","line above svelte-6ndbzr"),M(l,"left",t[0].children.length>0),M(l,"right",0==t[0].index&&t[0].level>1),C(f,"class","line below svelte-6ndbzr"),C(o,"class","barcontainer svelte-6ndbzr"),C(e,"class","content svelte-6ndbzr"),C(e,"style",y=`--this-background: ${t[3]}`),M(e,"root",t[1]),M(e,"left",t[0].children.length>0),M(e,"right",0==t[0].index&&t[0].level>1),C(L,"class","children svelte-6ndbzr"),C(n,"class","top svelte-6ndbzr"),M(n,"empty",0==t[0].children.length),M(n,"two",t[0].level%2==0&&!t[9]||t[0].level%2==1&&t[9]),M(n,"focus",t[0].focus),M(n,"highlight",t[7])},m(t,c){m(t,n,c),h(n,e),h(e,o),h(o,l),pt(r,l,null),h(o,i),pt(u,o,null),h(o,d),h(o,f),pt($,f,null),h(e,w),S&&S.m(e,null),h(n,x),h(n,L);for(let t=0;t<F.length;t+=1)F[t].m(L,null);E=!0},p(t,o){const c={};4&o[0]&&(c.background=t[2]),r.$set(c),1&o[0]&&M(l,"left",t[0].children.length>0),1&o[0]&&M(l,"right",0==t[0].index&&t[0].level>1);const s={};32&o[0]&&(s.placeholder=t[5]),!a&&1&o[0]&&(a=!0,s.value=t[0].content,J((()=>a=!1))),u.$set(s);const i={};4&o[0]&&(i.background=t[2]),$.$set(i),0==t[0].children.length&&t[0].level<t[10]?S?(S.p(t,o),1&o[0]&&ct(S,1)):(S=Pt(t),S.c(),ct(S,1),S.m(e,null)):S&&(lt(),st(S,1,1,(()=>{S=null})),rt()),(!E||8&o[0]&&y!==(y=`--this-background: ${t[3]}`))&&C(e,"style",y),2&o[0]&&M(e,"root",t[1]),1&o[0]&&M(e,"left",t[0].children.length>0),1&o[0]&&M(e,"right",0==t[0].index&&t[0].level>1),246081&o[0]&&(D=t[0].children,lt(),F=function(t,n,e,o,l,r,c,s,i,u,a,d){let f=t.length,$=r.length,h=f;const p={};for(;h--;)p[t[h].key]=h;const g=[],m=new Map,v=new Map;for(h=$;h--;){const t=d(l,r,h),s=e(t);let i=c.get(s);i?o&&i.p(t,n):(i=u(s,t),i.c()),m.set(s,g[h]=i),s in p&&v.set(s,Math.abs(h-p[s]))}const w=new Set,k=new Set;function y(t){ct(t,1),t.m(s,a),c.set(t.key,t),a=t.first,$--}for(;f&&$;){const n=g[$-1],e=t[f-1],o=n.key,l=e.key;n===e?(a=n.first,f--,$--):m.has(l)?!c.has(o)||w.has(o)?y(n):k.has(l)?f--:v.get(o)>v.get(l)?(k.add(o),y(n)):(w.add(l),f--):(i(e,c),f--)}for(;f--;){const n=t[f];m.has(n.key)||i(n,c)}for(;$;)y(g[$-1]);return g}(F,o,N,1,t,D,z,L,ft,qt,null,Nt),rt()),1&o[0]&&M(n,"empty",0==t[0].children.length),513&o[0]&&M(n,"two",t[0].level%2==0&&!t[9]||t[0].level%2==1&&t[9]),1&o[0]&&M(n,"focus",t[0].focus),128&o[0]&&M(n,"highlight",t[7])},i(t){if(!E){ct(r.$$.fragment,t),t&&X((()=>{s&&s.end(1),c=ut(l,Rt,{}),c.start()})),ct(u.$$.fragment,t),ct($.$$.fragment,t),t&&X((()=>{g&&g.end(1),p=ut(f,Rt,{}),p.start()})),ct(S);for(let t=0;t<D.length;t+=1)ct(F[t]);t&&X((()=>{j&&j.end(1),_=ut(n,Ft,{}),_.start()})),E=!0}},o(t){st(r.$$.fragment,t),c&&c.invalidate(),t&&(s=at(l,St,{})),st(u.$$.fragment,t),st($.$$.fragment,t),p&&p.invalidate(),t&&(g=at(f,St,{})),st(S);for(let t=0;t<F.length;t+=1)st(F[t]);_&&_.invalidate(),t&&(j=at(n,zt,{})),E=!1},d(e){e&&v(n),gt(r),e&&s&&s.end(),t[25](null),gt(u),gt($),e&&g&&g.end(),S&&S.d();for(let t=0;t<F.length;t+=1)F[t].d();e&&j&&j.end()}}}function Tt(t){t.preventDefault()}function Vt(t,n,e){let o,l;const r=P();let c,s,{root:i=!1}=n,{data:u}=n,{parentPath:a=[]}=n,{addSibling:d=(()=>{})}=n,{deleteSelf:f=(()=>{})}=n,{focusSibling:$=(()=>{})}=n,{focusParent:h=(()=>{})}=n,p=!1;const{getNeg:g}=H("neg");let m=g();const{getColumnCount:v}=H("columnCount");let w,k=v();var y;y=function(){e(23,p=!1)},D().$$.before_update.push(y),N((function(){u.focus&&u.level>=1&&(w.focus(),r("saveFocus",o))}));let b="";class x{constructor(t,n=(()=>!0),e=!0,o=!0,l=!1){this.require=n,this.preventDefault=o,this.keepFocus=l,this.stopRepeat=e,this.handle=function(n){return!!this.require()&&(this.preventDefault&&n.preventDefault(),(!this.stopRepeat||1!=n.repeat)&&(this.keepFocus&&M(),t(),!0))}}}const C={shiftKey:{Enter:new x((()=>L(0,0)))},other:{Enter:new x((()=>d(u.index,1))),Backspace:new x((()=>f(u.index)),(()=>0==u.content.length)),ArrowUp:new x((()=>$(u.index,-1))),ArrowDown:new x((()=>$(u.index,1))),ArrowLeft:new x((()=>h())),ArrowRight:new x((()=>{u.children.length>0?_(0,0):$(u.index,1)}))}};function L(t,n){let o=t+n;if(u.level<k){let t=[...u.children];t.splice(o,0,{content:"",children:[],index:o,level:u.level+1,focus:!0});for(let n=o;n<t.length;n++)t[n].index=n;e(0,u.children=[...t],u),e(0,u)}else M()}function _(t,n){let o=t+n;if(o<0)return void M();let l=u.children;o>=l.length?l[l.length-1].children.length>0?l[l.length-1].children[0].focus=!0:l[t].focus=!0:l[o].focus=!0,e(0,u.children=l,u),e(0,u)}function M(){e(0,u.focus=!0,u),e(0,u)}return t.$$set=t=>{"root"in t&&e(1,i=t.root),"data"in t&&e(0,u=t.data),"parentPath"in t&&e(18,a=t.parentPath),"addSibling"in t&&e(19,d=t.addSibling),"deleteSelf"in t&&e(20,f=t.deleteSelf),"focusSibling"in t&&e(21,$=t.focusSibling),"focusParent"in t&&e(22,h=t.focusParent)},t.$$.update=()=>{262145&t.$$.dirty[0]&&e(6,o=[...a,u.index]),8388609&t.$$.dirty[0]&&(u.focus?(e(2,c="var(--accent)"),e(3,s="var(--background-accent)")):p?(e(2,c="var(--accent-fade)"),e(3,s="var(--background-accent-fade)")):(e(2,c="none"),e(3,s="none"))),8388609&t.$$.dirty[0]&&e(7,l=p||u.focus),1&t.$$.dirty[0]&&(1==u.level&&0==u.index?e(5,b="type here"):e(5,b=""))},[u,i,c,s,w,b,o,l,function(t){t.detail.length-o.length==1&&e(23,p=!0),r("saveFocus",t.detail)},m,k,function(){u.focus||M()},function(){u.focus&&(e(0,u.focus=!1,u),e(0,u))},function(t){t.shiftKey&&C.shiftKey[t.key]?C.shiftKey[t.key].handle(t):C.other[t.key]&&C.other[t.key].handle(t)},L,function(t){if(u.children.length>1||u.level>=1){let n=[...u.children];n[t].focus=!1,n.splice(t,1);for(let e=t;e<n.length;e++)n[e].index=e;n[t-1]?n[t-1].focus=!0:0==n.length?M():t-1<0&&(n[0].focus=!0),e(0,u.children=[...n],u)}else e(0,u.children[t].focus=!0,u);e(0,u)},_,M,a,d,f,$,h,p,function(n){t.$$.not_equal(u.content,n)&&(u.content=n,e(0,u))},function(t){B[t?"unshift":"push"]((()=>{w=t,e(4,w)}))},()=>L(0,0),function(t,n,o,l){o[l]=t,e(0,u)}]}class Bt extends wt{constructor(t){super(),vt(this,t,Vt,Ht,c,{root:1,data:0,parentPath:18,addSibling:19,deleteSelf:20,focusSibling:21,focusParent:22},null,[-1,-1])}}function Kt(t){let n,e,o,l;function r(n){t[2](n)}let c={nowrap:!0};return void 0!==t[0]&&(c.value=t[0]),e=new bt({props:c}),B.push((()=>$t(e,"value",r))),e.$on("keydown",t[1]),{c(){n=k("div"),ht(e.$$.fragment),C(n,"class","top svelte-c159xa")},m(t,o){m(t,n,o),pt(e,n,null),l=!0},p(t,[n]){const l={};!o&&1&n&&(o=!0,l.value=t[0],J((()=>o=!1))),e.$set(l)},i(t){l||(ct(e.$$.fragment,t),l=!0)},o(t){st(e.$$.fragment,t),l=!1},d(t){t&&v(n),gt(e)}}}function Ot(t,n,e){const o=P();let{column:l}=n;return t.$$set=t=>{"column"in t&&e(0,l=t.column)},[l,function(t){"Enter"!=t.key&&"ArrowDown"!=t.key||(t.preventDefault(),o("focusFlow"))},function(t){l=t,e(0,l)}]}class Ut extends wt{constructor(t){super(),vt(this,t,Ot,Kt,c,{column:0})}}function It(t,n,e){const o=t.slice();return o[5]=n[e],o}function Xt(t,n,e){const o=t.slice();return o[8]=n[e],o[9]=n,o[10]=e,o}function Jt(t){let n,e,o,l,r;function c(n){t[3](n,t[8],t[9],t[10])}let s={};return void 0!==t[8]&&(s.column=t[8]),e=new Ut({props:s}),B.push((()=>$t(e,"column",c))),e.$on("focusFlow",t[4]),{c(){n=k("div"),ht(e.$$.fragment),l=b(),C(n,"class","header svelte-3cz0xb")},m(t,o){m(t,n,o),pt(e,n,null),h(n,l),r=!0},p(n,l){t=n;const r={};!o&&1&l&&(o=!0,r.column=t[8],J((()=>o=!1))),e.$set(r)},i(t){r||(ct(e.$$.fragment,t),r=!0)},o(t){st(e.$$.fragment,t),r=!1},d(t){t&&v(n),gt(e)}}}function Yt(t){let n;return{c(){n=k("div"),C(n,"class","column svelte-3cz0xb")},m(t,e){m(t,n,e)},d(t){t&&v(n)}}}function Gt(t){let n,e,o,l,r,c,s,i,u,a,d;function f(n){t[2](n)}let $={root:!0};void 0!==t[0]&&($.data=t[0]),l=new Bt({props:$}),B.push((()=>$t(l,"data",f))),l.$on("saveFocus",t[1]);let p=t[0].columns,g=[];for(let n=0;n<p.length;n+=1)g[n]=Jt(Xt(t,p,n));const y=t=>st(g[t],1,1,(()=>{g[t]=null}));let x=t[0].columns,L=[];for(let n=0;n<x.length;n+=1)L[n]=Yt(It(t,x,n));return{c(){n=k("div"),e=k("div"),o=k("div"),ht(l.$$.fragment),c=b(),s=k("div");for(let t=0;t<g.length;t+=1)g[t].c();i=b(),u=k("div");for(let t=0;t<L.length;t+=1)L[t].c();C(o,"class","content svelte-3cz0xb"),M(o,"neg",t[0].neg),C(s,"class","headers svelte-3cz0xb"),C(u,"class","columns svelte-3cz0xb"),C(e,"class","viewer svelte-3cz0xb"),C(n,"class","top svelte-3cz0xb"),C(n,"style",a=`--column-count: ${t[0].columns.length};`),M(n,"neg",t[0].neg)},m(t,r){m(t,n,r),h(n,e),h(e,o),pt(l,o,null),h(e,c),h(e,s);for(let t=0;t<g.length;t+=1)g[t].m(s,null);h(e,i),h(e,u);for(let t=0;t<L.length;t+=1)L[t].m(u,null);d=!0},p(t,[e]){const c={};if(!r&&1&e&&(r=!0,c.data=t[0],J((()=>r=!1))),l.$set(c),1&e&&M(o,"neg",t[0].neg),1&e){let n;for(p=t[0].columns,n=0;n<p.length;n+=1){const o=Xt(t,p,n);g[n]?(g[n].p(o,e),ct(g[n],1)):(g[n]=Jt(o),g[n].c(),ct(g[n],1),g[n].m(s,null))}for(lt(),n=p.length;n<g.length;n+=1)y(n);rt()}if(1&e){const n=x.length;let e;for(x=t[0].columns,e=n;e<x.length;e+=1)It(t,x,e),L[e]||(L[e]=Yt(),L[e].c(),L[e].m(u,null));for(e=x.length;e<n;e+=1)L[e].d(1);L.length=x.length}(!d||1&e&&a!==(a=`--column-count: ${t[0].columns.length};`))&&C(n,"style",a),1&e&&M(n,"neg",t[0].neg)},i(t){if(!d){ct(l.$$.fragment,t);for(let t=0;t<p.length;t+=1)ct(g[t]);d=!0}},o(t){st(l.$$.fragment,t),g=g.filter(Boolean);for(let t=0;t<g.length;t+=1)st(g[t]);d=!1},d(t){t&&v(n),gt(l),w(g,t),w(L,t)}}}function Qt(t,n,e){let{root:o}=n;return q("neg",{getNeg:()=>o.neg}),q("columnCount",{getColumnCount:()=>o.columns.length}),t.$$set=t=>{"root"in t&&e(0,o=t.root)},[o,function(t){e(0,o.lastFocus=t.detail,o),e(0,o)},function(t){o=t,e(0,o)},function(t,n,l,r){l[r]=t,e(0,o)},function(n){T.call(this,t,n)}]}class Wt extends wt{constructor(t){super(),vt(this,t,Qt,Gt,c,{root:0})}}function Zt(t){let n,e,o,r,c;return e=new Lt({props:{name:t[0],size:"20px"}}),{c(){n=k("button"),ht(e.$$.fragment),C(n,"class","top svelte-1s5al5b"),M(n,"disabled",t[1])},m(l,s){m(l,n,s),pt(e,n,null),o=!0,r||(c=[x(n,"click",t[2]),x(n,"mousedown",tn)],r=!0)},p(t,[o]){const l={};1&o&&(l.name=t[0]),e.$set(l),2&o&&M(n,"disabled",t[1])},i(t){o||(ct(e.$$.fragment,t),o=!0)},o(t){st(e.$$.fragment,t),o=!1},d(t){t&&v(n),gt(e),r=!1,l(c)}}}function tn(t){t.preventDefault()}function nn(t,n,e){let{name:o}=n,{disabled:l=!1}=n;return t.$$set=t=>{"name"in t&&e(0,o=t.name),"disabled"in t&&e(1,l=t.disabled)},[o,l,function(n){T.call(this,t,n)}]}class en extends wt{constructor(t){super(),vt(this,t,nn,Zt,c,{name:0,disabled:1})}}function on(t){let n,e;const o=t[1].default,l=function(t,n,e,o){if(t){const l=s(t,n,e,o);return t[0](l)}}(o,t,t[0],null);return{c(){n=k("div"),l&&l.c(),C(n,"class","top svelte-p5tbxi")},m(t,o){m(t,n,o),l&&l.m(n,null),e=!0},p(t,[n]){l&&l.p&&(!e||1&n)&&function(t,n,e,o,l,r){if(l){const c=s(n,e,o,r);t.p(c,l)}}(l,o,t,t[0],e?function(t,n,e,o){if(t[2]&&o){const l=t[2](o(e));if(void 0===n.dirty)return l;if("object"==typeof l){const t=[],e=Math.max(n.dirty.length,l.length);for(let o=0;o<e;o+=1)t[o]=n.dirty[o]|l[o];return t}return n.dirty|l}return n.dirty}(o,t[0],n,null):function(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let t=0;t<e;t++)n[t]=-1;return n}return-1}(t[0]),null)},i(t){e||(ct(l,t),e=!0)},o(t){st(l,t),e=!1},d(t){t&&v(n),l&&l.d(t)}}}function ln(t,n,e){let{$$slots:o={},$$scope:l}=n;return t.$$set=t=>{"$$scope"in t&&e(0,l=t.$$scope)},[l,o]}class rn extends wt{constructor(t){super(),vt(this,t,ln,on,c,{})}}function cn(t){let n,e,o,l,r,c,s,i;return n=new en({props:{name:"addRight",disabled:!t[2]}}),n.$on("click",t[8]),o=new en({props:{name:"addUp",disabled:!t[2]}}),o.$on("click",t[12]),r=new en({props:{name:"addDown",disabled:!t[2]}}),r.$on("click",t[13]),s=new en({props:{name:"delete",disabled:!t[2]}}),s.$on("click",t[7]),{c(){ht(n.$$.fragment),e=b(),ht(o.$$.fragment),l=b(),ht(r.$$.fragment),c=b(),ht(s.$$.fragment)},m(t,u){pt(n,t,u),m(t,e,u),pt(o,t,u),m(t,l,u),pt(r,t,u),m(t,c,u),pt(s,t,u),i=!0},p(t,e){const l={};4&e&&(l.disabled=!t[2]),n.$set(l);const c={};4&e&&(c.disabled=!t[2]),o.$set(c);const i={};4&e&&(i.disabled=!t[2]),r.$set(i);const u={};4&e&&(u.disabled=!t[2]),s.$set(u)},i(t){i||(ct(n.$$.fragment,t),ct(o.$$.fragment,t),ct(r.$$.fragment,t),ct(s.$$.fragment,t),i=!0)},o(t){st(n.$$.fragment,t),st(o.$$.fragment,t),st(r.$$.fragment,t),st(s.$$.fragment,t),i=!1},d(t){gt(n,t),t&&v(e),gt(o,t),t&&v(l),gt(r,t),t&&v(c),gt(s,t)}}}function sn(t){let n,e,o,l,r,c,s,i,u,a,d;function f(n){t[10](n)}let $={nowrap:!0,placeholder:"type name here"};return void 0!==t[0].content&&($.value=t[0].content),o=new bt({props:$}),B.push((()=>$t(o,"value",f))),t[11](o),o.$on("blur",t[4]),o.$on("focus",t[5]),o.$on("keydown",t[6]),s=new jt({props:{background:t[3]}}),a=new rn({props:{$$slots:{default:[cn]},$$scope:{ctx:t}}}),{c(){n=k("div"),e=k("div"),ht(o.$$.fragment),r=b(),c=k("div"),ht(s.$$.fragment),i=b(),u=k("div"),ht(a.$$.fragment),C(c,"class","line svelte-ggwbrt"),C(e,"class","content svelte-ggwbrt"),M(e,"focus",t[0].focus),C(u,"class","buttons-wrapper svelte-ggwbrt"),C(n,"class","top svelte-ggwbrt")},m(t,l){m(t,n,l),h(n,e),pt(o,e,null),h(e,r),h(e,c),pt(s,c,null),h(n,i),h(n,u),pt(a,u,null),d=!0},p(t,[n]){const r={};!l&&1&n&&(l=!0,r.value=t[0].content,J((()=>l=!1))),o.$set(r);const c={};8&n&&(c.background=t[3]),s.$set(c),1&n&&M(e,"focus",t[0].focus);const i={};65540&n&&(i.$$scope={dirty:n,ctx:t}),a.$set(i)},i(t){d||(ct(o.$$.fragment,t),ct(s.$$.fragment,t),ct(a.$$.fragment,t),d=!0)},o(t){st(o.$$.fragment,t),st(s.$$.fragment,t),st(a.$$.fragment,t),d=!1},d(e){e&&v(n),t[11](null),gt(o),gt(s),gt(a)}}}function un(t,n,e){let o,{flow:l}=n;function r(t,n){n||(n=0);let e=l;if(t.length>1)for(let o=1;o<t.length-n;o++)e=e.children[t[o]];return e}N((function(){l.focus&&o.focus()}));let c,s=!1;function i(t){if(!s)return;let n=r(l.lastFocus,1),o=r(l.lastFocus),c=[...n.children];c.splice(o.index+t,0,{content:"",children:[],index:o.index+t,level:o.level,focus:!1});for(let t=o.index;t<c.length;t++)c[t].index=t;n.children=[...c],e(0,l)}return t.$$set=t=>{"flow"in t&&e(0,l=t.flow)},t.$$.update=()=>{1&t.$$.dirty&&(l.lastFocus,setTimeout((()=>{if(l.lastFocus&&l.lastFocus.length>1){let t=r(l.lastFocus);e(2,s=t?.focus)}}),0)),1&t.$$.dirty&&(l.focus?e(3,c="var(--accent)"):e(3,c="none"))},[l,o,s,c,function(){l.focus&&(e(0,l.focus=!1,l),e(0,l))},function(){l.focus||(e(0,l.focus=!0,l),e(0,l))},function(t){"Enter"!=t.key&&"ArrowDown"!=t.key||(t.preventDefault(),l.children.length>0&&e(0,l.children[0].focus=!0,l))},function(){if(!s)return;let t=r(l.lastFocus,1),n=r(l.lastFocus),o=[...t.children];if(o.length>1||t.level>=1){o.splice(n.index,1);for(let t=n.index;t<o.length;t++)o[t].index=t;o.length<=0?t.focus=!0:n.index>=o.length?o[o.length-1].focus=!0:o[n.index].focus=!0,t.children=[...o],e(0,l)}},function(){if(!s)return;let t=r(l.lastFocus),n=[...t.children];if(t.level<l.columns.length){n.splice(0,0,{content:"",children:[],index:0,level:t.level+1,focus:!1});for(let t=0;t<n.length;t++)n[t].index=t;t.children=[...n],e(0,l)}},i,function(n){t.$$.not_equal(l.content,n)&&(l.content=n,e(0,l))},function(t){B[t?"unshift":"push"]((()=>{o=t,e(1,o)}))},()=>i(0),()=>i(1)]}class an extends wt{constructor(t){super(),vt(this,t,un,sn,c,{flow:0})}}function dn(n){let e;return{c(){e=y("no name")},m(t,n){m(t,e,n)},p:t,d(t){t&&v(e)}}}function fn(t){let n;return{c(){n=y(t[0])},m(t,e){m(t,n,e)},p(t,e){1&e&&L(n,t[0])},d(t){t&&v(n)}}}function $n(t){let n,e,o,l;return e=new jt({props:{background:t[2]}}),{c(){n=k("div"),ht(e.$$.fragment),C(n,"class","line svelte-1jqg6t1")},m(t,o){m(t,n,o),pt(e,n,null),l=!0},p(t,n){const o={};4&n&&(o.background=t[2]),e.$set(o)},i(t){l||(ct(e.$$.fragment,t),t&&(o||X((()=>{o=ut(n,Rt,{}),o.start()}))),l=!0)},o(t){st(e.$$.fragment,t),l=!1},d(t){t&&v(n),gt(e)}}}function hn(t){let n,e,o,l,r,c,s;function i(t,n){return t[0]?fn:dn}let u=i(t),a=u(t),d=t[1]&&$n(t);return{c(){n=k("div"),e=k("button"),a.c(),o=b(),d&&d.c(),C(e,"class","svelte-1jqg6t1"),M(e,"selected",t[1]),M(e,"empty",0==t[0].length),C(n,"class","top svelte-1jqg6t1")},m(l,i){m(l,n,i),h(n,e),a.m(e,null),h(n,o),d&&d.m(n,null),r=!0,c||(s=x(e,"click",t[3]),c=!0)},p(t,[o]){u===(u=i(t))&&a?a.p(t,o):(a.d(1),a=u(t),a&&(a.c(),a.m(e,null))),2&o&&M(e,"selected",t[1]),1&o&&M(e,"empty",0==t[0].length),t[1]?d?(d.p(t,o),2&o&&ct(d,1)):(d=$n(t),d.c(),ct(d,1),d.m(n,null)):d&&(lt(),st(d,1,1,(()=>{d=null})),rt())},i(t){r||(ct(d),l||X((()=>{l=ut(n,Dt,{}),l.start()})),r=!0)},o(t){st(d),r=!1},d(t){t&&v(n),a.d(),d&&d.d(),c=!1,s()}}}function pn(t,n,e){let o,{content:l}=n,{selected:r}=n;return t.$$set=t=>{"content"in t&&e(0,l=t.content),"selected"in t&&e(1,r=t.selected)},t.$$.update=()=>{2&t.$$.dirty&&e(2,o=r?"var(--accent)":"none")},[l,r,o,function(n){T.call(this,t,n)}]}class gn extends wt{constructor(t){super(),vt(this,t,pn,hn,c,{content:0,selected:1})}}function mn(t){let n,e,o,l,r,c,s,i;return e=new Lt({props:{name:"add",size:"1em"}}),{c(){n=k("button"),ht(e.$$.fragment),o=b(),l=k("div"),r=y(t[0]),C(l,"class","content svelte-nofrie"),C(n,"class","top svelte-nofrie")},m(u,a){m(u,n,a),pt(e,n,null),h(n,o),h(n,l),h(l,r),c=!0,s||(i=x(n,"click",t[1]),s=!0)},p(t,[n]){(!c||1&n)&&L(r,t[0])},i(t){c||(ct(e.$$.fragment,t),c=!0)},o(t){st(e.$$.fragment,t),c=!1},d(t){t&&v(n),gt(e),s=!1,i()}}}function vn(t,n,e){let{content:o}=n;return t.$$set=t=>{"content"in t&&e(0,o=t.content)},[o,function(n){T.call(this,t,n)}]}class wn extends wt{constructor(t){super(),vt(this,t,vn,mn,c,{content:0})}}const{document:kn}=dt;function yn(t,n,e){const o=t.slice();return o[17]=n[e],o[18]=n,o[19]=e,o}function bn(n){let e,o,l,r,c,s,i,u;return e=new en({props:{name:"download"}}),e.$on("click",n[6]),c=new en({props:{name:"upload"}}),c.$on("click",En),{c(){ht(e.$$.fragment),o=b(),l=k("input"),r=b(),ht(c.$$.fragment),C(l,"id","uploadId"),C(l,"type","file"),l.hidden=!0},m(t,a){pt(e,t,a),m(t,o,a),m(t,l,a),m(t,r,a),pt(c,t,a),s=!0,i||(u=x(l,"change",n[8]),i=!0)},p:t,i(t){s||(ct(e.$$.fragment,t),ct(c.$$.fragment,t),s=!0)},o(t){st(e.$$.fragment,t),st(c.$$.fragment,t),s=!1},d(t){gt(e,t),t&&v(o),t&&v(l),t&&v(r),gt(c,t),i=!1,u()}}}function xn(t){let n,e,o;function l(n){t[9](n,t[17])}let r={selected:t[19]==t[0]};return void 0!==t[17].content&&(r.content=t[17].content),n=new gn({props:r}),B.push((()=>$t(n,"content",l))),n.$on("click",(function(){return t[10](t[19])})),{c(){ht(n.$$.fragment)},m(t,e){pt(n,t,e),o=!0},p(o,l){t=o;const r={};1&l&&(r.selected=t[19]==t[0]),!e&&2&l&&(e=!0,r.content=t[17].content,J((()=>e=!1))),n.$set(r)},i(t){o||(ct(n.$$.fragment,t),o=!0)},o(t){st(n.$$.fragment,t),o=!1},d(t){gt(n,t)}}}function Cn(t){let n,e,o;function l(n){t[13](n)}let r={};return void 0!==t[1][t[0]]&&(r.flow=t[1][t[0]]),n=new an({props:r}),B.push((()=>$t(n,"flow",l))),{c(){ht(n.$$.fragment)},m(t,e){pt(n,t,e),o=!0},p(t,o){const l={};!e&&3&o&&(e=!0,l.flow=t[1][t[0]],J((()=>e=!1))),n.$set(l)},i(t){o||(ct(n.$$.fragment,t),o=!0)},o(t){st(n.$$.fragment,t),o=!1},d(t){gt(n,t)}}}function Ln(t){let n,e,o,l;function r(n){t[14](n)}let c={};return void 0!==t[1][t[0]]&&(c.root=t[1][t[0]]),e=new Wt({props:c}),B.push((()=>$t(e,"root",r))),e.$on("focusFlow",t[3]),{c(){n=k("div"),ht(e.$$.fragment),C(n,"class","flow svelte-1aj0oty")},m(t,o){m(t,n,o),pt(e,n,null),l=!0},p(t,n){const l={};!o&&3&n&&(o=!0,l.root=t[1][t[0]],J((()=>o=!1))),e.$set(l)},i(t){l||(ct(e.$$.fragment,t),l=!0)},o(t){st(e.$$.fragment,t),l=!1},d(t){t&&v(n),gt(e)}}}function _n(n){let e,o,r,s,i,u,a,d,f,$,p,g,y,L,_,j,E,F,z,A=n[0];i=new rn({props:{$$slots:{default:[bn]},$$scope:{ctx:n}}});let R=n[1],S=[];for(let t=0;t<R.length;t+=1)S[t]=xn(yn(n,R,t));const D=t=>st(S[t],1,1,(()=>{S[t]=null}));p=new wn({props:{content:"on case"}}),p.$on("click",n[11]),y=new wn({props:{content:"off case"}}),y.$on("click",n[12]);let N=n[1].length>0&&Cn(n),P=Ln(n);return{c(){e=b(),o=k("main"),r=k("div"),s=k("div"),ht(i.$$.fragment),u=b(),a=k("div"),d=k("ul");for(let t=0;t<S.length;t+=1)S[t].c();f=b(),$=k("div"),ht(p.$$.fragment),g=b(),ht(y.$$.fragment),L=b(),_=k("div"),N&&N.c(),j=b(),P.c(),C(s,"class","header svelte-1aj0oty"),C($,"class","add-tab svelte-1aj0oty"),C(d,"class","svelte-1aj0oty"),C(a,"class","tabs svelte-1aj0oty"),C(r,"class","sidebar svelte-1aj0oty"),C(_,"class","title svelte-1aj0oty"),C(o,"style","--transition-speed: 300ms;"),C(o,"class","svelte-1aj0oty"),M(o,"dark",Mn)},m(t,l){m(t,e,l),m(t,o,l),h(o,r),h(r,s),pt(i,s,null),h(r,u),h(r,a),h(a,d);for(let t=0;t<S.length;t+=1)S[t].m(d,null);h(d,f),h(d,$),pt(p,$,null),h($,g),pt(y,$,null),h(o,L),h(o,_),N&&N.m(_,null),h(o,j),P.m(o,null),E=!0,F||(z=[x(kn.body,"keydown",n[5]),x(kn.body,"dragenter",jn),x(kn.body,"drop",n[7])],F=!0)},p(n,[e]){const l={};if(1048576&e&&(l.$$scope={dirty:e,ctx:n}),i.$set(l),7&e){let t;for(R=n[1],t=0;t<R.length;t+=1){const o=yn(n,R,t);S[t]?(S[t].p(o,e),ct(S[t],1)):(S[t]=xn(o),S[t].c(),ct(S[t],1),S[t].m(d,f))}for(lt(),t=R.length;t<S.length;t+=1)D(t);rt()}n[1].length>0?N?(N.p(n,e),2&e&&ct(N,1)):(N=Cn(n),N.c(),ct(N,1),N.m(_,null)):N&&(lt(),st(N,1,1,(()=>{N=null})),rt()),1&e&&c(A,A=n[0])?(lt(),st(P,1,1,t),rt(),P=Ln(n),P.c(),ct(P),P.m(o,null)):P.p(n,e)},i(t){if(!E){ct(i.$$.fragment,t);for(let t=0;t<R.length;t+=1)ct(S[t]);ct(p.$$.fragment,t),ct(y.$$.fragment,t),ct(N),ct(P),E=!0}},o(t){st(i.$$.fragment,t),S=S.filter(Boolean);for(let t=0;t<S.length;t+=1)st(S[t]);st(p.$$.fragment,t),st(y.$$.fragment,t),st(N),st(P),E=!1},d(t){t&&v(e),t&&v(o),gt(i),w(S,t),gt(p),gt(y),N&&N.d(),P.d(t),F=!1,l(z)}}}let Mn=1;function jn(t){t.preventDefault()}function En(){document.getElementById("uploadId").click()}function Fn(t,n,e){window.document.body.classList.toggle("dark");let o=0;function l(t){e(0,o=t),c()}let r=[];function c(){let t=function(t,n){n||(n=0);let e=r[o];if(t.length>1)for(let o=1;o<t.length-n;o++)e=e.children[t[o]];return e}(r[o]?.lastFocus);t?t.focus=!0:e(1,r[o].children[0].focus=!0,r),e(1,r)}function s(t){let n;n=t?["1NC","2AC","2NC/1NR","1AR","2NR","2AR"]:["1AC","1NC","2AC","2NC/1NR","1AR","2NR","2AR"],r.push({content:"",level:0,columns:n,neg:t,focus:!0,index:r.length,lastFocus:void 0,children:[{content:"",level:1,index:0,children:[]}]}),e(0,o=r.length-1),e(1,r)}function i(t){e(1,r=JSON.parse(t))}s(!1),window.addEventListener("dragover",(function(t){t.preventDefault()}),!1),window.addEventListener("drop",(function(t){t.preventDefault()}),!1);return[o,r,l,c,s,function(t){t.ctrlKey&&t.shiftKey&&"N"==t.key?(t.preventDefault(),s(!1)):t.ctrlKey&&"n"==t.key&&(t.preventDefault(),s(!0))},function(){let t=JSON.stringify(r),n=document.createElement("a");n.setAttribute("href","data:text/json;charset=utf-8, "+encodeURIComponent(t)),n.setAttribute("download","flow.json"),document.body.appendChild(n),n.click(),document.body.removeChild(n)},function(t){t.preventDefault();let n=t.dataTransfer.files[0],e=new FileReader;e.onload=function(t){i(t.target.result)},e.readAsText(n,"UTF-8")},function(){let t=document.getElementById("uploadId").files[0],n=new FileReader;n.onload=function(t){i(t.target.result)},n.readAsText(t,"UTF-8")},function(n,o){t.$$.not_equal(o.content,n)&&(o.content=n,e(1,r))},t=>l(t),()=>s(!1),()=>s(!0),function(n){t.$$.not_equal(r[o],n)&&(r[o]=n,e(1,r))},function(n){t.$$.not_equal(r[o],n)&&(r[o]=n,e(1,r))}]}return new class extends wt{constructor(t){super(),vt(this,t,Fn,_n,c,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
