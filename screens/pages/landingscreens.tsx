import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../app/_layout";

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    logo: require('../../assets/images/avelon_nobg.png'),
    image: require('../../assets/images/wallet.png'),
    title: 'Secure Crypto Lending',
    subtitle: 'Starts Here',
    description: 'Lend and borrow with confidence using a transparent, collateral-backed lending platform.',
  },
  {
    id: '2',
    logo: require('../../assets/images/avelon_nobg.png'),
    image: require('../../assets/images/ethereum.png'),
    title: 'Powered by Ethereum',
    description: 'Built on Ethereum network to ensure secure transactions,decentralized control and global accessibility.',
  },
  {
    id: '3',
    logo: require('../../assets/images/avelon_nobg.png'),
    image: require('../../assets/images/phone.png'),
    title: 'AI-Powered Risk',
    subtitle: 'Intelligence',
    description: 'AI analyze Ethereum volatility and borrower data to ensure smarter, safer lending decisions.',
  },
   {
    id: '4',
    logo: require('../../assets/images/avelon_nobg.png'),
    image: require('../../assets/images/blockchain.png'),
    title: 'Trust Enforced by Blockchain',
    description: 'AI models analyze Ethereum volatility and borrower data to ensure smarter, safer lending decisions.',
  },
];

export default function Page() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderSlide = ({ item }: any) => (
    <View style={{ width }} className="flex-1 items-center bg-white px-4">
      <Image
        source={item.logo}
        className="w-[50%] h-[25%]"
        resizeMode="contain"
      />
      <Image
        source={item.image}
        className="w-[80%] h-[40%]"
        resizeMode="contain"
      />

      <View className="mt-10 ">
        <Text className="text-black text-center font-bold text-2xl">{item.title}</Text>
        <Text className="text-black text-center font-bold text-2xl">{item.subtitle}</Text>
        <Text className="text-gray-600 text-lg text-center mt-4 px-2">
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Dot Indicators */}
      <View className="flex-row justify-center items-center mb-10">
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollTo(index)}
            className={`h-3 rounded-full mx-1 ${
              index === currentIndex 
                ? 'w-8 bg-black' 
                : 'w-3 bg-gray-300'
            }`}
          />
        ))}
      </View>
      <View className="items-center mb-10">

        <TouchableOpacity
        className="bg-black w-[90%] justify-center items-center py-4 rounded-full"
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text className="text-white text-lg font-bold">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
        >
          <Text className="text-gray-600 text-lg mt-2">Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 