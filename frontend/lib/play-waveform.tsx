// App.tsx
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

export default function PlayWaveform({
  levels,
  isPlaying,
}: {
  levels: number[];
  isPlaying: boolean;
}) {
  const [containerWidth, setContainerWidth] = useState(300);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // convert levels to SVG bars (iOS-style)
  const width = containerWidth - 16; // Subtract padding (p-2 = 8px on each side)
  const height = 280; // Increased height to better fill the h-80 container

  // Calculate bar width to fit all levels within the container
  const totalBars = levels.length;
  const barSpacing = 1;
  const availableWidth = width - totalBars * barSpacing; // Total width minus spacing
  const barWidth = Math.max(1, availableWidth / totalBars); // Dynamic bar width

  const centerY = height / 2; // Center point of the screen

  // Create vertical bars for all levels, positioned across the full width
  const bars = levels.map((level, index) => {
    // Convert dB to height with better contrast
    // Normalize the level to a more dynamic range
    // Use exponential scaling for better visual response
    const normalizedLevel = Math.max(0, Math.pow(10, (level + 40) / 20));
    const barHeight = Math.max(1, normalizedLevel * height * 0.05); // Increased multiplier for more visible bars

    // Calculate position so bar extends equally above and below center
    const halfBarHeight = barHeight / 2;

    // Position bars across the full width, centered
    const x = index * (barWidth + barSpacing);
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
    <View className="p-2 flex-1" onLayout={handleLayout}>
      <Svg height={height} width={width}>
        {bars}
        {/* Live recording indicator line at center */}
        {/* <Line
          x1={centerX}
          y1={30}
          x2={centerX}
          y2={height - 40}
          stroke="#f59e0b"
          strokeWidth={2}
        /> */}
      </Svg>
    </View>
  );
}
