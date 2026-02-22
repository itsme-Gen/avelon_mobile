import * as NativeSplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Easing, Image, StatusBar, View } from "react-native";

export default function LoadingScreen() {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const onLayout = useCallback(() => {
    NativeSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Logo fade in + scale
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle shimmer/pulse animation for the shadow bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shadowOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
  });

  const shadowScaleX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View
      className="flex-1 items-center justify-center"
      onLayout={onLayout}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Avelon Icon */}
      <Animated.View
        style={{
          opacity: fadeIn,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={require("../../../assets/images/avelon_icon_nobg_big 1.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subtle Shadow Bar */}
      <Animated.View
        style={{
          marginTop: 16,
          width: 80,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#000000",
          opacity: shadowOpacity,
          transform: [{ scaleX: shadowScaleX }],
        }}
      />
    </View>
  );
}
