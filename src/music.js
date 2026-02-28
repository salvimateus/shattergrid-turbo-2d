// ═══ BACKGROUND MUSIC + MUFFLE (Balatro-style) ═══
let musicPlaying=false,musicNodes=[],musicGain=null,musicBPM=130,musicStep=0,musicInterval=null
let musicMuffleFilter=null,musicMuffleGain=null,musicDistortion=null,isMuffled=false
function _makeMuffleDistCurve(amt){const n=256,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=(Math.PI+amt)*x/(Math.PI+amt*Math.abs(x))}return c}
function startMusic(){
  if(musicPlaying||!actx)return;musicPlaying=true;musicStep=0
  musicGain=actx.createGain();musicGain.gain.setValueAtTime(1.0,actx.currentTime)
  musicMuffleFilter=actx.createBiquadFilter();musicMuffleFilter.type='lowpass'
  musicMuffleFilter.frequency.setValueAtTime(20000,actx.currentTime);musicMuffleFilter.Q.setValueAtTime(0.7,actx.currentTime)
  musicDistortion=actx.createWaveShaper();musicDistortion.curve=_makeMuffleDistCurve(0);musicDistortion.oversample='2x'
  musicMuffleGain=actx.createGain();musicMuffleGain.gain.setValueAtTime(0.55,actx.currentTime)
  musicGain.connect(musicMuffleFilter);musicMuffleFilter.connect(musicDistortion);musicDistortion.connect(musicMuffleGain);musicMuffleGain.connect(actx.destination)
  if(isMuffled)_applyMuffle()
  const bn0=[55,55,65.4,55,73.4,55,65.4,82.4],ln0=[220,330,440,330,293,440,523,440,261,392,523,392,349,523,659,523],hh0=[1,0,1,1,1,0,1,0]
  const bn1=[55,73.4,55,82.4,65.4,98,73.4,110],ln1=[330,440,523,659,440,523,659,784,349,466,523,698,466,587,698,880],hh1=[1,1,1,1,1,0,1,1]
  const bn2=[73.4,82.4,98,110,82.4,110,130.8,110],ln2=[440,523,659,784,523,659,880,1047,466,587,698,880,587,784,1047,1175],hh2=[1,1,1,1,1,1,1,1]
  const bA=[bn0,bn1,bn2],lA=[ln0,ln1,ln2],hA=[hh0,hh1,hh2],bpms=[130,155,180]
  const bV=[0.12,0.18,0.28],lbV=[0.02,0.04,0.08],lmV=[0.06,0.10,0.16],hhV=[0.04,0.06,0.10],kV=[0.15,0.20,0.32]
  const mi=musicIntensity,sd=60/bpms[mi]/2
  musicInterval=setInterval(()=>{
    if(!actx||gameState==='start')return;const t=actx.currentTime,bn=bA[mi],ln=lA[mi],hh=hA[mi]
    if(musicStep%2===0){const i=Math.floor(musicStep/2)%bn.length,o=actx.createOscillator(),g=actx.createGain();o.type=mi>=2?'sawtooth':'triangle';o.frequency.setValueAtTime(bn[i],t);g.gain.setValueAtTime(bV[mi],t);g.gain.exponentialRampToValueAtTime(0.001,t+sd*1.8);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+sd*1.8)}
    const li=musicStep%ln.length,ol=actx.createOscillator(),gl=actx.createGain();ol.type='square';ol.frequency.setValueAtTime(ln[li],t);const v=Math.min(lmV[mi],lbV[mi]+musicStep*0.0003);gl.gain.setValueAtTime(v,t);gl.gain.exponentialRampToValueAtTime(0.001,t+sd*0.8);ol.connect(gl);gl.connect(musicGain);ol.start(t);ol.stop(t+sd*0.8)
    if(mi>=2&&musicStep%4===0){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(bn[Math.floor(musicStep/4)%bn.length]/2,t);g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+sd*3.5);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+sd*3.5)}
    if(mi>=1&&musicStep%2===1){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(ln[li]*2,t);g.gain.setValueAtTime(mi>=2?0.05:0.025,t);g.gain.exponentialRampToValueAtTime(0.001,t+sd*0.5);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+sd*0.5)}
    if(hh[musicStep%hh.length]){const n=actx.sampleRate*0.03,bf=actx.createBuffer(1,n,actx.sampleRate),d=bf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=actx.createBufferSource(),g=actx.createGain();s.buffer=bf;g.gain.setValueAtTime(hhV[mi],t);g.gain.exponentialRampToValueAtTime(0.001,t+0.04);s.connect(g);g.connect(musicGain);s.start(t)}
    const kI=mi>=2?2:4;if(musicStep%kI===0){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(mi>=2?180:150,t);o.frequency.exponentialRampToValueAtTime(30,t+0.15);g.gain.setValueAtTime(kV[mi],t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+0.2)}
    if(mi>=1&&(musicStep+4)%8===0){const n=actx.sampleRate*0.06,bf=actx.createBuffer(1,n,actx.sampleRate),d=bf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.5);const s=actx.createBufferSource(),g=actx.createGain();s.buffer=bf;g.gain.setValueAtTime(mi>=2?0.12:0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.08);s.connect(g);g.connect(musicGain);s.start(t)}
    musicStep++
  },sd*1000)
}
function stopMusic(){
  musicPlaying=false;isMuffled=false
  if(musicInterval){clearInterval(musicInterval);musicInterval=null}
  if(musicMuffleGain){try{musicMuffleGain.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+0.5)}catch(e){}}
}
function _applyMuffle(){
  if(!actx||!musicMuffleFilter||!musicMuffleGain)return;const t=actx.currentTime
  musicMuffleFilter.frequency.cancelScheduledValues(t);musicMuffleFilter.frequency.setValueAtTime(musicMuffleFilter.frequency.value,t);musicMuffleFilter.frequency.linearRampToValueAtTime(200,t+0.5)
  musicMuffleFilter.Q.cancelScheduledValues(t);musicMuffleFilter.Q.setValueAtTime(musicMuffleFilter.Q.value,t);musicMuffleFilter.Q.linearRampToValueAtTime(6,t+0.5)
  if(musicDistortion)musicDistortion.curve=_makeMuffleDistCurve(50)
  musicMuffleGain.gain.cancelScheduledValues(t);musicMuffleGain.gain.setValueAtTime(musicMuffleGain.gain.value,t);musicMuffleGain.gain.linearRampToValueAtTime(0.22,t+0.5)
}
function _removeMuffle(){
  if(!actx||!musicMuffleFilter||!musicMuffleGain)return;const t=actx.currentTime
  musicMuffleFilter.frequency.cancelScheduledValues(t);musicMuffleFilter.frequency.setValueAtTime(musicMuffleFilter.frequency.value,t);musicMuffleFilter.frequency.linearRampToValueAtTime(20000,t+0.3)
  musicMuffleFilter.Q.cancelScheduledValues(t);musicMuffleFilter.Q.setValueAtTime(musicMuffleFilter.Q.value,t);musicMuffleFilter.Q.linearRampToValueAtTime(0.7,t+0.3)
  if(musicDistortion)musicDistortion.curve=_makeMuffleDistCurve(0)
  musicMuffleGain.gain.cancelScheduledValues(t);musicMuffleGain.gain.setValueAtTime(musicMuffleGain.gain.value,t);musicMuffleGain.gain.linearRampToValueAtTime(0.55,t+0.3)
}
function muffleMusic(){if(!musicPlaying)return;isMuffled=true;_applyMuffle()}
function unmuffleMusic(){if(!musicPlaying)return;isMuffled=false;_removeMuffle()}
