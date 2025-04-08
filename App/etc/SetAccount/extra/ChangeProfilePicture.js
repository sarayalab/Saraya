import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../firebase'; // Sesuaikan dengan jalur impor Anda
import { doc, updateDoc } from 'firebase/firestore';

export default function ChangeProfilePicture() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Simpan gambar ke Firebase Storage jika diperlukan
      // const response = await fetch(result.assets[0].uri);
      // const blob = await response.blob();
      // Upload gambar ke Firebase Storage
    }
  };

  const handleSaveProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        profilePicture: image,
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Change Profile Picture</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <TouchableOpacity onPress={handleSaveProfilePicture} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#BF3131',
    padding: 12,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
