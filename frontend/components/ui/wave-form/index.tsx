import { Box } from '../box';

// Waveform component
export const Waveform = () => {
  const bars = [2, 4, 3, 6, 4, 3, 5, 2, 4, 3, 2, 1];

  return (
    <Box className="flex-row items-end space-x-1">
      {bars.map((height, index) => (
        <Box
          key={index}
          className="bg-gray-300 rounded-sm"
          style={{
            width: 2,
            height: height,
          }}
        />
      ))}
    </Box>
  );
};
