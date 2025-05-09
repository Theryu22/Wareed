import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { database, auth } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/ar';

moment.locale('ar');

export default function DonationsScreen({ navigation }) {
  const { userId } = useContext(UserContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = () => {
    setRefreshing(true);
    if (!userId) {
      setRefreshing(false);
      return;
    }

    const donationsQuery = query(
      ref(database, 'donations'),
      orderByChild('userId'),
      equalTo(userId)
    );

    const unsubscribe = onValue(donationsQuery, (snapshot) => {
      const donationsData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const donation = childSnapshot.val();
          
          donationsData.push({
            id: childSnapshot.key,
            donorName: donation.donorName || "غير معروف",
            bloodType: donation.bloodType || "غير محدد",
            location: donation.location || "غير محدد",
            date: donation.date || new Date().toISOString(),
            time: donation.time || "غير محدد",
            status: donation.status || "معلقة",
            urgency: donation.urgency || "عادي",
            ticketCode: donation.ticketCode || "غير متوفر"
          });
        });

        // Sort by date (newest first)
        donationsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      setDonations(donationsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error fetching donations:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchDonations();
    return () => unsubscribe();
  }, [userId]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#4CAF50';
      case 'Rejected': return '#FF5722';
      case 'pending': return '#FFC107';
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

const formatDate = (dateString) => {
  // Ensure the dateString is valid before formatting
  if (!dateString) {
    return "غير محدد";  // Return default if date is invalid
  }
  
  // Parse the date string with moment
  const parsedDate = moment(dateString);

  // Check if the parsed date is valid, otherwise return a default value
  if (!parsedDate.isValid()) {
    // Return a default formatted date instead of ISO string
    return moment().format('DD MMMM YYYY، h:mm a'); // Returns today's date in the preferred format
  }

  // Format the valid date
  return parsedDate.format('DD MMMM YYYY، h:mm a');
};


  const renderDonationItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.urgencyBadge, {backgroundColor: getUrgencyColor(item.urgency)}]}>
          <Text style={styles.urgencyText}>{item.urgency}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={18} color="#075eec" />
          <Text style={styles.infoText}>المتبرع: {item.donorName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="water" size={18} color="#075eec" />
          <Text style={styles.infoText}>فصيلة الدم: {item.bloodType}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color="#075eec" />
          <Text style={styles.infoText}>المكان: {item.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time" size={18} color="#075eec" />
          <Text style={styles.infoText}>الوقت: {item.time}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="barcode" size={18} color="#075eec" />
          <Text style={styles.infoText}>رقم التذكرة: {item.ticketCode}</Text>
        </View>
        
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
          <Text style={styles.statusText}>الحالة: {item.status}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075eec" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={donations}
        renderItem={renderDonationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchDonations}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="water" size={60} color="#ddd" />
            <Text style={styles.emptyText}>لا توجد تبرعات مسجلة</Text>
          </View>
        }
        contentContainerStyle={donations.length === 0 && styles.emptyListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusBadge: {
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
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
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});