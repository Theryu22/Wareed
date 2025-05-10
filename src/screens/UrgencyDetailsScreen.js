import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { UserContext } from "../context/UserContext";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDatabase, ref, push, set, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { auth, database } from '../firebase/firebaseConfig';
import QRCode from 'react-native-qrcode-svg';

export default function UrgencyDetailsScreen({ route, navigation }) {
  const { userName, bloodType } = useContext(UserContext);
  const { urgency } = route.params;
  
  const [donationRequests, setDonationRequests] = useState([]);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [isBookingEnabled, setIsBookingEnabled] = useState(true);
  const [overrideClinicHours, setOverrideClinicHours] = useState(true);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchDonationRequests = () => {
      setRefreshing(true);
      const requestsRef = ref(database, 'donationCases');
      const queryRef = query(requestsRef, orderByChild('urgency'), equalTo(urgency));
      
      onValue(queryRef, (snapshot) => {
        const requests = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            requests.push({
              id: child.key,
              ...child.val()
            });
          });
        }
        setDonationRequests(requests);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
        setRefreshing(false);
      });
    };

    fetchDonationRequests();
  }, [urgency]);

  const generateTicketCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const showTicketNotification = (time) => {
    const ticketCode = generateTicketCode();
    const request = selectedRequest;
    
    setTicketDetails({
      donorName: userName,
      ticketCode: ticketCode,
      time: time,
      location: request.location,
      bloodType: bloodType,
      urgency: request.urgency
    });
    
    setIsTimeModalVisible(false);
    setIsTicketModalVisible(true);
    
    saveDonationToFirebase(userName, ticketCode, bloodType, time, request);
  };

  const saveDonationToFirebase = async (donorName, ticketCode, bloodType, time, request) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const db = getDatabase();
      const donationsRef = ref(db, 'donations');
      const newDonationRef = push(donationsRef);

      const donationData = {
        donorName: donorName,
        urgency: request.urgency,
        ticketCode: ticketCode,
        bloodType: bloodType,
        location: request.location,
        date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
        time: time,
        status: 'pending',
        timezone: 'Asia/Riyadh',
        userId: user.uid,
        createdAt: Date.now()
      };

      await set(newDonationRef, donationData);
      console.log("تم حفظ التبرع بنجاح");
      return newDonationRef.key;
    } catch (error) {
      console.error("خطأ في حفظ التبرع: ", error);
      throw error;
    }
  };

  const checkClinicHours = () => {
    const now = new Date();
    
    // Convert to Saudi time (UTC+3)
    const saudiOffset = 3 * 60 * 60 * 1000;
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
    const saudiOffset = 3 * 60 * 60 * 1000;
    const saudiTime = new Date(now.getTime() + saudiOffset);
    
    let currentHour = saudiTime.getUTCHours();
    let currentMinutes = saudiTime.getUTCMinutes();
    
    const slots = [];
    let startHour = Math.max(currentHour, 8);
    const endHour = 16;
    const interval = 20;
    
    // Round up to next 20 minute interval
    let firstSlotMinute = Math.ceil(currentMinutes / interval) * interval;
    if (firstSlotMinute >= 60) {
      firstSlotMinute = 0;
      startHour += 1;
    }
  
    // Generate time slots in Saudi time
    for (let hour = startHour; hour < endHour; hour++) {
      const startMinute = hour === startHour ? firstSlotMinute : 0;
      const endMinute = 60;
      
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
      </View>
    );
  }

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
        data={donationRequests}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              const requestsRef = ref(database, 'donationCases');
              const queryRef = query(requestsRef, orderByChild('urgency'), equalTo(urgency));
              onValue(queryRef, (snapshot) => {
                const requests = [];
                if (snapshot.exists()) {
                  snapshot.forEach((child) => {
                    requests.push({
                      id: child.key,
                      ...child.val()
                    });
                  });
                }
                setDonationRequests(requests);
                setRefreshing(false);
              });
            }}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="water" size={60} color="#ddd" />
              <Text style={styles.emptyText}>لا توجد حالات متاحة حالياً</Text>
            </View>
          )
        }
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
                    onPress={() => showTicketNotification(time)}
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

      {/* Ticket Modal */}
      <Modal
        visible={isTicketModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsTicketModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.ticketModalOverlay}>
          <View style={styles.ticketContainer}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>تذكرة التبرع بالدم</Text>
              <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
            </View>
            
            <View style={styles.ticketQRContainer}>
              <QRCode
                value={ticketDetails?.ticketCode}
                size={150}
                color="#000"
                backgroundColor="#fff"
              />
            </View>
            
            <View style={styles.ticketDetails}>
              <View style={styles.ticketRow}>
                <Ionicons name="person" size={20} color="#555" />
                <Text style={styles.ticketText}>المتبرع: {ticketDetails?.donorName}</Text>
              </View>
              
              <View style={styles.ticketRow}>
                <Ionicons name="ticket" size={20} color="#555" />
                <Text style={styles.ticketText}>رقم التذكرة: {ticketDetails?.ticketCode}</Text>
              </View>
              
              <View style={styles.ticketRow}>
                <Ionicons name="time" size={20} color="#555" />
                <Text style={styles.ticketText}>الوقت: {ticketDetails?.time}</Text>
              </View>
              
              <View style={styles.ticketRow}>
                <Ionicons name="location" size={20} color="#555" />
                <Text style={styles.ticketText}>المكان: {ticketDetails?.location}</Text>
              </View>
              
              <View style={styles.ticketRow}>
                <Ionicons name="water" size={20} color="#555" />
                <Text style={styles.ticketText}>فصيلة الدم: {ticketDetails?.bloodType}</Text>
              </View>
              
              <View style={styles.ticketRow}>
                <Ionicons name="alert-circle" size={20} color="#555" />
                <Text style={styles.ticketText}>الأولوية: {ticketDetails?.urgency}</Text>
              </View>
            </View>
            
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketNote}>يرجى إحضار الهوية الوطنية عند الحضور</Text>
              <Text style={styles.ticketNote}>هذه التذكرة صالحة ليوم واحد فقط</Text>
            </View>
            
            <TouchableOpacity
              style={styles.ticketCloseButton}
              onPress={() => {
                setIsTicketModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.ticketCloseButtonText}>تم</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
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
  ticketModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  ticketContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  ticketTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  ticketQRContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ticketDetails: {
    width: '100%',
    marginVertical: 10,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  ticketText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  ticketFooter: {
    marginTop: 15,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  ticketNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 3,
    fontStyle: 'italic',
  },
  ticketCloseButton: {
    marginTop: 20,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  ticketCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});