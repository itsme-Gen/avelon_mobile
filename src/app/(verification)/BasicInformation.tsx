import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ProgressDots } from "../../components/progressdot/ProgressDot";

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
const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say", "Other"];
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

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  showIcon = false,
  loading = false,
  disabled = false 
}: { 
  label: string; 
  value: string; 
  options: DropdownOption[]; 
  onSelect: (option: DropdownOption) => void; 
  showIcon?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && !loading && setIsOpen(true)}
        disabled={disabled || loading}
        className={`border border-gray-300 rounded-full px-6 py-4 flex-row items-center justify-between ${
          disabled ? "bg-gray-100" : ""
        }`}
      >
        <Text className={`text-base ${value ? "text-black" : "text-gray-400"}`}>
          {loading ? "Loading..." : value || label}
        </Text>
        <View className="flex-row items-center gap-2">
          {showIcon && !loading && (
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
              </View>
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <Pressable className="bg-white rounded-t-3xl max-h-96">
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold">{label}</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.length === 0 ? (
                  <Text className="text-center text-gray-400 py-8">No options available</Text>
                ) : (
                  options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        onSelect(option);
                        setIsOpen(false);
                      }}
                      className={`py-4 border-b border-gray-200 ${
                        value === option.name ? "bg-blue-50" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          value === option.name ? "text-blue-600 font-semibold" : "text-black"
                        }`}
                      >
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// Date Picker Component with Calendar Grid
const DatePicker = ({ value, onSelect }: { value: string; onSelect: (date: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const handleYearChange = (increment: number) => {
    setCurrentYear(currentYear + increment);
    setSelectedDay(null);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay) {
      const monthNum = (currentMonth + 1).toString().padStart(2, '0');
      const dayNum = selectedDay.toString().padStart(2, '0');
      onSelect(`${monthNum}/${dayNum}/${currentYear}`);
      setIsOpen(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="border border-gray-300 rounded-full px-6 py-4 flex-row items-center justify-between"
      >
        <Text className={`text-base ${value ? "text-black" : "text-gray-400"}`}>
          {value || "Date of Birth"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <Pressable className="bg-white rounded-t-3xl">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-semibold">Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Year Selector */}
                <View className="flex-row items-center justify-center gap-4 mb-4">
                  <TouchableOpacity
                    onPress={() => handleYearChange(-1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text className="text-xl font-bold min-w-[80px] text-center">
                    {currentYear}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleYearChange(1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Month Selector */}
                <View className="flex-row items-center justify-between mb-6 px-4">
                  <TouchableOpacity
                    onPress={handlePreviousMonth}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold">
                    {months[currentMonth]}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNextMonth}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View className="mb-6">
                  {/* Week day headers */}
                  <View className="flex-row mb-2">
                    {weekDays.map((day) => (
                      <View key={day} className="flex-1 items-center py-2">
                        <Text className="text-xs font-semibold text-gray-500">{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar days */}
                  <View className="flex-row flex-wrap">
                    {calendarDays.map((day, index) => (
                      <View key={index} className="w-[14.28%] aspect-square p-0.5">
                        {day ? (
                          <TouchableOpacity
                            onPress={() => handleDaySelect(day)}
                            className={`flex-1 items-center justify-center rounded-lg ${
                              selectedDay === day
                                ? "bg-black"
                                : "bg-transparent"
                            }`}
                          >
                            <Text
                              className={`text-base ${
                                selectedDay === day
                                  ? "text-white font-semibold"
                                  : "text-black"
                              }`}
                            >
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View className="flex-1" />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={!selectedDay}
                  className={`py-4 rounded-full ${
                    selectedDay ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white font-semibold text-base text-center">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default function BasicInformation() {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    civilStatus: "",
    educationLevel: "",
    country: "",
    countryCode: "",
    region: "",
    regionCode: "",
    province: "",
    provinceCode: "",
    cityTown: "",
    cityCode: "",
    barangay: "",
    barangayCode: "",
  });

  // Location data states
  const [countries] = useState<DropdownOption[]>([
    { code: "PH", name: "Philippines" },
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "UK", name: "United Kingdom" },
  ]);
  const [regions, setRegions] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

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
      // PSGC Cloud returns: { code, name, regionName, ... }
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
      // PSGC Cloud uses /regions/{code}/provinces endpoint
      const response = await fetch(`${API_BASE}/regions/${regionCode}/provinces`);
      const data = await response.json();
      
      // Transform data to match our format
      const formattedProvinces = data.map((province: any) => ({
        code: province.code,
        name: province.name,
      }));
      
      setProvinces(formattedProvinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      // Fallback data
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
      // PSGC Cloud uses /provinces/{code}/cities-municipalities endpoint
      const response = await fetch(`${API_BASE}/provinces/${provinceCode}/cities-municipalities`);
      const data = await response.json();
      
      // Transform data to match our format
      const formattedCities = data.map((city: any) => ({
        code: city.code,
        name: city.name,
      }));
      
      setCities(formattedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Fallback data
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
      // PSGC Cloud uses /cities-municipalities/{code}/barangays endpoint
      const response = await fetch(`${API_BASE}/cities-municipalities/${cityCode}/barangays`);
      const data = await response.json();
      
      // Transform data to match our format
      const formattedBarangays = data.map((barangay: any) => ({
        code: barangay.code,
        name: barangay.name,
      }));
      
      setBarangays(formattedBarangays);
    } catch (error) {
      console.error("Error fetching barangays:", error);
      // Fallback data - empty since barangays vary greatly
      setBarangays([]);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleCountrySelect = (option: DropdownOption) => {
    setFormData({
      ...formData,
      country: option.name,
      countryCode: option.code || "",
      region: "",
      regionCode: "",
      province: "",
      provinceCode: "",
      cityTown: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    });
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold mb-2">Basic Information</Text>
            <Text className="text-md text-gray-500 leading-5">
              Please complete the form below with accurate information. Fill out only fields
              information including your name, contact details, and identification numbers. This
              information helps us verify your identity and streamline the application process.
              Ensure all data is accurate and up-to-date to avoid delays in processing your request.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4 mb-8">
            {/* Date of Birth */}
            <DatePicker
              value={formData.dateOfBirth}
              onSelect={(date: string) => setFormData({ ...formData, dateOfBirth: date })}
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

            {/* Country */}
            <CustomDropdown
              label="Country"
              value={formData.country}
              options={countries}
              onSelect={handleCountrySelect}
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

          {/* Progress Dots - Using reusable component */}
          <ProgressDots currentStep={0} totalSteps={3} />

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity className="flex-1 bg-gray-200 py-4 rounded-full"
            onPress={()=>{router.back()}}>
              <Text className="text-black font-semibold text-base text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-black py-4 rounded-full"
              onPress={() => { router.push("/(verification)/ContactInformation") }}
            >
              <Text className="text-white font-semibold text-base text-center">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}