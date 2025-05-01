import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment-timezone';
import { auth } from '../firebaseConfig';  // التأكد من استيراد auth

export default function DonationsScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = () => {
    setRefreshing(true);
    const userId = auth.currentUser.uid; // الحصول على ال UID الخاص بالمستخدم
    const donationsRef = ref(database, 'donations');

    const unsubscribe = onValue(donationsRef, (snapshot) => {
      const donationsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const donation = childSnapshot.val();

          // تحقق من أن التبرع يخص هذا المستخدم
          if (donation.userId === userId) { // تحقق من وجود userId في التبرع
            let dateValue;
            if (donation.date) {
              if (typeof donation.date === 'object' && donation.date.seconds) {
                // Firebase timestamp object
                dateValue = new Date(donation.date.seconds * 1000).toISOString();
              } else if (typeof donation.date === 'string') {
                // Try parsing as ISO string or other format
                const parsedDate = new Date(donation.date);
                dateValue = isNaN(parsedDate.getTime()) ? new Date().toISOString() : donation.date;
              } else {
                // Fallback to current date
                dateValue = new Date().toISOString();
              }
            } else {
              // No date provided, use Firebase push ID timestamp
              const pushIdTimestamp = parseInt(childSnapshot.key.substring(0,8), 16) * 1000;
              dateValue = new Date(pushIdTimestamp).toISOString();
            }

            donationsData.push({
              id: childSnapshot.key,
              donorName: donation.donorName || 'مجهول',
              ticketCode: donation.ticketCode || 'غير متوفر',
              bloodType: donation.bloodType || 'غير محدد',
              location: donation.location || 'غير محدد',
              date: dateValue,
              appointmentTime: donation.time || 'غير محدد',
              status: donation.status || 'معلقة',
              urgency: donation.urgency || 'عادي'
            });
          }
        });
        
        donationsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDonations(donationsData);
      } else {
        setDonations([]);
      }
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error fetching donations:", error);
      Alert.alert("خطأ", "تعذر تحميل سجل التبرعات");
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  const formatDisplayDate = (dateString) => {
    try {
      let date;
      
      // Handle Firebase timestamp objects
      if (typeof dateString === 'object' && dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
      } 
      // Handle string dates
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
        
        // If invalid, try extracting from Firebase push ID
        if (isNaN(date.getTime()) && dateString.length === 20) {
          const timeStr = dateString.substring(0,8);
          date = new Date(parseInt(timeStr, 16) * 1000);
        }
      }
      
      // Final validation
      if (!date || isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      
      return moment(date).tz('Asia/Riyadh').format('DD/MM/YYYY');
    } catch (error) {
      console.error("Date formatting error:", error, "Original value:", dateString);
      return "تاريخ غير متوفر";
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'مكتمل': return '#4CAF50';
      case 'ملغى': return '#F44336';
      case 'مرفوض': return '#FF5722';
      case 'معلقة': return '#FFC107';
      case 'مقبول': return '#2196F3';
      default: return '#607D8B';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'عاجل جدًا': return '#f44336';
      case 'عاجل': return '#ff9800';
      case 'عادي': return '#4caf50';
      default: return '#607d8b';
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="water" size={60} color="#ddd" />
      <Text style={styles.emptyText}>لا توجد تبرعات مسجلة</Text>
      <TouchableOpacity 
        style={styles.donateButton}
        onPress={() => navigation.navigate('DonateScreen')}
      >
        <Text style={styles.donateButtonText}>تبرع الآن</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    const unsubscribe = fetchDonations();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سجل التبرعات</Text>
        <TouchableOpacity onPress={fetchDonations}>
          <Ionicons name="refresh" size={24} color="#075eec" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.urgencyBadge, {backgroundColor: getUrgencyColor(item.urgency)}]}>
                <Text style={styles.urgencyText}>{item.urgency}</Text>
              </View>
              <Text style={styles.dateText}>{formatDisplayDate(item.date)}</Text>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color="#075eec" />
                <Text style={styles.infoText}>المتبرع: {item.donorName}</Text>
              </View>
               {/* باقي العناصر */}
            </View>
          </View>
        )}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={fetchDonations}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  urgencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  cardBody: {
    paddingTop: 5,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
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
    marginVertical: 20,
    textAlign: 'center',
  },
  donateButton: {
    backgroundColor: '#075eec',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});