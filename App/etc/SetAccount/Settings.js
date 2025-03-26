import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { auth, db } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage methods
import * as ImagePicker from "expo-image-picker"; // Import Image Picker

export default function Settings() {
  const navigation = useNavigation();
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [user, setUser] = useState(null);
  const [userUID, setUserUID] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const loadUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Failed to load user data:", error);
      return null;
    }
  };

  const fetchUserData = async (uid) => {
    const userData = await loadUserData(uid);
    if (userData) {
      setUserEmail(userData.email);
      setFullName(userData.fullname);
      setPhoneNumber(userData.phoneNumber || "");
      setProfileImage(userData.profileImage);
      setBusinessName(userData.businessName);
    }
  };

  const pickImage = async () => {
    // Meminta izin akses media
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const storage = getStorage();
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_pictures/${userUID}`);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfileImage(downloadURL);
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  const updateProfileImage = async (imageURL) => {
    try {
      const userDocRef = doc(db, "users", userUID);
      await updateDoc(userDocRef, { profileImage: imageURL });
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image in Firestore: ", error);
    }
  };

  const updateUserDetails = async () => {
    try {
      const userDocRef = doc(db, "users", userUID);
      await updateDoc(userDocRef, { fullname, email, phoneNumber });
      Alert.alert("Success", "Profile details updated successfully!");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating user details in Firestore: ", error);
      Alert.alert("Error", "Failed to update profile details.");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setUserUID(user.uid);
        setUserEmail(user.email);
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (userUID) {
        fetchUserData(userUID);
      }
    }, [userUID])
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView>
        <View style={tw`relative`}>
          <Image
            source={require("./../../assets/AkunPage/Promotion2.png")}
            style={tw`w-full h-50 mb-15`}
            resizeMode="stretch"
          />

          <View
            style={tw`absolute top-15 left-0 right-0 flex-row items-center px-6`}
          >
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("./../../assets/AkunPage/Promotion2.png")
                }
                style={tw`w-16 h-16 rounded-full border-4 border-[#EF980C]`}
              />
            </TouchableOpacity>

            <View style={tw`ml-4`}>
              <Text style={tw`text-white text-lg font-bold`}>{fullname}</Text>
              <Text style={tw`text-white text-sm mb-2`}>{businessName}</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={tw`text-white font-semibold`}>Ubah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`p-4`}>
          <Text style={tw`text-red-500 font-bold mb-2`}>Akun</Text>
          <OptionItem
            text="Detail Bisnis"
            onPress={() => navigation.navigate("bisnisSurvey")}
          />
          <OptionItem
            text="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
          />
          <OptionItem text="Lorem Ipsum" onPress={() => {}} />

          <Text style={tw`text-red-500 font-bold mt-6 mb-2`}>Bantuan</Text>
          <OptionItem text="Pusat Bantuan" onPress={() => {}} />
          <OptionItem text="Laporan Kamu" onPress={() => {}} />

          <Text style={tw`text-red-500 font-bold mt-6 mb-2`}>Tentang</Text>
          <OptionItem text="Keuntungan Belajar di Saraya" onPress={() => {}} />
          <OptionItem text="Panduan Saraya" onPress={() => {}} />
          <OptionItem text="Syarat dan Ketentuan" onPress={() => {}} />
          <OptionItem text="Kebijakan Privasi" onPress={() => {}} />

          <View style={tw`flex-row justify-between items-center mt-2 px-4`}>
            <Text style={tw`text-gray-500 text-xs`}>Version 1.1</Text>
            <Text style={tw`text-gray-500 text-xs`}>
              #TogetherWeShapeTheFuture
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit User Details Modal */}
      <Modal visible={modalVisible} animationType="fade">
        <View style={tw`flex-1 justify-center items-center bg-white p-6`}>
          <Text style={tw`text-lg font-bold mb-4`}>Edit Your Details</Text>
          <TextInput
            style={tw`border border-gray-400 w-full p-2 rounded mb-4`}
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullName}
          />
          <TextInput
            style={tw`border border-gray-400 w-full p-2 rounded mb-4`}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={tw`border border-gray-400 w-full p-2 rounded mb-4`}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity
            style={tw`bg-blue-500 rounded p-2 w-full mt-2`}
            onPress={updateUserDetails}
          >
            <Text style={tw`text-white text-center`}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-gray-500 rounded p-2 w-full mt-2`}
            onPress={() => setModalVisible(false)}
          >
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Component for each option item
const OptionItem = ({ text, onPress }) => (
  <TouchableOpacity
    style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}
    onPress={onPress}
  >
    <View style={tw`flex-row items-center`}>
      <Text style={tw`text-black font-medium`}>{text}</Text>
    </View>
    <AntDesign name="right" size={15} color="black" />
  </TouchableOpacity>
);
