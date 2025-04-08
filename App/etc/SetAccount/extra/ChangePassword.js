import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

export default function ChangePassword() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState({
    currentPassword: true,
    newPassword: true,
    confirmNewPassword: true,
  });

  const togglePasswordVisibility = (field) => {
    setSecureTextEntry((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const reauthenticate = async (currentPassword) => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      throw error;
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      await reauthenticate(currentPassword);
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password has been changed.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white p-6`}>
      <View style={tw`flex-row items-center mb-6`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
          <Ionicons name="arrow-back" size={24} color="#BB1624" />
        </TouchableOpacity>
        <Text style={tw`text-2xl font-bold text-gray-800`}>Change Password</Text>
      </View>

      <View style={tw`mb-4`}>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 pr-10`}
          placeholder="Current Password"
          value={currentPassword}
          secureTextEntry={secureTextEntry.currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity
          onPress={() => togglePasswordVisibility('currentPassword')}
          style={tw`absolute right-5 top-[50%] -mt-3`}
        >
          <Ionicons
            name={secureTextEntry.currentPassword ? 'eye-off' : 'eye'}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>

      <View style={tw`mb-4`}>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 pr-10`}
          placeholder="New Password"
          value={newPassword}
          secureTextEntry={secureTextEntry.newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          onPress={() => togglePasswordVisibility('newPassword')}
          style={tw`absolute right-5 top-[50%] -mt-3`}
        >
          <Ionicons
            name={secureTextEntry.newPassword ? 'eye-off' : 'eye'}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>

      <View style={tw`mb-4`}>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 pr-10`}
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          secureTextEntry={secureTextEntry.confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        <TouchableOpacity
          onPress={() => togglePasswordVisibility('confirmNewPassword')}
          style={tw`absolute right-5 top-[50%] -mt-3`}
        >
          <Ionicons
            name={secureTextEntry.confirmNewPassword ? 'eye-off' : 'eye'}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={tw`bg-[#BB1624] rounded-lg py-3 mt-6`}
        onPress={handleChangePassword}
      >
        <Text style={tw`text-white text-center text-lg font-semibold`}>Change Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
