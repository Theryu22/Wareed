import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: !currentStatus
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#95a5a6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name || 'No name'}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userType}>
                {item.isAdmin ? 'Admin' : 'Regular User'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.adminToggle,
                item.isAdmin ? styles.adminActive : styles.adminInactive
              ]}
              onPress={() => toggleAdminStatus(item.id, item.isAdmin)}
            >
              <Text style={styles.adminToggleText}>
                {item.isAdmin ? 'Revoke Admin' : 'Make Admin'}
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
    marginBottom: 20,
    color: '#2c3e50'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  userEmail: {
    color: '#7f8c8d',
    fontSize: 14
  },
  userType: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 5
  },
  adminToggle: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10
  },
  adminActive: {
    backgroundColor: '#e74c3c'
  },
  adminInactive: {
    backgroundColor: '#2ecc71'
  },
  adminToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  }
});

export default AdminUsersScreen;