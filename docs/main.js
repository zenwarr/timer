!function(){"use strict";var t;!function(t){t[t.Continue=0]="Continue",t[t.Stopped=1]="Stopped",t[t.Paused=2]="Paused",t[t.Elapsed=3]="Elapsed"}(t||(t={}));const e=6e5;let n=new class{constructor(t){this.calculatedEnd=0,this.msLeft=0,this.running=!1,this.stopRequested=!1,this.pauseRequested=!1,this.lastDuration=e,this.msLeft=t}stop(){this.stopRequested=!0,this.msLeft=0,this.setDuration(this.lastDuration)}reschedule(){this.calculatedEnd=performance.now()+this.msLeft}toggle(){return this.running?(this.pauseRequested=!0,t.Paused):(this.running=!0,this.pauseRequested=!1,this.stopRequested=!1,this.reschedule(),t.Continue)}tick(){let e=Math.max(this.calculatedEnd-performance.now(),0);return e<=0?(this.running=!1,this.msLeft=0,t.Elapsed):this.stopRequested?(this.running=!1,t.Stopped):this.pauseRequested?(this.running=!1,this.msLeft=e,t.Paused):(this.msLeft=e,t.Continue)}get canStop(){return(this.running||this.msLeft>0)&&this.msLeft!==this.lastDuration}setDuration(t){this.msLeft=t,this.lastDuration=t,this.reschedule()}}(e);new class{constructor(){this._input=document.querySelector("#timer-input"),this._input&&this._input.addEventListener("input",this.onInputChange.bind(this)),window.addEventListener("beforeunload",this.onBeforeUnload.bind(this)),this.updateTimeDisplay(),document.body.addEventListener("click",t=>{let e=t.target;if(e instanceof HTMLElement)if(e.classList.contains("template-button")){let t=e.dataset.template;t&&this.onChangeTemplate(t)}else e.classList.contains("stop")?this.onStop():e.classList.contains("toggle")&&this.onToggle()})}onBeforeUnload(t){n.canStop&&t.preventDefault()}onInputChange(t){let e=t.target.textContent||"";this._previousInputValue;this._previousInputValue=e}onStop(){n.stop(),this.updateTimeDisplay()}onToggle(){n.toggle()===t.Continue&&s(this.onTimerIteration.bind(this))}onChangeTemplate(t){n.setDuration(function(t){let e=t.slice(-1),n=1;switch(e){case"s":n=1e3;break;case"m":n=6e4;break;case"h":n=36e5}let s=parseInt(t);if(isNaN(s))return 0;return s*n}(t)),this.updateTimeDisplay()}onTimerIteration(){let e=n.tick();switch(this.updateTimeDisplay(),e){case t.Elapsed:!async function(t=2){let e=document.getElementById("beep-sound");if(e&&e instanceof HTMLAudioElement)for(let n=0;n<t;++n)await a(e)}();break;case t.Continue:s(this.onTimerIteration.bind(this))}}updateTimeDisplay(){let t=n.msLeft;if(this._input){let e=i(t);this._input.textContent=i(t),this._previousInputValue=e}document.title=t>0?i(t,!1)+" - Timer":"Timer",this.updateState()}updateState(){let t=document.querySelector(".toggle");t&&(t.textContent=n.running?"Pause":"Start");let e=document.querySelector(".stop");e&&(e.disabled=!n.canStop)}};function s(t){document.hidden?setTimeout(t,100):requestAnimationFrame(t)}function i(t,e=!0){let n=(""+Math.floor(t/36e5)).padStart(2,"0"),s=(""+Math.floor(t/6e4%60)).padStart(2,"0"),i=(""+Math.floor(t/1e3)%60).padStart(2,"0"),a=(""+Math.floor(t%1e3)).padStart(3,"0");return e?`${n}:${s}:${i}.${a}`:`${n}:${s}:${i}`}function a(t){return new Promise((e,n)=>{function s(){t.removeEventListener("ended",s),e()}t.addEventListener("ended",s),t.play().catch(t=>{removeEventListener("ended",s),n(t)})})}}();
