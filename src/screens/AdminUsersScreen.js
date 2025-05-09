import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminUsersScreen = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDonations = () => {
      try {
        const donationsRef = query(ref(database, 'donations'), orderByChild('timestamp'));
        onValue(donationsRef, (snapshot) => {
          const donationsData = snapshot.val() || {};
          const formattedDonations = [];
          
          Object.keys(donationsData).forEach(donationId => {
            const donation = donationsData[donationId];
            formattedDonations.push({
              id: donationId,
              ...donation,
              userName: donation.userInfo?.name || 'Anonymous',
              userEmail: donation.userInfo?.email || 'No email'
            });
          });
          
          setDonations(formattedDonations.reverse());
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching donations:", error);
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const sendTicketEmail = (donation) => {
    const subject = `Your Donation Receipt #${donation.id.slice(0, 6)}`;
    const body = `
      Dear ${donation.userName},

      Thank you for your generous donation of $${donation.amount}.

      ========================
      DONATION RECEIPT
      ========================
      Transaction ID: ${donation.id}
      Date: ${new Date(donation.timestamp).toLocaleDateString()}
      Amount: $${donation.amount}
      Status: ${donation.status || 'Completed'}

      This email serves as your official receipt for tax purposes.

      Sincerely,
      Your Organization Team
    `;

    const mailtoUrl = `mailto:${donation.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl)
      .then(() => console.log('Email client opened'))
      .catch((err) => {
        Alert.alert(
          "Error",
          "Could not open email client. Please copy this receipt manually:\n\n" + body,
          [
            {
              text: "Copy",
              onPress: () => {
                // You would implement clipboard copying here
                // For example using expo-clipboard:
                // Clipboard.setString(body);
                Alert.alert("Copied", "Receipt copied to clipboard");
              }
            },
            { text: "OK" }
          ]
        );
      });
  };

  const renderDonationItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Donation #{item.id.slice(0, 6)}</Text>
        <Text style={styles.cardSubtitle}>${item.amount} • {new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>From: {item.userName}</Text>
        <Text style={styles.cardText}>Email: {item.userEmail}</Text>
        <Text style={styles.cardText}>Status: {item.status || 'pending'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.emailButton}
        onPress={() => sendTicketEmail(item)}
      >
        <Ionicons name="mail" size={18} color="white" />
        <Text style={styles.emailButtonText}>Send Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Donation Management</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search donations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={donations.filter(donation => 
          donation.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
          donation.userName.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderDonationItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No donations found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  header: {
    marginBottom: 20
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2
  },
  cardHeader: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 14
  },
  cardBody: {
    marginVertical: 8
  },
  cardText: {
    color: '#444',
    marginBottom: 4
  },
  emailButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  emailButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  }
});

export default AdminUsersScreen;