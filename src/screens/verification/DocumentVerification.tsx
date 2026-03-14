import { View, Text, TouchableOpacity, ScrollView, Image, Platform, Linking, Modal, FlatList } from 'react-native';
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
  const [selectedIdType, setSelectedIdType] = useState<string>(savedDocs.idType || '');
  const [selectedIdFront, setSelectedIdFront] = useState<string | null>(savedDocs.frontUri);
  const [selectedIdBack, setSelectedIdBack] = useState<string | null>(savedDocs.backUri);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(savedDocs.signatureUri);
  const [selectedIncome, setSelectedIncome] = useState<string | null>(savedDocs.proofOfIncomeUri);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(savedDocs.proofOfAddressUri);
  const [showIdTypePicker, setShowIdTypePicker] = useState(false);

  // Aspect ratio matched to actual document dimensions
  const getAspectRatio = (docType: string): [number, number] => {
    if (docType === 'signature') return [4, 3];
    if (docType === 'income' || docType === 'address') return [4, 3];
    if (selectedIdType === 'Passport') return [3, 2];
    return [8, 5]; // CR80 card standard (85.6×54mm) — fits most PH gov IDs
  };

  const ID_TYPE_OPTIONS = [
    { label: 'Philippine Identification (PhilID)', value: 'PhilID' },
    { label: "Driver's License", value: 'Drivers License' },
    { label: 'Passport', value: 'Passport' },
    { label: 'SSS ID', value: 'SSS' },
    { label: 'UMID', value: 'UMID' },
    { label: "Voter's ID", value: 'Voters ID' },
    { label: 'PRC ID', value: 'PRC' },
    { label: 'Postal ID', value: 'Postal ID' },
  ];

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

  // Request permissions (handles iOS "denied permanently" by directing to Settings)
  const requestPermissions = async () => {
    let cameraPermission = await ImagePicker.getCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    }

    let mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== 'granted') {
      mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    return {
      camera: cameraPermission.status === 'granted',
      cameraCanAskAgain: cameraPermission.canAskAgain,
      media: mediaPermission.status === 'granted',
      mediaCanAskAgain: mediaPermission.canAskAgain,
    };
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Show options to pick image from camera or gallery
  const showImagePickerOptions = (type: 'front' | 'back' | 'signature' | 'income' | 'address') => {
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
  const takePhoto = async (type: 'front' | 'back' | 'signature' | 'income' | 'address') => {
    const permissions = await requestPermissions();
    
    if (!permissions.camera) {
      showAlert({
        title: 'Permission Denied',
        message: permissions.cameraCanAskAgain
          ? 'Camera permission is required to take photos.'
          : 'Camera permission was denied. Please enable it in Settings.',
        icon: 'camera-outline',
        iconColor: '#EF4444',
        buttons: permissions.cameraCanAskAgain
          ? [{ text: 'OK' }]
          : [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: openSettings }],
      });
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: getAspectRatio(type),
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(type, result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Camera] Launch failed:', error);
      showAlert({
        title: 'Camera Error',
        message: 'Failed to open camera. Please try again or use the gallery option.',
        icon: 'camera-outline',
        iconColor: '#EF4444',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Pick image from gallery
  const pickImage = async (type: 'front' | 'back' | 'signature' | 'income' | 'address') => {
    const permissions = await requestPermissions();
    
    if (!permissions.media) {
      showAlert({
        title: 'Permission Denied',
        message: permissions.mediaCanAskAgain
          ? 'Media library permission is required to select photos.'
          : 'Photo library permission was denied. Please enable it in Settings.',
        icon: 'images-outline',
        iconColor: '#EF4444',
        buttons: permissions.mediaCanAskAgain
          ? [{ text: 'OK' }]
          : [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: openSettings }],
      });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: getAspectRatio(type),
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(type, result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Gallery] Pick failed:', error);
      showAlert({
        title: 'Gallery Error',
        message: 'Failed to open gallery. Please try again or use the camera option.',
        icon: 'images-outline',
        iconColor: '#EF4444',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Set image based on type
  const setImage = (type: 'front' | 'back' | 'signature' | 'income' | 'address', uri: string) => {
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
      case 'income':
        setSelectedIncome(uri);
        break;
      case 'address':
        setSelectedAddress(uri);
        break;
    }
  };

  // Remove selected image
  const removeImage = (type: 'front' | 'back' | 'signature' | 'income' | 'address') => {
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

  // Validate all required images are uploaded
  const handleNext = () => {
    if (!selectedIdType) {
      showAlert({
        title: 'ID Type Required',
        message: 'Please select the type of government-issued ID you are submitting.',
        icon: 'id-card-outline',
        iconColor: '#F59E0B',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    if (!selectedIdFront || !selectedIdBack || !selectedSignature) {
      showAlert({
        title: 'Incomplete Verification',
        message: 'Please upload your ID (front & back) and e-signature before proceeding.',
        icon: 'alert-circle-outline',
        iconColor: '#F59E0B',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    // Save document URIs to store for submission
    setIdDocuments({
      idType: selectedIdType,
      frontUri: selectedIdFront,
      backUri: selectedIdBack,
      signatureUri: selectedSignature,
      proofOfIncomeUri: selectedIncome,
      proofOfAddressUri: selectedAddress,
    });

    router.push("/(verification)/VerificationSummary");
  };

  const requiredComplete = !!(selectedIdType && selectedIdFront && selectedIdBack && selectedSignature);

  // Render upload button with preview
  const renderUploadButton = (
    type: 'front' | 'back' | 'signature' | 'income' | 'address',
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
              Upload a clear photo of your government-issued ID (front & back) and 
              your e-signature. Optionally, add proof of income and address to unlock 
              higher verification tiers.
            </Text>
          </View>

          {/* ID Type Selector */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Type of Government ID <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              className={`border rounded-lg px-4 py-4 flex-row items-center justify-between ${
                selectedIdType ? 'border-gray-900 bg-white' : 'border-gray-200 bg-gray-50'
              }`}
              onPress={() => setShowIdTypePicker(true)}
            >
              <Text className={selectedIdType ? 'text-gray-900 text-sm' : 'text-gray-500 text-sm'}>
                {selectedIdType
                  ? ID_TYPE_OPTIONS.find((o) => o.value === selectedIdType)?.label ?? selectedIdType
                  : 'Select ID type...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Required Documents */}
          <View className="mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Required Documents
            </Text>
          </View>

          <View className="gap-4 mb-8">
            {renderUploadButton('front', 'ID Photo — Front *', selectedIdFront)}
            {renderUploadButton('back', 'ID Photo — Back *', selectedIdBack)}
            {renderUploadButton('signature', 'E-Signature *', selectedSignature)}
          </View>

          {/* Optional Documents */}
          <View className="mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Optional Documents
            </Text>
            <Text className="text-xs text-gray-400 mb-3">
              Upload these to unlock Standard or Enhanced verification tier
            </Text>
          </View>

          <View className="gap-4 mb-6">
            {renderUploadButton('income', 'Proof of Income (payslip, bank statement, ITR)', selectedIncome)}
            {renderUploadButton('address', 'Proof of Address (utility bill, barangay clearance)', selectedAddress)}
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
              requiredComplete 
                ? 'bg-gray-900' 
                : 'bg-gray-300'
            }`}
            onPress={handleNext}
            disabled={!requiredComplete}
          >
            <Text className={`font-semibold text-base ${
              requiredComplete 
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ID Type Picker Modal */}
      <Modal
        visible={showIdTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIdTypePicker(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowIdTypePicker(false)}
        >
          <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-[60%]">
            <View className="px-6 pb-3 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Select ID Type</Text>
            </View>
            <FlatList
              data={ID_TYPE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-6 py-4 flex-row items-center justify-between border-b border-gray-50 ${
                    selectedIdType === item.value ? 'bg-gray-50' : ''
                  }`}
                  onPress={() => {
                    setSelectedIdType(item.value);
                    setShowIdTypePicker(false);
                  }}
                >
                  <Text className="text-sm text-gray-900">{item.label}</Text>
                  {selectedIdType === item.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#111827" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

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