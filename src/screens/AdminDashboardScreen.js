import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminDashboard = ({ navigation }) => {
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch urgent requests
    const urgentQuery = query(collection(db, "donations"), where("urgency", "==", "high"));
    const urgentSnapshot = await getDocs(urgentQuery);
    setUrgentRequests(urgentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Fetch recent donations
    const donationsQuery = query(collection(db, "donations"), orderBy("date", "desc"), limit(10));
    const donationsSnapshot = await getDocs(donationsQuery);
    setDonations(donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Fetch users
    const usersSnapshot = await getDocs(collection(db, "users"));
    setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const adminCards = [
    { 
      title: "Urgent Requests", 
      count: urgentRequests.length,
      icon: "alert-circle",
      color: "#e74c3c",
      screen: "AdminDonationsScreen"
    },
    { 
      title: "Today's Donations", 
      count: donations.filter(d => isToday(d.date)).length,
      icon: "water",
      color: "#3498db",
      screen: "AdminDonationsScreen"
    },
    { 
      title: "Registered Users", 
      count: users.length,
      icon: "people",
      color: "#2ecc71",
      screen: "AdminUserScreen"
    },
    { 
      title: "Blood Inventory", 
      count: "Manage",
      icon: "flask",
      color: "#9b59b6",
      screen: "AdminInventory"
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      
      <ScrollView>
        <View style={styles.cardContainer}>
          {adminCards.map((card, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.card, { backgroundColor: card.color }]}
              onPress={() => navigation.navigate(card.screen)}
            >
              <Ionicons name={card.icon} size={30} color="#fff" />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardCount}>{card.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Urgent Requests</Text>
          {urgentRequests.slice(0, 3).map(request => (
            <TouchableOpacity key={request.id} style={styles.requestItem}>
              <Text style={styles.requestText}>{request.donorName} - {request.bloodType}</Text>
              <Text style={styles.requestLocation}>{request.location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50'
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center'
  },
  cardCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#2c3e50'
  },
  requestItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  requestText: {
    fontWeight: '600'
  },
  requestLocation: {
    color: '#7f8c8d',
    fontSize: 12
  }
});

export default AdminDashboard;