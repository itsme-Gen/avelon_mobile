import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { HOLE_RADIUS, holePath, padRect, placeTooltip, type Rect } from "./geometry";
import type { TourStep } from "./steps";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DIM = "rgba(0, 0, 0, 0.7)";
const MOVE = { duration: 320, easing: Easing.out(Easing.cubic) };
const FADE = { duration: 200, easing: Easing.out(Easing.quad) };
const CARD_WIDTH = 320;

interface Props {
  step: TourStep;
  index: number;
  total: number;
  hole: Rect | null;
  ready: boolean;
  onNext: () => void;
  onSkip: () => void;
}

export function TourOverlay({ step, index, total, hole, ready, onNext, onSkip }: Props) {
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [card, setCard] = useState({ width: CARD_WIDTH, height: 168 });

  const padded = hole ? padRect(hole, screen) : null;

  // The hole starts as a dot in the middle and glides between targets
  const x = useSharedValue(screen.width / 2);
  const y = useSharedValue(screen.height / 2);
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardShift = useSharedValue(8);

  useEffect(() => {
    if (!ready) {
      cardOpacity.value = withTiming(0, FADE);
      cardShift.value = withTiming(8, FADE);
      return;
    }
    const target = padded ?? { x: screen.width / 2, y: screen.height / 2, width: 0, height: 0 };
    x.value = withTiming(target.x, MOVE);
    y.value = withTiming(target.y, MOVE);
    w.value = withTiming(target.width, MOVE);
    h.value = withTiming(target.height, MOVE);
    cardOpacity.value = withTiming(1, { ...FADE, duration: 260 });
    cardShift.value = withTiming(0, { ...FADE, duration: 260 });
    // padded is derived from hole; listing hole keeps this from firing every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hole, screen.width, screen.height]);

  const radius = HOLE_RADIUS;
  const maskProps = useAnimatedProps(() => ({
    d: holePath(screen.width, screen.height, x.value, y.value, w.value, h.value, radius),
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardShift.value }],
  }));

  const position = placeTooltip(padded, card, screen, insets);
  const isLast = index === total - 1;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={onSkip}>
      <View style={{ flex: 1 }} accessibilityViewIsModal>
        <Svg width={screen.width} height={screen.height} style={{ position: "absolute", left: 0, top: 0 }}>
          <AnimatedPath animatedProps={maskProps} fill={DIM} fillRule="evenodd" />
        </Svg>

        {/* Swallows taps so the screen underneath can't be used mid-tour */}
        <Pressable style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} onPress={() => {}} accessible={false} />

        <Animated.View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (Math.abs(height - card.height) > 1 || Math.abs(width - card.width) > 1) setCard({ width, height });
          }}
          pointerEvents={ready ? "auto" : "none"}
          style={[
            {
              position: "absolute",
              left: position.left,
              top: position.top,
              width: Math.min(CARD_WIDTH, screen.width - 32),
            },
            cardStyle,
          ]}
          accessibilityRole="alert"
          accessibilityLabel={`${step.title}. ${step.body}. Step ${index + 1} of ${total}.`}
        >
          <View className="bg-white rounded-2xl p-4" style={{ shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
            <Text className="text-xs font-medium text-gray-400">
              {index + 1} of {total}
            </Text>
            <Text className="text-base font-semibold text-gray-900 mt-1">{step.title}</Text>
            <Text className="text-sm text-gray-600 mt-1 leading-5">{step.body}</Text>

            <View className="flex-row items-center justify-between mt-4">
              {isLast ? (
                <View />
              ) : (
                <TouchableOpacity onPress={onSkip} hitSlop={8} accessibilityRole="button" accessibilityLabel="Skip tour">
                  <Text className="text-sm font-medium text-gray-500">Skip</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onNext}
                className="bg-black rounded-full px-5 py-2.5"
                accessibilityRole="button"
                accessibilityLabel={isLast ? "Finish tour" : "Next step"}
              >
                <Text className="text-sm font-semibold text-white">{isLast ? "Done" : "Next"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
