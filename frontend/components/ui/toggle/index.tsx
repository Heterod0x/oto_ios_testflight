import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const toggleStyle = tva({
  base: 'flex-row items-center',
  variants: {
    size: {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14',
    },
    disabled: {
      true: 'opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
});

const trackStyle = tva({
  base: 'rounded-full transition-all duration-200',
  variants: {
    size: {
      sm: 'h-3 w-7',
      md: 'h-4 w-9',
      lg: 'h-8 w-14',
    },
    active: {
      true: 'bg-black',
      false: 'bg-gray-300',
    },
  },
  defaultVariants: {
    size: 'md',
    active: false,
  },
});

const thumbStyle = tva({
  base: 'bg-white rounded-full shadow-sm transition-all duration-200',
  variants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-7 w-7',
    },
    active: {
      true: 'translate-x-6 translate-y-0.5',
      false: 'translate-x-0 translate-y-0.5',
    },
  },
  defaultVariants: {
    size: 'md',
    active: false,
  },
});

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={toggleStyle({ size, disabled, class: className })}
      activeOpacity={0.8}
    >
      <View className={trackStyle({ size, active: value })}>
        <View className={thumbStyle({ size, active: value })} />
      </View>
    </TouchableOpacity>
  );
};

export default Toggle;
