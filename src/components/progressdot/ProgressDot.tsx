// Create a new file: components/ProgressDots.tsx
import { View } from "react-native";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressDots = ({ currentStep, totalSteps }: ProgressDotsProps) => {
  return (
    <View className="flex-row items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full ${
            index === currentStep ? "bg-black" : "bg-gray-300"
          }`}
        />
      ))}
    </View>
  );
};