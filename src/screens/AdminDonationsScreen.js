import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminDonationsScreen = () => {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    let q;
    if (filter === 'completed') {
      q = query(collection(db, "donations"), where("status", "==", "completed"), orderBy("date", "desc"));
    } else if (filter === 'pending') {
      q = query(collection(db, "donations"), where("status", "==", "pending"), orderBy("date", "desc"));
    } else {
      q = query(collection(db, "donations"), orderBy("date", "desc"));
    }

    const querySnapshot = await getDocs(q);
    setDonations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const updateDonationStatus = async (donationId, currentStatus) => {
    try {
      await updateDoc(doc(db, "donations", donationId), {
        status: currentStatus === 'completed' ? 'pending' : 'completed'
      });
      fetchDonations();
    } catch (error) {
      console.error("Error updating donation status:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Donation Management</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={styles.filterText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={donations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.donationCard}>
            <View style={styles.donationInfo}>
              <Text style={styles.donorName}>{item.donorName}</Text>
              <View style={styles.donationDetails}>
                <Text style={styles.bloodType}>{item.bloodType}</Text>
                <Text style={styles.date}>
                  {new Date(item.date?.toDate()).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.location}>{item.location}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'completed' ? styles.completed : styles.pending
              ]}
              onPress={() => updateDonationStatus(item.id, item.status)}
            >
              <Text style={styles.statusText}>
                {item.status === 'completed' ? 'Completed' : 'Pending'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50'
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-around'
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ecf0f1'
  },
  activeFilter: {
    backgroundColor: '#3498db'
  },
  filterText: {
    color: '#2c3e50',
    fontWeight: 'bold'
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2
  },
  donationInfo: {
    flex: 1
  },
  donorName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  donationDetails: {
    flexDirection: 'row',
    marginVertical: 5
  },
  bloodType: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    marginRight: 10
  },
  date: {
    color: '#7f8c8d',
    fontSize: 12
  },
  location: {
    fontSize: 14,
    color: '#34495e'
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    height: 30,
    alignSelf: 'center'
  },
  pending: {
    backgroundColor: '#f39c12'
  },
  completed: {
    backgroundColor: '#2ecc71'
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  }
});

export default AdminDonationsScreen;