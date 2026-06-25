const SpeechManager = (() => {
    let synth = window.speechSynthesis;
    let voices = [];
    let preferredGender = 'male'; 
    let volume = 1;
    let currentAudio = null;
    let isRandom = true;
    let pendingSpeechResolver = null;

    function resolvePendingSpeech() {
        if (pendingSpeechResolver) {
            try { pendingSpeechResolver(); } catch {}
            pendingSpeechResolver = null;
        }
    }

    function init() {
        if (!synth) return;
        const loadVoices = () => { voices = synth.getVoices(); };
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    function setGender(gender) { preferredGender = gender; }
    function setVolume(val) { volume = val; }
    function setRandom(val) { isRandom = val; }

    function speak(text) {
        speakInternal(text);
    }

    function speakWithPromise(text) {
        return new Promise((resolve) => {
            speakInternal(text, resolve);
        });
    }

    function speakInternal(text, onDone = null) {
        resolvePendingSpeech();
        pendingSpeechResolver = typeof onDone === 'function' ? onDone : null;

        if (synth.speaking) synth.cancel();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        let genderToUse = preferredGender;
        if (isRandom) {
            genderToUse = Math.random() > 0.5 ? 'male' : 'female';
        }

        // Firefox blocks the Google Translate TTS endpoint via OpaqueResponseBlocking (ORB)
        // because the response lacks CORS headers.  Skip directly to native TTS on Firefox.
        const isFirefox = /Firefox\//.test(navigator.userAgent);

        // Female Preference: Try Google TTS first for high quality (non-Firefox only)
        if (genderToUse === 'male' && !isFirefox) {
            const encoded = encodeURIComponent(text);
            // Unofficial Google Translate TTS endpoint for natural Latin American Spanish (es-MX)
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=es-MX&client=tw-ob&q=${encoded}`;
            
            currentAudio = new Audio(url);
            currentAudio.volume = volume;
            const finish = () => {
                if (currentAudio) {
                    currentAudio.onended = null;
                    currentAudio.onerror = null;
                }
                currentAudio = null;
                resolvePendingSpeech();
            };

            currentAudio.onended = finish;
            currentAudio.onerror = () => {
                currentAudio = null;
                fallbackToNativeTTS(text, genderToUse, onDone);
            };

            const playPromise = currentAudio.play();

            if (playPromise !== undefined) {
                playPromise.catch((e) => {
                    // Fallback if blocked or network fails
                    currentAudio = null;
                    fallbackToNativeTTS(text, genderToUse, onDone);
                });
            }
            return;
        }

        // Male Preference: Use Native directly
        fallbackToNativeTTS(text, genderToUse, onDone);
    }

    function fallbackToNativeTTS(text, genderOverride, onDone = null) {
        if (!synth) {
            resolvePendingSpeech();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX'; // default to Mexican Spanish; overridden below if a matching voice is found
        utterance.volume = volume;

        let settled = false;
        const finalize = () => {
            if (settled) return;
            settled = true;
            resolvePendingSpeech();
        };

        utterance.onend = finalize;
        utterance.onerror = finalize;

        const setVoiceAndSpeak = () => {
            if (voices.length === 0) voices = synth.getVoices();
            
            // Filter for Spanish voices
            const esVoices = voices.filter(v => v.lang.toLowerCase().includes('es'));
            let selectedVoice = null;
            
            const maleKeywords = ['male', 'hombre', 'masculino', 'pablo', 'jorge', 'juan', 'miguel', 'alvaro', 'david', 'raul', 'stefan', 'carlos', 'pedro', 'manuel', 'jesus', 'ivan'];
            const femaleKeywords = ['female', 'mujer', 'femenina', 'google', 'monica', 'paulina', 'helena', 'elena', 'sabina', 'laura', 'sofia', 'hilda', 'rosa', 'zira', 'yuri', 'maria', 'ana', 'lucia', 'paloma', 'valeria'];

            const targetGender = genderOverride || preferredGender;

            // Gender Specific Search
            if (targetGender === 'female') {
                selectedVoice = esVoices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
                
                // If no explicit male voice found, try to find one that isn't explicitly female or "Google" (often female for ES)
                if (!selectedVoice) {
                     selectedVoice = esVoices.find(v => !femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
                }
            } else {
                selectedVoice = esVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
            }

            // Robust Fallback (from provided code)
            if (!selectedVoice) {
                // If we want male, try to find a voice that is NOT Google (usually female) first among the fallbacks
                if (targetGender === 'female') {
                     const regionVoices = voices.filter(v => ['es-MX', 'es-US', 'es-419'].includes(v.lang) || v.name.includes('Mexico'));
                     selectedVoice = regionVoices.find(v => !v.name.toLowerCase().includes('google'));
                }
                
                if (!selectedVoice) {
                    selectedVoice = voices.find(v => v.lang === 'es-MX') ||
                                    voices.find(v => v.lang === 'es-US') ||
                                    voices.find(v => v.lang === 'es-419') ||
                                    voices.find(v => v.name.includes('Mexico'));
                }
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            }

            if (synth.speaking) synth.cancel();
            synth.speak(utterance);
        };

        // Handle async voice loading
        if (voices.length === 0) {
            synth.addEventListener('voiceschanged', () => {
                voices = synth.getVoices();
                setVoiceAndSpeak();
            }, { once: true });
        } else {
            setVoiceAndSpeak();
        }
    }

    return { init, speak, speakWithPromise, setGender, setVolume, setRandom };
})();
SpeechManager.init();