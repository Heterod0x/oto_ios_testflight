import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export default function useGlobalAudioPlayer() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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
  };

  const initLoadAudio = async (uri: string) => {
    try {
      await _init(uri);
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
      console.log('status', status);
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
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
    initLoadAudio,
    loadAndPlayAudio,
    playPause,
    forward,
    backward,
    stop,
    isCurrentPlaying,
  };
}
