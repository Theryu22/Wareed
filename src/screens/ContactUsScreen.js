import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const guidelines = [
  {
    title: "شروط التبرع بالدم",
    content: [
      "أن يكون المتبرع بصحة جيدة ولا يعاني من أي أمراض معدية",
      "أن يكون عمر المتبرع بين 18-65 سنة",
      "أن لا يقل وزن المتبرع عن 50 كيلو جرام",
      "أن يكون مستوى الهيموجلوبين للرجال 13-17.5 جم/دل وللنساء 12.5-15.5 جم/دل",
      "أن لا يكون المتبرع قد تبرع بالدم خلال الـ3 أشهر الماضية"
    ]
  },
  {
    title: "إرشادات قبل التبرع",
    content: [
      "احصل على قسط كافٍ من النوم قبل التبرع",
      "تناول وجبة صحية قبل التبرع وتجنب الأطعمة الدسمة",
      "اشرب كميات كافية من الماء قبل وبعد التبرع",
      "تجنب التدخين قبل التبرع بساعتين على الأقل",
      "احضر بطاقتك الشخصية أو الإقامة"
    ]
  },
  {
    title: "إرشادات بعد التبرع",
    content: [
      "استرح لمدة 10-15 دقيقة بعد التبرع",
      "اشرب سوائل أكثر من المعتاد خلال الـ24 ساعة التالية",
      "تجنب النشاط البدني الشاق لمدة 24 ساعة",
      "تجنب التدخين لمدة ساعتين بعد التبرع",
      "إذا شعرت بدوخة أو إعياء، استلقِ وارفع قدميك للأعلى"
    ]
  },
  {
    title: "فوائد التبرع بالدم",
    content: [
      "تنشيط الدورة الدموية ونخاع العظم",
      "تقليل خطر الإصابة بأمراض القلب والشرايين",
      "الكشف المبكر عن بعض الأمراض (يتم فحص الدم قبل نقله)",
      "الشعور بالرضا لإنقاذ حياة الآخرين",
      "تجديد خلايا الدم في الجسم"
    ]
  }
];

export default function ContactUsScreen() {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const openEmail = () => {
    Linking.openURL('mailto:turki.n.alshammari@outlook.sa');
  };

  const openTwitter = () => {
    Linking.openURL('https://twitter.com/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>إرشادات التبرع بالدم</Text>
      
      {guidelines.map((item, index) => (
        <View key={index} style={styles.guidelineItem}>
          <TouchableOpacity 
            style={styles.guidelineHeader}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.8}
          >
            <Text style={styles.guidelineTitle}>{item.title}</Text>
            <Ionicons 
              name={expandedItem === index ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#075eec" 
            />
          </TouchableOpacity>
          
          {expandedItem === index && (
            <View style={styles.guidelineContent}>
              {item.content.map((point, i) => (
                <Text key={i} style={styles.guidelinePoint}>
                  {'\u2022'} {point}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.contactSection}>
        <Text style={styles.contactHeader}>للتواصل معنا</Text>
        
        <TouchableOpacity 
          style={styles.contactItem} 
          onPress={openEmail}
        >
          <Ionicons name="mail" size={24} color="#075eec" />
          <Text style={styles.contactText}>turki.n.alshammari@outlook.sa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={openTwitter}
        >
          <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          <Text style={styles.contactText}>Twitter: @WareedApp</Text>
        </TouchableOpacity>
        
        <View style={styles.contactItem}>
          <Ionicons name="phone-portrait" size={24} color="#075eec" />
          <Text style={styles.contactText}>تطبيق وريد للتبرع بالدم</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  guidelineItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  guidelineHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  guidelineContent: {
    padding: 15,
    paddingRight: 25,
    backgroundColor: '#fff',
  },
  guidelinePoint: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 24,
  },
  contactSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  contactHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  contactItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
});