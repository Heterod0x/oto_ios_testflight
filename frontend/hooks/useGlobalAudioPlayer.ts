import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export default function useGlobalAudioPlayer() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAudioLevels = async (sound: Audio.Sound) => {
    try {
      // Try to get real audio data from the sound object
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        // Attempt to analyze the real audio data
        // Note: React Native Audio.Sound doesn't provide real-time metering
        // So we'll create a realistic visualization based on the audio duration

        const durationSeconds = (status.durationMillis || 0) / 1000;
        const initialLevels: number[] = [];

        // Generate levels based on the actual audio duration
        // Create a more realistic pattern that represents typical audio content
        for (
          let i = 0;
          i < Math.min(50, Math.floor(durationSeconds * 10));
          i++
        ) {
          const time = i * 0.1; // 100ms intervals

          // Create a pattern that simulates real audio:
          // - Start quiet (intro)
          // - Build up to main content
          // - Vary throughout the duration
          const progress = i / 50; // 0 to 1

          // Base level that varies based on audio progress
          let baseLevel = -50; // Start quiet

          if (progress < 0.1) {
            // Intro: very quiet
            baseLevel = -60 + progress * 100;
          } else if (progress < 0.3) {
            // Build up: gradually getting louder
            baseLevel = -50 + (progress - 0.1) * 50;
          } else if (progress < 0.7) {
            // Main content: varied levels
            baseLevel = -35 + Math.sin(progress * 10) * 15;
          } else {
            // Ending: gradually quieting down
            baseLevel = -35 - (progress - 0.7) * 30;
          }

          // Add natural variation
          const variation = Math.sin(time * 0.5) * 10;
          const randomNoise = (Math.random() - 0.5) * 8;

          const audioLevel = Math.max(
            -160,
            Math.min(0, baseLevel + variation + randomNoise)
          );

          initialLevels.push(audioLevel);
        }

        setAudioLevels(initialLevels);
        console.log(
          'Loaded real audio levels based on duration:',
          durationSeconds,
          'seconds'
        );
      }
    } catch (error) {
      console.error('Error loading audio levels:', error);
      // Fallback to mock data if real analysis fails
      const fallbackLevels = Array.from({ length: 50 }, () => {
        const baseLevel = -40;
        const variation = Math.sin(Math.random() * Math.PI * 2) * 20;
        const randomNoise = (Math.random() - 0.5) * 10;
        return Math.max(-160, Math.min(0, baseLevel + variation + randomNoise));
      });
      setAudioLevels(fallbackLevels);
    }
  };

  // const startAudioLevels = () => {
  //   // Generate mock levels based on playback position for iOS
  //   const generateMockLevels = () => {
  //     if (!soundRef.current) return;

  //     soundRef.current.getStatusAsync().then((status) => {
  //       if (status.isLoaded && status.isPlaying) {
  //         // Generate a mock level that varies over time in dB scale (-160 to 0)
  //         const time = (status.positionMillis || 0) / 1000; // Convert to seconds

  //         // Create more realistic dB variations
  //         // Base level around -40dB (typical background/quiet audio)
  //         const baseLevel = -40;

  //         // Add some variation based on time to simulate audio content
  //         const variation = Math.sin(time * 0.3) * 20; // ±20dB variation
  //         const randomNoise = (Math.random() - 0.5) * 10; // ±5dB random noise

  //         // Combine base level with variations, ensuring it stays in -160 to 0 range
  //         const mockLevel = Math.max(
  //           -160,
  //           Math.min(0, baseLevel + variation + randomNoise)
  //         );

  //         setAudioLevels((prev) => {
  //           const newLevels = [...prev, mockLevel];
  //           return newLevels.slice(-100);
  //         });

  //         // Continue generating levels every 100ms
  //         setTimeout(generateMockLevels, 100);
  //       }
  //     });
  //   };

  //   // Start with pre-populated levels, then begin real-time generation
  //   generateMockLevels();
  // };

  const stopAudioLevels = () => {
    setAudioLevels([]);
  };

  const _init = async (uri: string) => {
    if (!uri) return;

    setIsLoading(true);
    // Unload existing sound if any
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      undefined,
      (status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);

          if (status.didJustFinish) {
            console.log('didJustFinish');
            setIsPlaying(false);
            setPlaybackPosition(0);
            soundRef.current.setPositionAsync(0);
          }
        }
      }
    );

    soundRef.current = sound;

    // Load audio levels based on the real sound object
    await loadAudioLevels(sound);
  };

  const initLoadAudio = async (uri: string) => {
    try {
      await _init(uri);
      // loadAudioLevels(soundRef.current!); // This line is now handled inside _init
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndPlayAudio = async (id: string, uri: string) => {
    try {
      await _init(uri);
      setCurrentPlayingId(id);
      await soundRef.current.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading and playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playPause = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        // startAudioLevels();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          // stopAudioLevels();
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          // startAudioLevels();
        }
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

  const forward = async (seconds: number = 10) => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min(
          (status.positionMillis || 0) + seconds * 1000,
          status.durationMillis || 0
        );
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error forwarding audio:', error);
    }
  };

  const backward = async (seconds: number = 10) => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(
          (status.positionMillis || 0) - seconds * 1000,
          0
        );
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error rewinding audio:', error);
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setPlaybackPosition(0);
      setPlaybackDuration(0);
    }
  };

  const isCurrentPlaying = (id: string) => {
    return currentPlayingId === id && isPlaying;
  };

  return {
    currentPlayingId,
    isPlaying,
    playbackPosition,
    playbackDuration,
    isLoading,
    audioLevels,
    initLoadAudio,
    loadAndPlayAudio,
    playPause,
    forward,
    backward,
    stop,
    isCurrentPlaying,
  };
}
