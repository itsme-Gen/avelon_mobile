import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { ProgressDots } from "../../components/progressdot/ProgressDot";
import { CustomDropdown } from "../../components/customDropdown/CustomDropdown";
import { DatePicker } from "../../components/datePicker/DatePicker";
import { useVerificationStore } from "@/stores/verification.store";

// Types
interface Location {
  code: string;
  name: string;
}

interface DropdownOption {
  code?: string;
  name: string;
}

// API Configuration - Multiple options for redundancy
const API_OPTIONS = {
  // Option 1: PSGC Cloud (Recommended - Active, maintained 2025)
  psgcCloud: "https://psgc.cloud/api",
  
  // Option 2: Rootscratch (Backup)
  rootscratch: "https://psgc.rootscratch.com/api",
  
  // Option 3: GitLab Pages (May be slow/down)
  gitlab: "https://psgc.gitlab.io/api",
};

// Use primary API
const API_BASE = API_OPTIONS.psgcCloud;

// Static dropdown data
const GENDER_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed", "Separated"];
const EDUCATION_LEVELS = [
  "Elementary",
  "High School",
  "Senior High School",
  "Vocational",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
];

export default function BasicInformation() {
  const insets = useSafeAreaInsets();
  const savedBasicInfo = useVerificationStore((s) => s.basicInfo);
  const setBasicInfo = useVerificationStore((s) => s.setBasicInfo);
  const DEFAULT_COUNTRY = { name: "Philippines", code: "PH" };
  const [formData, setFormData] = useState({
    dateOfBirth: savedBasicInfo.dateOfBirth || "",
    gender: savedBasicInfo.gender || "",
    civilStatus: savedBasicInfo.civilStatus || "",
    educationLevel: savedBasicInfo.educationLevel || "",
    country: savedBasicInfo.country || DEFAULT_COUNTRY.name,
    countryCode: savedBasicInfo.countryCode || DEFAULT_COUNTRY.code,
    region: savedBasicInfo.region || "",
    regionCode: savedBasicInfo.regionCode || "",
    province: savedBasicInfo.province || "",
    provinceCode: savedBasicInfo.provinceCode || "",
    cityTown: savedBasicInfo.cityTown || "",
    cityCode: savedBasicInfo.cityCode || "",
    barangay: savedBasicInfo.barangay || "",
    barangayCode: savedBasicInfo.barangayCode || "",
  });

  // Location data states
  const [regions, setRegions] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Calculate age from date of birth (format: MM/DD/YYYY)
  const ageError = useMemo(() => {
    if (!formData.dateOfBirth) return "";
    const [month, day, year] = formData.dateOfBirth.split("/").map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (age < 18) return "You must be at least 18 years old";
    return "";
  }, [formData.dateOfBirth]);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const baseFieldsFilled = 
      formData.dateOfBirth !== "" &&
      ageError === "" &&
      formData.gender !== "" &&
      formData.civilStatus !== "" &&
      formData.educationLevel !== "" &&
      formData.country !== "";

    // For Philippines, all location fields are required
    if (formData.countryCode === "PH") {
      return baseFieldsFilled &&
        formData.region !== "" &&
        formData.province !== "" &&
        formData.cityTown !== "" &&
        formData.barangay !== "";
    }

    // For other countries, only base fields are required
    return baseFieldsFilled;
  }, [formData, ageError]);

  // Fetch regions when country changes
  useEffect(() => {
    if (formData.countryCode === "PH") {
      fetchRegions();
    } else {
      // Clear dependent fields if country is not Philippines
      setRegions([]);
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      setFormData(prev => ({
        ...prev,
        region: "",
        regionCode: "",
        province: "",
        provinceCode: "",
        cityTown: "",
        cityCode: "",
        barangay: "",
        barangayCode: "",
      }));
    }
  }, [formData.countryCode]);

  // Fetch provinces when region changes
  useEffect(() => {
    if (formData.regionCode) {
      fetchProvinces(formData.regionCode);
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      setFormData(prev => ({
        ...prev,
        province: "",
        provinceCode: "",
        cityTown: "",
        cityCode: "",
        barangay: "",
        barangayCode: "",
      }));
    }
  }, [formData.regionCode]);

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.provinceCode) {
      fetchCities(formData.provinceCode);
    } else {
      setCities([]);
      setBarangays([]);
      setFormData(prev => ({
        ...prev,
        cityTown: "",
        cityCode: "",
        barangay: "",
        barangayCode: "",
      }));
    }
  }, [formData.provinceCode]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.cityCode) {
      fetchBarangays(formData.cityCode);
    } else {
      setBarangays([]);
      setFormData(prev => ({
        ...prev,
        barangay: "",
        barangayCode: "",
      }));
    }
  }, [formData.cityCode]);

  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch(`${API_BASE}/regions`);
      const data = await response.json();
      
      // Transform data to match our format
      const formattedRegions = data.map((region: any) => ({
        code: region.code,
        name: region.name,
      }));
      
      setRegions(formattedRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      // Fallback to hardcoded data if API fails
      setRegions([
        { code: "130000000", name: "National Capital Region (NCR)" },
        { code: "010000000", name: "Region I (Ilocos Region)" },
        { code: "020000000", name: "Region II (Cagayan Valley)" },
        { code: "030000000", name: "Region III (Central Luzon)" },
        { code: "040000000", name: "Region IV-A (CALABARZON)" },
        { code: "170000000", name: "Region IV-B (MIMAROPA)" },
        { code: "050000000", name: "Region V (Bicol Region)" },
        { code: "060000000", name: "Region VI (Western Visayas)" },
        { code: "070000000", name: "Region VII (Central Visayas)" },
        { code: "080000000", name: "Region VIII (Eastern Visayas)" },
        { code: "090000000", name: "Region IX (Zamboanga Peninsula)" },
        { code: "100000000", name: "Region X (Northern Mindanao)" },
        { code: "110000000", name: "Region XI (Davao Region)" },
        { code: "120000000", name: "Region XII (SOCCSKSARGEN)" },
        { code: "160000000", name: "Region XIII (Caraga)" },
        { code: "140000000", name: "Cordillera Administrative Region (CAR)" },
        { code: "150000000", name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)" },
      ]);
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchProvinces = async (regionCode: string) => {
    setLoadingProvinces(true);
    try {
      const response = await fetch(`${API_BASE}/regions/${regionCode}/provinces`);
      const data = await response.json();
      
      const formattedProvinces = data.map((province: any) => ({
        code: province.code,
        name: province.name,
      }));
      
      setProvinces(formattedProvinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setProvinces([
        { code: "012800000", name: "NCR, City of Manila, First District" },
        { code: "042100000", name: "Cavite" },
        { code: "043400000", name: "Laguna" },
        { code: "041000000", name: "Batangas" },
        { code: "045800000", name: "Rizal" },
        { code: "045600000", name: "Quezon" },
      ]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`${API_BASE}/provinces/${provinceCode}/cities-municipalities`);
      const data = await response.json();
      
      const formattedCities = data.map((city: any) => ({
        code: city.code,
        name: city.name,
      }));
      
      setCities(formattedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([
        { code: "137404000", name: "Quezon City" },
        { code: "133900000", name: "Manila" },
        { code: "137602000", name: "Makati City" },
        { code: "137405000", name: "Pasig City" },
        { code: "137601000", name: "Taguig City" },
        { code: "137403000", name: "Pasay City" },
      ]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    setLoadingBarangays(true);
    try {
      const response = await fetch(`${API_BASE}/cities-municipalities/${cityCode}/barangays`);
      const data = await response.json();
      
      const formattedBarangays = data.map((barangay: any) => ({
        code: barangay.code,
        name: barangay.name,
      }));
      
      setBarangays(formattedBarangays);
    } catch (error) {
      console.error("Error fetching barangays:", error);
      setBarangays([]);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleRegionSelect = (option: DropdownOption) => {
    setFormData({
      ...formData,
      region: option.name,
      regionCode: option.code || "",
      province: "",
      provinceCode: "",
      cityTown: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    });
  };

  const handleProvinceSelect = (option: DropdownOption) => {
    setFormData({
      ...formData,
      province: option.name,
      provinceCode: option.code || "",
      cityTown: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    });
  };

  const handleCitySelect = (option: DropdownOption) => {
    setFormData({
      ...formData,
      cityTown: option.name,
      cityCode: option.code || "",
      barangay: "",
      barangayCode: "",
    });
  };

  const handleBarangaySelect = (option: DropdownOption) => {
    setFormData({
      ...formData,
      barangay: option.name,
      barangayCode: option.code || "",
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Scrollable Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        <View className="px-6 pt-12 pb-6">
          {/* Header */}
          <View className="mb-6 mt-10">
            <Text className="text-2xl font-bold mb-2">Basic Information</Text>
            <Text className="text-md text-gray-500 leading-5">
              Please complete the form below with accurate information. Fill out only fields
              information including your name, contact details, and identification numbers. This
              information helps us verify your identity and streamline the application process.
              Ensure all data is accurate and up-to-date to avoid delays in processing your request.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Date of Birth */}
            <DatePicker
              value={formData.dateOfBirth}
              onSelect={(date: string) => setFormData({ ...formData, dateOfBirth: date })}
              errorMessage={ageError}
            />

            {/* Gender */}
            <CustomDropdown
              label="Gender"
              value={formData.gender}
              options={GENDER_OPTIONS.map(g => ({ name: g }))}
              onSelect={(option: DropdownOption) => setFormData({ ...formData, gender: option.name })}
            />

            {/* Civil Status */}
            <CustomDropdown
              label="Civil Status"
              value={formData.civilStatus}
              options={CIVIL_STATUS_OPTIONS.map(s => ({ name: s }))}
              onSelect={(option: DropdownOption) => setFormData({ ...formData, civilStatus: option.name })}
            />

            {/* Education Level */}
            <CustomDropdown
              label="Education Level"
              value={formData.educationLevel}
              options={EDUCATION_LEVELS.map(e => ({ name: e }))}
              onSelect={(option: DropdownOption) => setFormData({ ...formData, educationLevel: option.name })}
            />

            {/* Region - Only enabled if Philippines is selected */}
            <CustomDropdown
              label="Region"
              value={formData.region}
              options={regions}
              onSelect={handleRegionSelect}
              loading={loadingRegions}
              disabled={formData.countryCode !== "PH"}
            />

            {/* Province - Only enabled if region is selected */}
            <CustomDropdown
              label="Province"
              value={formData.province}
              options={provinces}
              onSelect={handleProvinceSelect}
              loading={loadingProvinces}
              disabled={!formData.regionCode}
            />

            {/* City/Town - Only enabled if province is selected */}
            <CustomDropdown
              label="City/Town"
              value={formData.cityTown}
              options={cities}
              onSelect={handleCitySelect}
              loading={loadingCities}
              disabled={!formData.provinceCode}
            />

            {/* Barangay - Only enabled if city is selected */}
            <CustomDropdown
              label="Barangay"
              value={formData.barangay}
              options={barangays}
              onSelect={handleBarangaySelect}
              loading={loadingBarangays}
              disabled={!formData.cityCode}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Progress Dots */}
        <View className="px-6 pt-4 pb-3">
          <ProgressDots currentStep={0} totalSteps={4} />
        </View>

        {/* Action Buttons */}
        <View className="px-6 pb-4 flex-row gap-4">
          <TouchableOpacity 
            className="flex-1 bg-gray-200 py-4 rounded-full"
            onPress={() => { router.back() }}
          >
            <Text className="text-black font-semibold text-base text-center">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-4 rounded-full ${
              isFormValid ? "bg-black" : "bg-gray-300"
            }`}
            onPress={() => { 
              if (isFormValid) {
                setBasicInfo(formData);
                router.push("/(verification)/ContactInformation");
              }
            }}
            disabled={!isFormValid}
          >
            <Text className={`font-semibold text-base text-center ${
              isFormValid ? "text-white" : "text-gray-500"
            }`}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
