import { Dimensions, Image, StatusBar, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  return (
    <View className="flex-1" style={{ backgroundColor: "#F27A1A" }}>
      <StatusBar barStyle="light-content" backgroundColor="#F27A1A" />

      {/* Orange top section */}
      <View className="flex-1 px-6 pt-16">
        {/* Headline */}
        <Text
          className="text-white font-bold text-3xl leading-tight"
          style={{ maxWidth: width * 0.65 }}
        >
          Decentralized Lending,{"\n"}Done Right.
        </Text>

        {/* Illustration */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../../../assets/images/digitalwallet.png")}
            style={{ width: width * 0.95, height: height * 0.45 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* White bottom section with logo */}
      <View
        className="items-center justify-center bg-white"
        style={{ paddingVertical: 32 }}
      >
        <Image
          source={require("../../../assets/images/avelon_nobg.png")}
          style={{ width: 160, height: 100 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
