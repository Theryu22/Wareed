import React, { useState, useContext, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import { UserContext } from "../context/UserContext";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, push, set } from "firebase/database";
import { database } from "../firebaseConfig";

const donationRequests = [
  {
    id: '1',
    urgency: 'عاجل جدًا',
    bloodType: 'O+',
    location: 'مستشفى الملك خالد، حفر الباطن',
    description: 'حالة طارئة تتطلب تبرعًا فوريًا.',
  },
  {
    id: '2',
    urgency: 'عاجل',
    bloodType: 'A-',
    location: 'مستشفى حفر الباطن المركزي',
    description: 'حالة تحتاج إلى تبرع خلال الساعات القادمة.',
  },
  {
    id: '3',
    urgency: 'عادي',
    bloodType: 'B+',
    location: 'مستشفى الولادة والأطفال، حفر الباطن',
    description: 'حالة يمكن التبرع لها في الأيام القادمة.',
  },
];

export default function UrgencyDetailsScreen({ route, navigation }) {
  const { userName, bloodType } = useContext(UserContext);
  const { urgency } = route.params;

  
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [isBookingEnabled, setIsBookingEnabled] = useState(true); // للتحكم في تفعيل الحجز ينفعنا وقت نبي نسوي تست نقفله على كل اليوزرات اذا سوينا ادمن
  const [overrideClinicHours, setOverrideClinicHours] = useState(true); // يسمح بتجاوز الوقت


  const generateTicketCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const showTicketNotification = (time) => {
    const ticketCode = generateTicketCode();
    const request = selectedRequest;
    
    Alert.alert(
      "تم حجز الموعد بنجاح",
      `اسم المتبرع: ${userName}\nرقم التذكرة: ${ticketCode}\nالوقت: ${time}\nالمكان: ${request.location}`,
      [
        { 
          text: "تم", 
          onPress: () => {
            saveDonationToFirebase(userName, ticketCode, bloodType, time, request);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const saveDonationToFirebase = (donorName, ticketCode, bloodType, time, request) => {
    const donationData = {
      donorName: donorName,
      urgency: request.urgency,
      ticketCode: ticketCode,
      bloodType: bloodType,
      location: request.location,
      date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
      time: time,
      status: 'معلقة',
      timezone: 'Asia/Riyadh'
    };

    const donationRef = ref(database, 'donations');
    const newDonationRef = push(donationRef);

    set(newDonationRef, donationData)
      .then(() => console.log("تم حفظ التبرع بنجاح"))
      .catch((error) => console.error("خطأ في حفظ التبرع: ", error));
  };

  const getSaudiTime = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  };

  const checkClinicHours = () => {
    const now = new Date();
    
    // Convert to Saudi time (UTC+3)
    const saudiOffset = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const saudiTime = new Date(now.getTime() + saudiOffset);
    
    const currentHour = saudiTime.getUTCHours();
    const currentMinutes = saudiTime.getUTCMinutes();
    
    // Clinic is open from 8:00 AM to 4:00 PM Saudi time
    const isOpen = (currentHour > 8 || (currentHour === 8 && currentMinutes >= 0)) && 
                  (currentHour < 16);
    
    setIsClinicOpen(isOpen);
    return isOpen;
  };

  const generateTimeSlots = () => {
    const now = new Date();
    const saudiOffset = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const saudiTime = new Date(now.getTime() + saudiOffset);
    
    let currentHour = saudiTime.getUTCHours(); // Changed to let
    let currentMinutes = saudiTime.getUTCMinutes(); // Changed to let
    
    const slots = [];
    let startHour = Math.max(currentHour, 8); // Changed to let
    const endHour = 16; // Clinic closes at 4 PM
    const interval = 20; // 20 minutes between slots
    
    // Round up to next 20 minute interval
    let firstSlotMinute = Math.ceil(currentMinutes / interval) * interval;
    if (firstSlotMinute >= 60) {
      firstSlotMinute = 0;
      startHour += 1; // This was causing the error
    }
  
    // Generate time slots in Saudi time
    for (let hour = startHour; hour < endHour; hour++) {
      const startMinute = hour === startHour ? firstSlotMinute : 0;
      const endMinute = 60; // Generate slots until :40 for each hour
      
      for (let minute = startMinute; minute < endMinute; minute += interval) {
        const period = hour >= 12 ? 'مساءً' : 'صباحًا';
        const displayHour = hour > 12 ? hour - 12 : hour;
        const timeString = `${displayHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
        
        slots.push(timeString);
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleDonatePress = (request) => {
    setSelectedRequest(request);

    if (!isBookingEnabled) {
      Alert.alert("الحجز غير متاح", "تم إغلاق الحجز مؤقتًا للتجربة.");
      return;
    }
    const isOpen = checkClinicHours();
    
    if (!isOpen && !overrideClinicHours) {
      const now = new Date();
      const saudiOffset = 3 * 60 * 60 * 1000;
      const saudiTime = new Date(now.getTime() + saudiOffset);
      
      Alert.alert(
        "العيادة مغلقة", 
        `الوقت الحالي: ${saudiTime.getUTCHours()}:${saudiTime.getUTCMinutes().toString().padStart(2, '0')}\n` +
        "ساعات العمل من 8 صباحًا إلى 4 مساءً بتوقيت السعودية.\n" +
        "يرجى المحاولة خلال ساعات العمل.",
        [{ text: "حسنًا" }]
      );
    } else {
      generateTimeSlots();
      setIsTimeModalVisible(true);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'عاجل جدًا': return '#f44336';
      case 'عاجل': return '#ff9800';
      case 'عادي': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#075eec" />
      </TouchableOpacity>

      <Text style={styles.header}>طلبات التبرع ({urgency})</Text>
      <Text style={styles.donorInfo}>المتبرع: {userName} | فصيلة الدم: {bloodType}</Text>
      <Text style={styles.clinicHours}>
        ساعات العمل: 8 صباحًا - 4 مساءً (توقيت السعودية)
      </Text>
      
      <FlatList
        data={donationRequests.filter(item => item.urgency === urgency)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getUrgencyColor(item.urgency) }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.bloodType}>{item.bloodType}</Text>
              <Text style={styles.urgencyText}>{item.urgency}</Text>
            </View>
            <Text style={styles.locationText}><Ionicons name="location" size={16} /> {item.location}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
            <TouchableOpacity
              style={styles.donateButton}
              onPress={() => handleDonatePress(item)}
            >
              <Text style={styles.donateButtonText}>حجز موعد</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Time Selection Modal */}
      <Modal
        visible={isTimeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <Text style={styles.modalTitle}>اختر وقت التبرع</Text>
            <Text style={styles.locationTextModal}>
              <Ionicons name="location" size={16} /> {selectedRequest?.location}
            </Text>
            <Text style={styles.timezoneTextModal}>التوقيت: توقيت السعودية</Text>
            
            {availableSlots.length > 0 ? (
              <ScrollView contentContainerStyle={styles.timeSlotsContainer}>
                {availableSlots.map((time, index) => (
                  <TouchableOpacity
                    key={`time-${index}`}
                    style={styles.timeSlotButton}
                    onPress={() => {
                      setIsTimeModalVisible(false);
                      showTicketNotification(time);
                    }}
                  >
                    <Text style={styles.timeSlotText}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noSlotsText}>لا توجد مواعيد متاحة اليوم</Text>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsTimeModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  donorInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  clinicHours: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bloodType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  urgencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 20,
  },
  donateButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#075eec',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timeModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  locationTextModal: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  timezoneTextModal: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeSlotButton: {
    width: '30%',
    padding: 12,
    margin: 5,
    backgroundColor: '#075eec',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSlotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noSlotsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#f44336',
    marginVertical: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
});