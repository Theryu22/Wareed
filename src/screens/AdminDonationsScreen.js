import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ref, onValue, update, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATUS_OPTIONS = {
  approved: { label: 'Approved', color: '#2ecc71', icon: 'checkmark-circle' },
  rejected: { label: 'Rejected', color: '#e74c3c', icon: 'close-circle' },
  pending: { label: 'Pending', color: '#f39c12', icon: 'time-outline' }
};

const AdminDonationsScreen = ({ navigation }) => {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to view donations');
          setLoading(false);
          return;
        }

        const userRef = ref(database, `users/${user.uid}/isAdmin`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists() && snapshot.val() === true) {
          setIsAdmin(true);
          fetchDonations();
        } else {
          setError('Admin privileges required');
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin check failed:', err);
        setError('Failed to verify admin status');
        setLoading(false);
      }
    };

    const fetchDonations = () => {
      const donationsRef = ref(database, 'donations');
      
      const unsubscribe = onValue(donationsRef, (snapshot) => {
        if (!snapshot.exists()) {
          setDonations([]);
          setLoading(false);
          setError(null);
          return;
        }

        try {
          const rawData = snapshot.val();
          const donationsData = [];
          
          Object.keys(rawData).forEach(key => {
            if (key.startsWith('-')) {
              const donation = rawData[key];
              donationsData.push({
                id: key,
                donorName: donation.donorName || 'Anonymous',
                bloodType: donation.bloodType || 'Unknown',
                date: donation.date || 'No date',
                location: donation.location || 'No location',
                status: donation.status || 'pending',
                ticketCode: donation.ticketCode || '',
                time: donation.time || '',
                timezone: donation.timezone || '',
                urgency: donation.urgency || ''
              });
            }
          });

          setDonations(donationsData);
          setError(null);
        } catch (e) {
          console.error('Data processing error:', e);
          setError('Failed to process donation data');
        } finally {
          setLoading(false);
        }
      }, (error) => {
        console.error('Donations read error:', error);
        setError('Failed to load donations from server');
        setLoading(false);
      });

      return unsubscribe;
    };

    checkAdminStatus();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      setProcessingId(donationId);
      await update(ref(database, `donations/${donationId}`), {
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedBy: auth.currentUser.uid
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update donation status');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const showStatusOptions = (donationId, currentStatus) => {
    Alert.alert(
      'Change Donation Status',
      `Current status: ${currentStatus}`,
      [
        ...Object.keys(STATUS_OPTIONS).map(status => ({
          text: STATUS_OPTIONS[status].label,
          onPress: () => {
            if (status !== currentStatus) {
              updateDonationStatus(donationId, status);
            }
          },
          style: status === 'rejected' ? 'destructive' : 'default'
        })),
        {
          text: "Cancel",
          onPress: () => {}, // Does nothing, just closes the dialog
          style: "cancel" // This makes it a proper cancel button on iOS
        }
      ],
      { cancelable: true }
    );
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.status === filter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading donations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        {!auth.currentUser && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Donation Requests</Text>
      <Text style={styles.debugInfo}>
        Showing {filteredDonations.length} of {donations.length} donations
      </Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'approved' && styles.activeFilter]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.filterText, filter === 'approved' && styles.activeFilterText]}>Approved</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'rejected' && styles.activeFilter]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[styles.filterText, filter === 'rejected' && styles.activeFilterText]}>Rejected</Text>
        </TouchableOpacity>
      </View>

      {filteredDonations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={50} color="#7f8c8d" />
          <Text style={styles.emptyText}>No donations match your filter</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.donationCard}>
              <View style={styles.donationInfo}>
                <Text style={styles.donorName}>{item.donorName}</Text>
                <View style={styles.donationDetails}>
                  <Text style={styles.bloodType}>{item.bloodType}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.location}>{item.location}</Text>
                {item.ticketCode && <Text style={styles.ticketCode}>Ticket: {item.ticketCode}</Text>}
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: STATUS_OPTIONS[item.status]?.color || '#95a5a6' }
                  ]}
                  onPress={() => showStatusOptions(item.id, item.status)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons 
                        name={STATUS_OPTIONS[item.status]?.icon || 'help-circle'} 
                        size={16} 
                        color="#fff" 
                      />
                      <Text style={styles.statusButtonText}>
                        {STATUS_OPTIONS[item.status]?.label || item.status}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginTop: 10,
    textAlign: 'center'
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center'
  },
  debugInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4
  },
  filterButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  activeFilter: {
    backgroundColor: '#3498db'
  },
  filterText: {
    fontSize: 14,
    color: '#555'
  },
  activeFilterText: {
    color: '#fff'
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2
  },
  donationInfo: {
    flex: 1
  },
  donorName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  },
  donationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  bloodType: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    marginRight: 8
  },
  date: {
    fontSize: 14,
    color: '#666'
  },
  location: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4
  },
  ticketCode: {
    fontSize: 14,
    color: '#3498db'
  },
  actionContainer: {
    justifyContent: 'center'
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8
  }
});

export default AdminDonationsScreen;