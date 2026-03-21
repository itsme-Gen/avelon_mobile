import { useVerificationStore } from "@/stores/verification.store";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FlipType, manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { ProgressDots } from "../../components/progressdot/ProgressDot";
export default function FaceRecognition() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setIdDocuments = useVerificationStore((s) => s.setIdDocuments);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsLoading(true);
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        mirrorImage: false,
        mute: true, // Best effort to suppress shutter sound on Android
      });
      // Flip the image horizontally if using the front camera
      const manipulated = await manipulateAsync(
        photoData.uri,
        [{ flip: FlipType.Horizontal }],
        { compress: 0.7, format: SaveFormat.JPEG },
      );
      setPhoto(manipulated.uri);
      setIdDocuments({ faceUri: manipulated.uri });
    } catch (error) {
      console.error("Failed to capture photo:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Request camera permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);
  const handleRetake = () => setPhoto(null);
  const handleContinue = () =>
    router.push("/(verification)/VerificationSummary");
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="camera" size={48} color="#d1d5db" />
        <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
          Camera access is required for face recognition.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-4 bg-black px-6 py-2 rounded-full"
        >
          <Text className="text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 px-6">
        <ProgressDots currentStep={3} totalSteps={4} />
        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Face Recognition
        </Text>
        <Text className="text-base text-gray-600 mb-6 text-center">
          Align your face within the frame and tap the button to capture your
          photo for verification.
        </Text>
        <Text className="text-sm text-yellow-700 bg-yellow-100 rounded-lg px-4 py-2 mb-4 text-center">
          Please remove caps, eyeglasses, and face coverings. Keep your face
          straight, look directly at the camera, and ensure good lighting. Avoid
          shadows and reflections for best results.
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        {!photo ? (
          <View className="overflow-hidden rounded-2xl border-4 border-gray-200 w-64 h-80 bg-black items-center justify-center">
            <CameraView
              ref={cameraRef}
              style={{ width: 240, height: 320 }}
              facing="front"
            />
            {isLoading && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: photo }}
            style={{
              width: 240,
              height: 320,
              borderRadius: 16,
              borderWidth: 4,
              borderColor: "#e5e7eb",
            }}
            resizeMode="cover"
          />
        )}
      </View>

      <View className="px-6 pb-10">
        {!photo ? (
          <TouchableOpacity
            className="bg-black rounded-full p-5 items-center justify-center mx-auto mt-6"
            onPress={handleCapture}
            disabled={isLoading}
            accessibilityLabel="Capture face photo"
          >
            <Ionicons name="camera" size={32} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-center gap-4 mt-6">
            <TouchableOpacity
              className="bg-gray-200 rounded-full px-6 py-3"
              onPress={handleRetake}
              accessibilityLabel="Retake photo"
            >
              <Text className="text-gray-700 font-semibold">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-black rounded-full px-6 py-3"
              onPress={handleContinue}
              accessibilityLabel="Continue"
            >
              <Text className="text-white font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
