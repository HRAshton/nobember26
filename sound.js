/* v0.4 original, synthesized UI effects; no copyrighted GW2 audio assets. */
(function () {
  'use strict';
  const STORE = 'gw2-black-lion-audio-v1';
  let enabled = false, context = null;
  try { enabled = localStorage.getItem(STORE) === 'on'; } catch (_) { /* private browsing */ }
  function getContext() {
    if (!enabled) return null;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!context) context = new Ctx();
      if (context.state === 'suspended') context.resume().catch(() => {});
      return context;
    } catch (_) { return null; }
  }
  function tone(ctx, freq, delay, length, options={}) {
    const at=ctx.currentTime+delay;
    const oscillator=ctx.createOscillator(), envelope=ctx.createGain();
    oscillator.type=options.wave||'sine';
    oscillator.frequency.setValueAtTime(Math.max(30,freq),at);
    if (options.end) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,options.end),at+length);
    envelope.gain.setValueAtTime(0.0001,at);
    envelope.gain.exponentialRampToValueAtTime(options.volume||0.025,at+Math.min(.03,length/3));
    envelope.gain.exponentialRampToValueAtTime(.0001,at+length);
    oscillator.connect(envelope);envelope.connect(ctx.destination);
    oscillator.start(at);oscillator.stop(at+length+.01);
  }
  // Soft synthesized rustle, rather than imported music or game recordings.
  function rustle(ctx,delay=.0,length=.23,volume=.018){
    const len=Math.ceil(ctx.sampleRate*length),buffer=ctx.createBuffer(1,len,ctx.sampleRate),channel=buffer.getChannelData(0);
    for(let i=0;i<len;i++)channel[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.4);
    const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=1200;gain.gain.value=volume;
    noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
    noise.start(ctx.currentTime+delay);
  }
  function play(event){
    const ctx=getContext();if (!ctx) return;
    try {
      if(event==='select')tone(ctx,390,0,.075,{wave:'triangle',volume:.012});
      if(event==='redeem'){tone(ctx,510,0,.14,{volume:.02});tone(ctx,760,.085,.23,{volume:.026});}
      if(event==='purchase'){tone(ctx,260,0,.10,{wave:'triangle',volume:.02});tone(ctx,420,.11,.16,{wave:'triangle',volume:.023});}
      if(event==='sell'){rustle(ctx,0,.19,.015);tone(ctx,610,.08,.17,{volume:.018});}
      if(event==='exchange'){tone(ctx,370,0,.10,{volume:.018});tone(ctx,600,.12,.20,{volume:.021});}
      if(event==='error')tone(ctx,220,0,.15,{wave:'triangle',volume:.016,end:180});
      if(event==='open'){rustle(ctx,0,.44,.035);tone(ctx,122,0,.47,{wave:'triangle',volume:.045,end:270});tone(ctx,520,.42,.35,{volume:.031,end:920});}
      if(event==='legendary'){rustle(ctx,0,.65,.045);tone(ctx,105,0,.65,{wave:'triangle',volume:.050,end:190});for(let i=0;i<4;i++)tone(ctx,[330,440,587,880][i],.38+i*.17,.43,{volume:.027});}
      if(event==='reveal'){tone(ctx,660,0,.29,{volume:.021,end:990});}
      if(event==='bonus'){tone(ctx,340,0,.25,{volume:.021});tone(ctx,620,.15,.24,{volume:.022});tone(ctx,930,.3,.32,{volume:.026});}
    } catch (_) { /* audio is an optional enhancement */ }
  }
  function isEnabled(){return enabled;}
  function toggle(){
    enabled=!enabled;
    try{localStorage.setItem(STORE,enabled?'on':'off');}catch(_){}
    if(enabled)play('select');
    return enabled;
  }
  window.GW2Sounds={play,isEnabled,toggle};
})();
