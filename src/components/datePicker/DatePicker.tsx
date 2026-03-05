// components/datepicker/DatePicker.tsx
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";

const MIN_AGE = 18;

interface DatePickerProps {
  value: string;
  onSelect: (date: string) => void;
  errorMessage?: string;
}

export const DatePicker = ({ value, onSelect, errorMessage }: DatePickerProps) => {
  const today = new Date();
  const maxYear = today.getFullYear() - MIN_AGE;

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(maxYear);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isYearListOpen, setIsYearListOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Precompute a scrollable list of years (from maxYear going back 100 years)
  const yearOptions = useMemo(() => {
    const startYear = maxYear - 100;
    const list: number[] = [];
    for (let y = maxYear; y >= startYear; y--) {
      list.push(y);
    }
    return list;
  }, [maxYear]);

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

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if a specific day is selectable (must be at least 18 years old)
  const isDayDisabled = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const cutoff = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
    return selectedDate > cutoff;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
    setIsYearListOpen(false);
  };

  const handleNextMonth = () => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    // Prevent navigating past the max allowed year/month
    if (nextYear > maxYear || (nextYear === maxYear && nextMonth > today.getMonth())) {
      return;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
    setSelectedDay(null);
    setIsYearListOpen(false);
  };

  const handleYearChange = (increment: number) => {
    const newYear = currentYear + increment;
    if (newYear > maxYear || newYear < maxYear - 100) return;
    setCurrentYear(newYear);
    setSelectedDay(null);
    setIsYearListOpen(false);
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
        className={`border rounded-full px-6 py-4 flex-row items-center justify-between ${
          errorMessage ? "border-red-400" : "border-gray-300"
        }`}
      >
        <Text className={`text-base ${value ? "text-black" : "text-gray-400"}`}>
          {value || "Date of Birth"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-1 ml-2">{errorMessage}</Text>
      )}

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <Pressable className="bg-white rounded-t-3xl">
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-semibold">Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Year Selector */}
                <View className="flex-row items-center justify-center gap-4 mb-2">
                  <TouchableOpacity
                    onPress={() => handleYearChange(-1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsYearListOpen(!isYearListOpen)}
                    className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-xl font-bold text-center">
                      {currentYear}
                    </Text>
                    <Ionicons
                      name={isYearListOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#000"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleYearChange(1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                {isYearListOpen && (
                  <View className="mb-4">
                    <Text className="text-xs text-gray-500 text-center mb-2">
                      Tap a year to jump directly
                    </Text>
                    <ScrollView
                      style={{ maxHeight: 240 }}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      <View className="flex-row flex-wrap -mx-1">
                        {yearOptions.map((year) => (
                          <View key={year} className="w-1/3 px-1 pb-2">
                            <TouchableOpacity
                              onPress={() => {
                                setCurrentYear(year);
                                setSelectedDay(null);
                                setIsYearListOpen(false);
                              }}
                              className={`py-3 rounded-lg items-center justify-center ${
                                currentYear === year ? "bg-black" : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-base ${
                                  currentYear === year
                                    ? "text-white font-semibold"
                                    : "text-gray-900"
                                }`}
                              >
                                {year}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

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
                  <View className="flex-row mb-2">
                    {weekDays.map((day) => (
                      <View key={day} className="flex-1 items-center py-2">
                        <Text className="text-xs font-semibold text-gray-500">{day}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row flex-wrap">
                    {calendarDays.map((day, index) => {
                      const disabled = day ? isDayDisabled(day) : false;
                      return (
                        <View key={index} className="w-[14.28%] aspect-square p-0.5">
                          {day ? (
                            <TouchableOpacity
                              onPress={() => !disabled && handleDaySelect(day)}
                              disabled={disabled}
                              className={`flex-1 items-center justify-center rounded-lg ${
                                selectedDay === day
                                  ? "bg-black"
                                  : disabled
                                    ? "bg-transparent opacity-30"
                                    : "bg-transparent"
                              }`}
                            >
                              <Text
                                className={`text-base ${
                                  selectedDay === day
                                    ? "text-white font-semibold"
                                    : disabled
                                      ? "text-gray-300"
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
                      );
                    })}
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
