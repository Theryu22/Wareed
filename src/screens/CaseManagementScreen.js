import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { UserContext } from '../context/UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDatabase, ref, push, set, onValue, remove } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';

const CaseManagementScreen = ({ navigation }) => {
  const { isAdmin } = useContext(UserContext);
  const [cases, setCases] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [currentCase, setCurrentCase] = useState({
    urgency: 'عادي',
    bloodType: '',
    location: '',
    description: ''
  });
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert("غير مسموح", "ليس لديك صلاحية الدخول إلى هذه الصفحة");
      navigation.goBack();
      return;
    }

    const casesRef = ref(database, 'donationCases');
    onValue(casesRef, (snapshot) => {
      const casesData = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          casesData.push({
            id: child.key,
            ...child.val()
          });
        });
      }
      setCases(casesData);
    });
  }, [isAdmin]);

  const handleAddCase = () => {
    setEditingCase(null);
    setCurrentCase({
      urgency: 'عادي',
      bloodType: '',
      location: '',
      description: ''
    });
    setIsModalVisible(true);
  };

  const handleEditCase = (caseItem) => {
    setEditingCase(caseItem);
    setCurrentCase({
      urgency: caseItem.urgency,
      bloodType: caseItem.bloodType,
      location: caseItem.location,
      description: caseItem.description
    });
    setIsModalVisible(true);
  };

  const handleDeleteCase = (caseId) => {
    Alert.alert(
      "حذف الحالة",
      "هل أنت متأكد من حذف هذه الحالة؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "حذف", 
          onPress: () => {
            const caseRef = ref(database, `donationCases/${caseId}`);
            remove(caseRef)
              .then(() => Alert.alert("تم الحذف", "تم حذف الحالة بنجاح"))
              .catch(error => Alert.alert("خطأ", "حدث خطأ أثناء الحذف"));
          },
          style: "destructive"
        }
      ]
    );
  };

  const saveCase = () => {
    if (!currentCase.bloodType || !currentCase.location || !currentCase.description) {
      Alert.alert("خطأ", "الرجاء تعبئة جميع الحقول");
      return;
    }

    const casesRef = ref(database, 'donationCases');
    
    if (editingCase) {
      // Update existing case
      const caseRef = ref(database, `donationCases/${editingCase.id}`);
      set(caseRef, currentCase)
        .then(() => {
          Alert.alert("تم التحديث", "تم تحديث الحالة بنجاح");
          setIsModalVisible(false);
        })
        .catch(error => Alert.alert("خطأ", "حدث خطأ أثناء التحديث"));
    } else {
      // Add new case
      const newCaseRef = push(casesRef);
      set(newCaseRef, currentCase)
        .then(() => {
          Alert.alert("تم الإضافة", "تم إضافة الحالة بنجاح");
          setIsModalVisible(false);
        })
        .catch(error => Alert.alert("خطأ", "حدث خطأ أثناء الإضافة"));
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

      <Text style={styles.header}>إدارة حالات التبرع</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddCase}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>إضافة حالة جديدة</Text>
      </TouchableOpacity>

      <ScrollView style={styles.casesContainer}>
        {cases.map((caseItem) => (
          <View key={caseItem.id} style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <Text style={[styles.urgencyText, { 
                backgroundColor: getUrgencyColor(caseItem.urgency) 
              }]}>
                {caseItem.urgency}
              </Text>
              <View style={styles.caseActions}>
                <TouchableOpacity onPress={() => handleEditCase(caseItem)}>
                  <Ionicons name="create" size={20} color="#075eec" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCase(caseItem.id)}>
                  <Ionicons name="trash" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.bloodType}>{caseItem.bloodType}</Text>
            <Text style={styles.location}><Ionicons name="location" size={16} /> {caseItem.location}</Text>
            <Text style={styles.description}>{caseItem.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Case Form Modal with Keyboard Avoiding */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.modalScrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {editingCase ? 'تعديل الحالة' : 'إضافة حالة جديدة'}
              </Text>

              <Text style={styles.label}>درجة الإستعجال</Text>
              <View style={styles.urgencyOptions}>
                {['عاجل جدًا', 'عاجل', 'عادي'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.urgencyOption,
                      currentCase.urgency === option && styles.selectedUrgency
                    ]}
                    onPress={() => setCurrentCase({...currentCase, urgency: option})}
                  >
                    <Text style={styles.urgencyOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>فصيلة الدم</Text>
              <TextInput
                style={styles.input}
                value={currentCase.bloodType}
                onChangeText={(text) => setCurrentCase({...currentCase, bloodType: text})}
                placeholder="مثال: O+"
                returnKeyType="next"
              />

              <Text style={styles.label}>الموقع</Text>
              <TextInput
                style={styles.input}
                value={currentCase.location}
                onChangeText={(text) => setCurrentCase({...currentCase, location: text})}
                placeholder="مثال: مستشفى الملك خالد"
                returnKeyType="next"
              />

              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={currentCase.description}
                onChangeText={(text) => setCurrentCase({...currentCase, description: text})}
                placeholder="وصف الحالة"
                multiline
                textAlignVertical="top"
                blurOnSubmit={true}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={saveCase}
                >
                  <Text style={styles.saveButtonText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#075eec',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  casesContainer: {
    flex: 1,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  caseActions: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  urgencyText: {
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bloodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignSelf: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  urgencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  urgencyOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '30%',
    alignItems: 'center',
  },
  selectedUrgency: {
    borderColor: '#075eec',
    backgroundColor: '#e3f2fd',
  },
  urgencyOptionText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CaseManagementScreen;