// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Rect, Line } from 'react-native-svg';

export default function RecordingWaveform({
  recording,
}: {
  recording: Audio.Recording;
}) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(300);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  useEffect(() => {
    const startRecording = async () => {
      try {
        recordingRef.current = recording;
        setIsRecording(true);

        // poll metering data every 100ms
        const interval = setInterval(async () => {
          if (recordingRef.current) {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording && typeof status.metering === 'number') {
              setLevels((prev) => {
                const newLevels = [...prev, status.metering];
                // keep last 100 samples
                return newLevels.slice(-100);
              });
            }
          }
        }, 100);

        // Cleanup function to clear interval
        return () => clearInterval(interval);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    };

    const cleanup = startRecording();

    // Cleanup function for component unmount
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
      if (recordingRef.current) {
        stopRecording();
      }
    };
  }, [recording]);

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      // recordingRef.current.stopPolling?.();
    } catch (e) {
      console.log('stop error', e);
    }
    setIsRecording(false);
    recordingRef.current = null;
  };

  // convert levels to SVG bars (iOS-style)
  const width = containerWidth - 16; // Subtract padding (p-2 = 8px on each side)
  const height = 280; // Increased height to better fill the h-80 container
  const barWidth = 3;
  const barSpacing = 1;
  const maxBars = Math.floor(width / (barWidth + barSpacing));
  const centerY = height / 2; // Center point of the screen

  // Create vertical bars for each level
  const bars = levels.slice(-maxBars).map((level, index) => {
    // Convert dB to height with better contrast
    // Normalize the level to a more dynamic range
    // Use exponential scaling for better visual response
    const normalizedLevel = Math.max(0, Math.pow(10, (level + 40) / 20));
    const barHeight = Math.max(1, normalizedLevel * height * 0.05); // Increased multiplier for more visible bars

    // Calculate position so bar extends equally above and below center
    const halfBarHeight = barHeight / 2;

    // Center the bars around the center line
    const totalBarsWidth = maxBars * (barWidth + barSpacing) - barSpacing; // Total width of all bars
    const startX = (width - totalBarsWidth) / 2; // Start position to center all bars
    const x = startX + index * (barWidth + barSpacing);
    const y = centerY - halfBarHeight; // Position bar so it's centered

    return (
      <Rect
        key={index}
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        fill="#8E8E93"
        rx={1}
      />
    );
  });

  return (
    <View className="bg-white p-2 flex-1" onLayout={handleLayout}>
      <Svg height={height} width={width}>
        {bars}
        {/* Live recording indicator line at center */}
        <Line
          x1={width / 2}
          y1={30}
          x2={width / 2}
          y2={height - 40}
          stroke="#f59e0b"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}
