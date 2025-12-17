
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

type SquareProps = {
  value: string | null;
  onPress: () => void;
  isWinner?: boolean;
};

export default function Square({ value, onPress, isWinner }: SquareProps) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 40
      }).start();
    } else {
      scale.setValue(0);
    }
  }, [value]);

  return (
    <TouchableOpacity
      style={[styles.square, isWinner && styles.winnerSquare]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!!value} // Disable click if already filled (good UX)
    >
      {value ? (
        <Animated.Text style={[
          styles.text,
          value === 'X' ? styles.x : styles.o,
          { transform: [{ scale }] }
        ]}>
          {value}
        </Animated.Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  square: {
    width: 90,
    height: 90,
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  winnerSquare: {
    backgroundColor: '#1f4068',
    borderColor: '#4cc9f0',
    shadowColor: '#4cc9f0',
    elevation: 10,
    shadowOpacity: 0.5,
  },
  text: {
    fontSize: 48,
    fontWeight: '900',
  },
  x: {
    color: '#e94560',
    textShadowColor: 'rgba(233, 69, 96, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  o: {
    color: '#4cc9f0',
    textShadowColor: 'rgba(76, 201, 240, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
