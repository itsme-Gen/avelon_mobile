import { Stack } from "expo-router";

export default function VerificationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // cleaner flow
      }}
    >
      <Stack.Screen
        name="BasicInformation"
        options={{
          title: "Basic Information",
        }}
      />
      <Stack.Screen
        name="ContactInformation"
        options={{
          title: "Contact Information",
        }}
      />

      <Stack.Screen
        name="IDVerification"
        options={{
          title: "Document Upload",
        }}
      />

      <Stack.Screen
        name="VerificationSummary"
        options={{
          title: "Verification Summary",
        }}
      />

      <Stack.Screen
        name="FaceRecognition"
        options={{
          title: "Face Recognition",
        }}
      />

      <Stack.Screen
        name="Success"
        options={{
          title: "Verification Success",
        }}
      />
    </Stack>
  );
}
