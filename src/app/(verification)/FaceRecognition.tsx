import { verifyFace } from "@/services/kyc.service";
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

type VerifyState = "idle" | "verifying" | "passed" | "failed" | "error";

export default function FaceRecognition() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const setIdDocuments = useVerificationStore((s) => s.setIdDocuments);
  const setFaceMatchResult = useVerificationStore((s) => s.setFaceMatchResult);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsCapturing(true);
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        mirrorImage: false,
        mute: true,
      });
      const manipulated = await manipulateAsync(
        photoData.uri,
        [{ flip: FlipType.Horizontal }],
        { compress: 0.7, format: SaveFormat.JPEG },
      );
      setPhoto(manipulated.uri);
      setIdDocuments({ faceUri: manipulated.uri });

      // Immediately run face verification after capture
      await runFaceVerification(manipulated.uri);
    } catch (error) {
      console.error("Failed to capture photo:", error);
      setVerifyState("error");
      setVerifyMessage("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const runFaceVerification = async (selfieUri: string) => {
    setVerifyState("verifying");
    setVerifyMessage(null);

    try {
      const result = await verifyFace(selfieUri);

      if (!result.success) {
        console.error("[FaceRecognition] Verification failed:", result.error);
        setVerifyState("error");
        setVerifyMessage(result.error || "Verification failed. Please try again.");
        return;
      }

      const { passed, score, message } = result.data!;
      setFaceMatchResult(passed, score);

      if (passed) {
        setVerifyState("passed");
        setVerifyMessage(null);
      } else {
        setVerifyState("failed");
        setVerifyMessage(message || "Face does not match the government ID photo.");
      }
    } catch (error) {
      console.error("[FaceRecognition] Unexpected error:", error);
      const msg = error instanceof Error ? error.message : "An unexpected error occurred";
      setVerifyState("error");
      setVerifyMessage(msg);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setVerifyState("idle");
    setVerifyMessage(null);
  };

  const handleContinue = () =>
    router.push("/(verification)/VerificationSummary");

  // Request camera permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

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
            {isCapturing && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View className="items-center">
            <Image
              source={{ uri: photo }}
              style={{
                width: 240,
                height: 320,
                borderRadius: 16,
                borderWidth: 4,
                borderColor:
                  verifyState === "passed"
                    ? "#22C55E"
                    : verifyState === "failed" || verifyState === "error"
                      ? "#EF4444"
                      : "#e5e7eb",
              }}
              resizeMode="cover"
            />

            {/* Verification status overlay */}
            {verifyState === "verifying" && (
              <View className="mt-4 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#111827" />
                <Text className="text-gray-600 text-sm">Verifying face...</Text>
              </View>
            )}

            {verifyState === "passed" && (
              <View className="mt-4 flex-row items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text className="text-green-800 text-sm font-medium">
                  Face verified successfully
                </Text>
              </View>
            )}

            {(verifyState === "failed" || verifyState === "error") && (
              <View className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text className="text-red-800 text-sm font-medium">
                    {verifyState === "failed" ? "Face mismatch" : "Verification error"}
                  </Text>
                </View>
                {verifyMessage ? (
                  <Text className="text-red-700 text-xs">{verifyMessage}</Text>
                ) : null}
              </View>
            )}
          </View>
        )}
      </View>

      <View className="px-6 pb-10">
        {!photo ? (
          <TouchableOpacity
            className="bg-black rounded-full p-5 items-center justify-center mx-auto mt-6"
            onPress={handleCapture}
            disabled={isCapturing}
            accessibilityLabel="Capture face photo"
          >
            <Ionicons name="camera" size={32} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-center gap-4 mt-6">
            <TouchableOpacity
              className="bg-gray-200 rounded-full px-6 py-3"
              onPress={handleRetake}
              disabled={verifyState === "verifying"}
              accessibilityLabel="Retake photo"
            >
              <Text className="text-gray-700 font-semibold">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-full px-6 py-3 ${verifyState === "passed" ? "bg-black" : "bg-gray-300"}`}
              onPress={handleContinue}
              disabled={verifyState !== "passed"}
              accessibilityLabel="Continue"
            >
              <Text
                className={`font-semibold ${verifyState === "passed" ? "text-white" : "text-gray-400"}`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
