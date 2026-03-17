import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import Svg, { Defs, Mask, Rect, Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerificationStore } from '@/stores/verification.store';
import { ProgressDots } from '../../components/progressdot/ProgressDot';

export default function SelfieCapture() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const setIdDocuments = useVerificationStore((s) => s.setIdDocuments);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const OVAL_WIDTH = width * 0.68;
  const OVAL_HEIGHT = OVAL_WIDTH * 1.2;
  const ovalCX = width / 2;
  const ovalCY = height * 0.38;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) setCapturedUri(photo.uri);
    } catch (error) {
      console.error('[SelfieCapture] takePicture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleConfirm = () => {
    if (!capturedUri) return;
    setIdDocuments({ selfieUri: capturedUri });
    router.push('/(verification)/VerificationSummary');
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Ionicons name="camera-outline" size={56} color="white" />
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
          Camera Access Required
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          Avelon needs camera access to capture your selfie for identity verification.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: 'white', borderRadius: 100, paddingHorizontal: 32, paddingVertical: 14 }}
          onPress={requestPermission}
        >
          <Text style={{ color: '#111827', fontWeight: '600', fontSize: 15 }}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12, paddingVertical: 8 }} onPress={() => router.back()}>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedUri) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <Image source={{ uri: capturedUri }} style={{ flex: 1 }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <ProgressDots currentStep={3} totalSteps={4} />
          </View>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 17, fontWeight: '600', marginBottom: 16 }}>
            Use this photo?
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 100,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
              onPress={handleRetake}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: 'white', borderRadius: 100, paddingVertical: 16, alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#111827', fontWeight: '600', fontSize: 16 }}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
        {/* SVG oval overlay — dark mask with transparent oval cutout */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width={width} height={height}>
            <Defs>
              <Mask id="ovalMask">
                <Rect width={width} height={height} fill="white" />
                <Ellipse
                  cx={ovalCX}
                  cy={ovalCY}
                  rx={OVAL_WIDTH / 2}
                  ry={OVAL_HEIGHT / 2}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              width={width}
              height={height}
              fill="rgba(0,0,0,0.55)"
              mask="url(#ovalMask)"
            />
            <Ellipse
              cx={ovalCX}
              cy={ovalCY}
              rx={OVAL_WIDTH / 2}
              ry={OVAL_HEIGHT / 2}
              fill="none"
              stroke="white"
              strokeWidth={2.5}
            />
          </Svg>
        </View>
      </CameraView>

      {/* Bottom controls */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <ProgressDots currentStep={3} totalSteps={4} />
        </View>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 15, marginBottom: 24 }}>
          Position your face within the oval
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingHorizontal: 48,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          {/* Shutter button */}
          <TouchableOpacity
            onPress={handleCapture}
            disabled={isCapturing}
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.7)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                backgroundColor: isCapturing ? '#9CA3AF' : 'white',
              }}
            />
          </TouchableOpacity>

          {/* Spacer for visual symmetry */}
          <View style={{ width: 48 }} />
        </View>
      </View>
    </View>
  );
}
