"use strict";class t{constructor(t){this.calculatedEnd=0,this.msLeft=0,this.running=!1,this.stopRequested=!1,this.pauseRequested=!1,this.msLeft=t,this.lastDuration=t}stop(){this.stopRequested=!0,this.msLeft=0,this.setDuration(this.lastDuration)}reschedule(){this.calculatedEnd=performance.now()+this.msLeft}toggle(){return this.running?(this.pauseRequested=!0,e.Paused):(this.running=!0,this.pauseRequested=!1,this.stopRequested=!1,this.reschedule(),e.Continue)}tick(){let t=Math.max(this.calculatedEnd-performance.now(),0);return t<=0?(this.running=!1,this.msLeft=0,e.Elapsed):this.stopRequested?(this.running=!1,e.Stopped):this.pauseRequested?(this.running=!1,this.msLeft=t,e.Paused):(this.msLeft=t,e.Continue)}get canStop(){return(this.running||this.msLeft>0)&&this.msLeft!==this.lastDuration}get canToggle(){return this.running||this.msLeft>0}setDuration(t){this.msLeft=t,this.lastDuration=t,this.reschedule()}}var e;!function(t){t[t.Continue=0]="Continue",t[t.Stopped=1]="Stopped",t[t.Paused=2]="Paused",t[t.Elapsed=3]="Elapsed"}(e||(e={}));function s(t){setTimeout(t,10)}function i(t,e=!0){let s=(""+Math.floor(t/36e5)).padStart(2,"0"),i=(""+Math.floor(t/6e4%60)).padStart(2,"0"),n=(""+Math.floor(t/1e3)%60).padStart(2,"0"),u=(""+Math.floor(t%1e3/10)).padStart(2,"0");return e?`${s}:${i}:${n}.${u}`:`${s}:${i}:${n}`}function n(t){return new Promise((e,s)=>{function i(){t.removeEventListener("ended",i),e()}t.addEventListener("ended",i),t.play().catch(t=>{removeEventListener("ended",i),s(t)})})}function u(t){return/^[0-9]+$/.test(t)?+t:void 0}new class{constructor(){this.isInputDirty=!1,this.isInputValid=!0,this.counter=new t(6e5),this.input=document.querySelector("#timer-input"),this.input.addEventListener("blur",this.applyInputValue.bind(this)),this.input.addEventListener("input",this.onInputChange.bind(this)),window.addEventListener("beforeunload",this.onBeforeUnload.bind(this)),this.updateTimeDisplay(),document.body.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement)if(e.classList.contains("template-button")){let t=e.dataset.template;t&&this.onChangeTemplate(t)}else e.classList.contains("stop")?this.onStop():e.classList.contains("toggle")&&this.onToggle()})}onBeforeUnload(t){this.counter.canStop&&t.preventDefault()}onInputChange(t){this.isInputDirty=!0}applyInputValue(){if(!this.isInputDirty)return;let{parsed:t,success:e}=function(t){let e=t.indexOf(".");if(e<0)return{parsed:void 0,success:!1};let s=t.slice(e+1);if(2!==s.length)return{parsed:void 0,success:!1};let i=u(s);if(null==i)return{parsed:void 0,success:!1};let n=t.slice(0,e).split(":");if(n.some(t=>t.length>2))return{parsed:void 0,success:!1};let a=n.map(t=>u(t)).reverse();if(a.some(t=>null==t||t>=60))return{parsed:void 0,success:!1};if(a.length>3||a.length<1)return{parsed:void 0,success:!1};let r=a,o=10*i+1e3*r[0];r.length>=2&&(o+=1e3*r[1]*60);r.length>=3&&(o+=1e3*r[2]*60*60);return{parsed:o,success:!0}}(this.input.value);this.setValidationStatus(e),this.isInputDirty=!1,null!=t&&(this.counter.setDuration(t),this.updateState())}setValidationStatus(t){t!==this.isInputValid&&(this.isInputValid=t,this.input.classList.toggle("timer-input__time--invalid",!t))}onStop(){this.counter.stop(),this.updateTimeDisplay()}onToggle(){if(!this.isInputValid)return;this.counter.toggle()===e.Continue&&s(this.onTimerIteration.bind(this))}onChangeTemplate(t){this.counter.setDuration(function(t){let e=t.slice(-1),s=1;switch(e){case"s":s=1e3;break;case"m":s=6e4;break;case"h":s=36e5}let i=parseInt(t);if(isNaN(i))return 0;return i*s}(t)),this.updateTimeDisplay()}onTimerIteration(){let t=this.counter.tick();switch(this.updateTimeDisplay(),t){case e.Elapsed:!async function(t=2){let e=document.getElementById("beep-sound");if(e&&e instanceof HTMLAudioElement)for(let s=0;s<t;++s)await n(e)}();break;case e.Continue:s(this.onTimerIteration.bind(this))}}updateTimeDisplay(){console.log("updating time display",this.counter.msLeft);let t=this.counter.msLeft;this.input.value=i(t),this.isInputDirty=!1,this.setValidationStatus(!0),document.title=t>0?i(t,!1)+" - Timer":"Timer",this.updateState()}updateState(){let t=document.querySelector(".toggle");t&&(t.textContent=this.counter.running?"Pause":"Start",t.disabled=!this.counter.canToggle);let e=document.querySelector(".stop");e&&(e.disabled=!this.counter.canStop),this.input.readOnly=this.counter.running}};
