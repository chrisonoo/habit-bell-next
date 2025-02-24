export const CONFIG = {
    // Session settings
    DEFAULT_SESSION_DURATION: 30,
    MAX_SESSION_DURATION: 120,
    STEP_SESSION_DURATION: 5,

    // Interval settings
    DEFAULT_MIN_INTERVAL: 5 * 60,
    DEFAULT_MAX_INTERVAL: 60 * 30,
    MIN_INTERVAL: 5 * 60,
    MAX_INTERVAL: 60 * 30,
    STEP_INTERVAL: 5 * 60,

    // Pause durations
    DEFAULT_PAUSE1_DURATION: 1.2,
    MAX_PAUSE1_DURATION: 2,
    MIN_PAUSE1_DURATION: 0,
    STEP_PAUSE1_DURATION: 0.1,
    DEFAULT_PAUSE2_DURATION: 0.8,
    MAX_PAUSE2_DURATION: 2,
    MIN_PAUSE2_DURATION: 0,
    STEP_PAUSE2_DURATION: 0.1,

    // Audio settings
    AUDIO_URLS: {
        GONG1: [
            "https://cdn.freesound.org/previews/740/740018_9243191-lq.mp3",
            // "https://cdn.freesound.org/previews/395/395213_3784934-lq.mp3",
            // "https://cdn.freesound.org/previews/347/347138_6303715-lq.mp3",
            // "https://cdn.freesound.org/previews/536/536774_1415754-lq.mp3",
            // "https://cdn.freesound.org/previews/56/56242_91374-lq.mp3",
        ],
        GONG2: "https://cdn.freesound.org/previews/554/554056_12315704-lq.mp3",
        GONG3: "https://cdn.freesound.org/previews/529/529817_10761583-lq.mp3",
        GONG4: "https://cdn.freesound.org/previews/492/492481_5701403-lq.mp3",
    },

    // Other settings
    DEFAULT_THIRD_SOUND_ENABLED: true,
};
