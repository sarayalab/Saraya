import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { db, auth } from '../../firebase'; // Import auth and db from firebase
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { signOut } from 'firebase/auth'; // Import signOut function from Firebase

export default function AdminPanel({ navigation }) {
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [content, setContent] = useState('');
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'materials'));
      const materialsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterials(materialsList);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const addMaterial = async () => {
    if (title.trim() === '' || subTitle.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Title, subtitle, and content must be filled out');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'materials'), {
        title,
        subTitle,
        content,
      });
      Alert.alert('Success', 'Material added successfully');
      setTitle('');
      setSubTitle('');
      setContent('');
      fetchMaterials(); // Refresh the materials list
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteMaterial = async (id) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
      Alert.alert('Success', 'Material deleted successfully');
      fetchMaterials(); // Refresh the materials list
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('signin'); // Navigate to login screen after logout
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderMaterial = ({ item }) => (
    <View style={styles.materialItem}>
      <Text style={styles.materialText}>{item.title}</Text>
      <TouchableOpacity onPress={() => deleteMaterial(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <TextInput
        style={styles.input}
        placeholder="Material Title"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Material Subtitle"
        value={subTitle}
        onChangeText={(text) => setSubTitle(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Material Content"
        value={content}
        onChangeText={(text) => setContent(text)}
      />
      <Button title="Add Material" onPress={addMaterial} />
      <FlatList
        data={materials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
        style={styles.materialList}
      />
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  materialList: {
    marginTop: 20,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  materialText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
