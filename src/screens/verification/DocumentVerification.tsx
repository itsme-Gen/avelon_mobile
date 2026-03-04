import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ProgressDots } from '../../components/progressdot/ProgressDot';
import { CustomAlert } from '../../components/alertbutton/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerificationStore } from '@/stores/verification.store';

interface AlertConfig {
  visible: boolean;
  title: string;
  message?: string;
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function IDVerification() {
  const insets = useSafeAreaInsets();
  const savedDocs = useVerificationStore((s) => s.idDocuments);
  const setIdDocuments = useVerificationStore((s) => s.setIdDocuments);
  const [selectedIdFront, setSelectedIdFront] = useState<string | null>(savedDocs.frontUri);
  const [selectedIdBack, setSelectedIdBack] = useState<string | null>(savedDocs.backUri);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(savedDocs.signatureUri);
  
  const [alert, setAlert] = useState<AlertConfig>({
    visible: false,
    title: '',
    buttons: [],
  });

  const showAlert = (config: Omit<AlertConfig, 'visible'>) => {
    setAlert({ ...config, visible: true });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  // Request permissions
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return {
      camera: cameraPermission.status === 'granted',
      media: mediaPermission.status === 'granted'
    };
  };

  // Show options to pick image from camera or gallery
  const showImagePickerOptions = (type: 'front' | 'back' | 'signature') => {
    showAlert({
      title: 'Select Photo',
      message: 'Choose how you want to upload your photo',
      icon: 'camera-outline',
      iconColor: '#111827',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Gallery',
          onPress: () => pickImage(type),
        },
        {
          text: 'Camera',
          onPress: () => takePhoto(type),
        },
      ],
    });
  };

  // Take photo with camera
  const takePhoto = async (type: 'front' | 'back' | 'signature') => {
    const permissions = await requestPermissions();
    
    if (!permissions.camera) {
      showAlert({
        title: 'Permission Denied',
        message: 'Camera permission is required to take photos. Please enable it in your device settings.',
        icon: 'camera-outline',
        iconColor: '#EF4444',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'signature' ? [4, 3] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(type, result.assets[0].uri);
    }
  };

  // Pick image from gallery
  const pickImage = async (type: 'front' | 'back' | 'signature') => {
    const permissions = await requestPermissions();
    
    if (!permissions.media) {
      showAlert({
        title: 'Permission Denied',
        message: 'Media library permission is required to select photos. Please enable it in your device settings.',
        icon: 'images-outline',
        iconColor: '#EF4444',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'signature' ? [4, 3] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(type, result.assets[0].uri);
    }
  };

  // Set image based on type
  const setImage = (type: 'front' | 'back' | 'signature', uri: string) => {
    switch (type) {
      case 'front':
        setSelectedIdFront(uri);
        break;
      case 'back':
        setSelectedIdBack(uri);
        break;
      case 'signature':
        setSelectedSignature(uri);
        break;
    }
  };

  // Remove selected image
  const removeImage = (type: 'front' | 'back' | 'signature') => {
    showAlert({
      title: 'Remove Photo',
      message: 'Are you sure you want to remove this photo?',
      icon: 'trash-outline',
      iconColor: '#EF4444',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setImage(type, ''),
        },
      ],
    });
  };

  // Validate all images are uploaded
  const handleNext = () => {
    if (!selectedIdFront || !selectedIdBack || !selectedSignature) {
      showAlert({
        title: 'Incomplete Verification',
        message: 'Please upload all required documents before proceeding.',
        icon: 'alert-circle-outline',
        iconColor: '#F59E0B',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    router.push("/(verification)/VerificationSummary");

    // Save document URIs to store for submission
    setIdDocuments({
      frontUri: selectedIdFront,
      backUri: selectedIdBack,
      signatureUri: selectedSignature,
    });
  };

  // Render upload button with preview
  const renderUploadButton = (
    type: 'front' | 'back' | 'signature',
    label: string,
    selectedImage: string | null
  ) => (
    <View>
      <Text className="text-sm font-semibold text-gray-900 mb-2">
        {label}
      </Text>
      
      {selectedImage ? (
        <View className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          {/* Image Preview */}
          <View className="relative">
            <Image 
              source={{ uri: selectedImage }}
              className="w-full h-48"
              resizeMode="cover"
            />
            
            {/* Overlay with actions */}
            <View className="absolute inset-0 bg-black/40 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                className="bg-white rounded-full p-3"
                onPress={() => showImagePickerOptions(type)}
              >
                <Ionicons name="camera-outline" size={24} color="#111827" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-white rounded-full p-3"
                onPress={() => removeImage(type)}
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* File name display */}
          <View className="px-4 py-3 bg-white">
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {selectedImage.split('/').pop()}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 flex-row items-center justify-between"
          onPress={() => showImagePickerOptions(type)}
        >
          <Text className="text-gray-500 text-sm">
            Selected File: No Selected
          </Text>
          <Ionicons name="cloud-upload-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <ScrollView 
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        <View className="px-6 pt-8">
          {/* Header Section */}
          <View className="mb-8 mt-12">
            <Text className="text-2xl font-bold text-gray-900 mb-3">
              Document Verification
            </Text>
            <Text className="text-md text-gray-600 leading-5">
              To confirm your ID information, We will need verification. Please provide
              a clear photo of a government-issued ID—this could be a passport, national
              ID, driver's license, or another form of ID. Make sure all details are visible
              and legible. You'll also need to upload your signature, which will be
              matched with the one on your ID. Please use a plain surface and position
              the ID flat for the best results.
            </Text>
          </View>

          {/* Upload Buttons */}
          <View className="gap-4 mb-6">
            {renderUploadButton('front', 'Submit a photo of your ID (Front)', selectedIdFront)}
            {renderUploadButton('back', 'Submit a photo of your ID (Back)', selectedIdBack)}
            {renderUploadButton('signature', 'Submit a photo of your E-Signature', selectedSignature)}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation with Progress Dots */}
      <View 
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Progress Dots */}
        <View className="px-6 pt-4 pb-3">
          <ProgressDots currentStep={2} totalSteps={3} />
        </View>

        {/* Buttons */}
        <View className="px-6 pb-4 flex-row gap-3">
          <TouchableOpacity 
            className="flex-1 bg-gray-100 rounded-full py-4 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-900 font-semibold text-base">
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 rounded-full py-4 items-center justify-center ${
              selectedIdFront && selectedIdBack && selectedSignature 
                ? 'bg-gray-900' 
                : 'bg-gray-300'
            }`}
            onPress={handleNext}
            disabled={!selectedIdFront || !selectedIdBack || !selectedSignature}
          >
            <Text className={`font-semibold text-base ${
              selectedIdFront && selectedIdBack && selectedSignature 
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={closeAlert}
        icon={alert.icon}
        iconColor={alert.iconColor}
      />
    </>
  );
}