let soundEnabled = true;

let audioCtx = null;


/* ==========================================
   ENSURE AUDIO CONTEXT
   Created lazily on first use (inside a click's
   call stack, so browsers allow it to start).
========================================== */

function ensureAudioContext() {

    if (!audioCtx) {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    return audioCtx;
}


/* ==========================================
   PLAY A SINGLE SYNTHESIZED TONE
========================================== */

function playTone({
    freq = 440,
    duration = 0.15,
    type = "sine",
    volume = 0.2,
    delay = 0,
    slideTo = null
}) {

    const ctx = ensureAudioContext();

    if (!ctx) {
        return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;

    osc.frequency.setValueAtTime(
        freq,
        ctx.currentTime + delay
    );

    if (slideTo !== null) {

        osc.frequency.exponentialRampToValueAtTime(
            slideTo,
            ctx.currentTime + delay + duration
        );
    }

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);

    gain.gain.linearRampToValueAtTime(
        volume,
        ctx.currentTime + delay + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + delay + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
}


/* ==========================================
   PLAY SOUND (by game event name)
========================================== */

function playSound(kind) {

    if (!soundEnabled) {
        return;
    }

    switch (kind) {

        case "select":
            playTone({ freq: 500, duration: .05, type: "sine", volume: .08 });
            break;

        case "move":
            playTone({ freq: 180, duration: .09, type: "triangle", volume: .16, filterFreq: 900 });
            playTone({ freq: 110, duration: .12, type: "sine", volume: .1, delay: .02 });
            break;

        case "capture":
            playTone({ freq: 140, duration: .14, type: "sawtooth", volume: .2, slideTo: 50, filterFreq: 1200 });
            playTone({ freq: 70, duration: .2, type: "sine", volume: .18, delay: .02 });
            break;

        case "castle":
            playTone({ freq: 160, duration: .1, type: "triangle", volume: .15, filterFreq: 800 });
            playTone({ freq: 200, duration: .12, type: "triangle", volume: .15, delay: .09, filterFreq: 800 });
            break;

        case "promote":
            playTone({ freq: 392, duration: .12, type: "sine", volume: .15 });
            playTone({ freq: 523, duration: .14, type: "sine", volume: .16, delay: .1 });
            playTone({ freq: 659, duration: .18, type: "sine", volume: .17, delay: .2 });
            playTone({ freq: 784, duration: .22, type: "sine", volume: .15, delay: .32 });
            break;

        case "check":
            playTone({ freq: 520, duration: .12, type: "triangle", volume: .16 });
            playTone({ freq: 440, duration: .16, type: "triangle", volume: .16, delay: .13 });
            break;

        case "checkmate":
            playTone({ freq: 220, duration: .35, type: "sawtooth", volume: .2, filterFreq: 1000 });
            playTone({ freq: 185, duration: .4, type: "sawtooth", volume: .2, delay: .2, filterFreq: 900 });
            playTone({ freq: 98, duration: .7, type: "sawtooth", volume: .22, delay: .45, filterFreq: 700 });
            break;

        case "draw":
            playTone({ freq: 300, duration: .25, type: "sine", volume: .13 });
            playTone({ freq: 300, duration: .25, type: "sine", volume: .13, delay: .3 });
            break;
    }
}
