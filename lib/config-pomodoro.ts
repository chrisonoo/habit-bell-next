/**
 * Configuration for the pomodoro mode
 * Contains default values, limits, and step sizes for all settings
 * Uses longer intervals and session durations compared to training mode
 */
export const CONFIG = {
    // Session settings
    DEFAULT_SESSION_DURATION: 30, // Default session duration in minutes
    MAX_SESSION_DURATION: 120, // Maximum allowed session duration in minutes
    STEP_SESSION_DURATION: 5, // Step size for session duration adjustment

    // Interval settings
    DEFAULT_MIN_INTERVAL: 5 * 60, // Default minimum interval between gongs in seconds (5 minutes)
    DEFAULT_MAX_INTERVAL: 10 * 60, // Default maximum interval between gongs in seconds (10 minutes)
    MIN_INTERVAL: 5 * 60, // Absolute minimum allowed interval in seconds (5 minutes)
    MAX_INTERVAL: 30 * 60, // Absolute maximum allowed interval in seconds (30 minutes)
    STEP_INTERVAL: 5 * 60, // Step size for interval adjustment (5 minutes)

    // Pause durations
    DEFAULT_PAUSE1_DURATION: 1.2, // Default pause duration after first gong in seconds
    MAX_PAUSE1_DURATION: 2, // Maximum allowed pause1 duration in seconds
    MIN_PAUSE1_DURATION: 0, // Minimum allowed pause1 duration in seconds
    STEP_PAUSE1_DURATION: 0.1, // Step size for pause1 duration adjustment
    DEFAULT_PAUSE2_DURATION: 0.8, // Default pause duration between second gongs in seconds
    MAX_PAUSE2_DURATION: 2, // Maximum allowed pause2 duration in seconds
    MIN_PAUSE2_DURATION: 0, // Minimum allowed pause2 duration in seconds
    STEP_PAUSE2_DURATION: 0.1, // Step size for pause2 duration adjustment

    // Audio settings - URLs for different gong sounds
    AUDIO_URLS: {
        GONG1: [
            "https://cdn.freesound.org/previews/740/740018_9243191-lq.mp3",
            // Additional gong1 sound options (commented out)
            // "https://cdn.freesound.org/previews/395/395213_3784934-lq.mp3",
            // "https://cdn.freesound.org/previews/347/347138_6303715-lq.mp3",
            // "https://cdn.freesound.org/previews/536/536774_1415754-lq.mp3",
            // "https://cdn.freesound.org/previews/56/56242_91374-lq.mp3",
        ],
        GONG2: "https://cdn.freesound.org/previews/554/554056_12315704-lq.mp3", // Sound for second gong
        GONG3: "https://cdn.freesound.org/previews/529/529817_10761583-lq.mp3", // Sound for third gong
        GONG4: "https://cdn.freesound.org/previews/492/492481_5701403-lq.mp3", // Sound for fourth gong (end of sequence)
    },

    // Other settings
    DEFAULT_THIRD_SOUND_ENABLED: true, // Whether the third sound is enabled by default
};
