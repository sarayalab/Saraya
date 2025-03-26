import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function EditAccount() {
  const navigation = useNavigation();
  const [userUID, setUserUID] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserUID(user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullname(userData.fullname || '');
          setEmail(userData.email || '');
          setPhoneNumber(userData.phoneNumber || '');
        }
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (userUID) {
      try {
        const userDocRef = doc(db, 'users', userUID);
        await updateDoc(userDocRef, {
          fullname,
          email,
          phoneNumber,
        });
        Alert.alert("Success", "Account details updated successfully!");
      } catch (error) {
        console.error("Error updating account details:", error);
        Alert.alert("Error", "Failed to update account details.");
      }
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-6`}>
        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={28} color="#BB1624" />
          </TouchableOpacity>
          <Text style={tw`ml-4 text-2xl font-bold text-gray-800`}>Account Details</Text>
          <Ionicons name="person-circle-outline" size={44} color="#BB1624" style={tw`ml-4`} />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Full Name</Text>
          <TextInput
            style={tw`border border-gray-300 p-3 rounded-md text-gray-800`}
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullname}
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Email</Text>
          <TextInput
            style={tw`border border-gray-300 p-3 rounded-md text-gray-800`}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-2`}>Phone Number</Text>
          <TextInput
            style={tw`border border-gray-300 p-3 rounded-md text-gray-800`}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          style={tw`bg-red-700 p-4 rounded-md mt-4`}
          onPress={handleSave}
        >
          <Text style={tw`text-white text-center text-base font-semibold`}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
