import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import tw from "twrnc";
import * as ImagePicker from "expo-image-picker"; // Import Image Picker
import { Modal, TextInput } from "react-native-paper";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default function Akun() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userUID, setUserUID] = useState("");
  const [totalScore, setTotalScore] = useState(null);
  const [fullname, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalModules, setTotalModules] = useState(0);

  const fetchUserData = (uid) => {
    const userDocRef = doc(db, "users", uid);

    // Set up real-time listener
    return onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();

          // Get monthly quiz correct answers
          const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
          const monthlyCorrectAnswers =
            userData.monthlyQuiz && userData.monthlyQuiz.month === currentMonth
              ? userData.monthlyQuiz.correctAnswers || 0
              : 0;

          setFullName(userData.fullname || "");
          setProfileImage(userData.profileImage || null);
          setStreak(userData.streak || 0);
          setXp(userData.xp || 0);
          setTotalModules(
            userData.coursesJoined ? userData.coursesJoined.length : 0
          );
          setBusinessName(userData.businessName || "");
          setTotalScore(monthlyCorrectAnswers);
        }
      },
      (error) => {
        console.error("Failed to load user data:", error);
      }
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setUserUID(user.uid);
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
  const pickImage = async () => {
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
      try {
        const downloadURL = await uploadImage(result.assets[0].uri); // Unggah gambar dan dapatkan URL
        setProfileImage(downloadURL); // Perbarui gambar di UI

        // Simpan URL ke Firestore
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { profileImage: downloadURL });

        Alert.alert("Success", "Profile image updated successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Failed to upload image. Please try again.");
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserData(userUID);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log("Halaman ter-refresh");
    }, 2000);
  };

  const uploadImage = async (uri) => {
    try {
      const storage = getStorage();
      const response = await fetch(uri);
      const blob = await response.blob();

      // Buat referensi di Firebase Storage
      const filename = `profileImages/${
        auth.currentUser.uid
      }_${new Date().getTime()}.jpg`;
      const storageRef = ref(storage, filename);

      // Unggah blob ke Storage
      await uploadBytes(storageRef, blob);

      // Dapatkan URL gambar yang telah diunggah
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("Logout successful");
        navigation.navigate("signin");
      })
      .catch((error) => {
        console.log("Logout error:", error);
        Alert.alert("Logout error", error.message);
      });
  };

  // Fungsi untuk menambah modul yang telah diambil oleh user
  const addModuleToUser = async (uid, moduleId) => {
    const userRef = doc(db, "users", uid);
    try {
      await updateDoc(userRef, {
        modulesTaken: arrayUnion(moduleId),
      });
      console.log("Module added successfully");
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={tw`relative`}>
          <ImageBackground
            source={require("./../assets/AkunPage/cardAcc.png")}
            style={tw`w-full h-55`}
          >
            <View
              style={tw`flex flex-row items-center justify-start p-8 absolute top-5 left-0 right-0 z-10 mt-4`}
            >
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("./../assets/logoAssets/sarayaiconsquare.png")
                  }
                  style={tw`h-18 w-18 rounded-full border-2 border-[#EF980C]`}
                />
              </TouchableOpacity>
              <View
                style={tw`flex flex-col items-center justify-between gap-26`}
              >
                <View style={tw`ml-4`}>
                  <Text style={tw`text-white text-xl font-bold`}>
                    {fullname}
                  </Text>
                  <Text style={tw`text-white text-base`}>{businessName}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("editAccount")}
                  >
                    <Text style={tw`text-white font-semibold`}>Ubah</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View style={tw`p-6 `}>
          <Text style={tw`text-[#BB1624] font-bold text-lg`}>Statistik</Text>
          <View style={tw`flex-row flex-wrap justify-between items-center p-6`}>
            <View style={tw`flex-row items-center w-[45%] gap-2`}>
              <View
                style={tw`w-14 h-14 bg-[#BB1624] rounded-full justify-center items-center`}
              >
                <Ionicons name="book-outline" size={24} color="white" />
              </View>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`text-lg font-bold mt-2`}>{totalModules}</Text>
                <Text style={tw`text-sm text-gray-600`}>Lesson</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center w-[45%] gap-2`}>
              <View
                style={tw`w-14 h-14 bg-[#BB1624] rounded-full justify-center items-center`}
              >
                <Ionicons name="flash-outline" size={24} color="white" />
              </View>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`text-lg font-bold mt-2`}>{streak}</Text>
                <Text style={tw`text-sm text-gray-600`}>Streak</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center w-[45%] gap-2 mt-8`}>
              <View
                style={tw`w-14 h-14 bg-[#BB1624] rounded-full justify-center items-center`}
              >
                <Image
                  source={require("./../assets/homePage/XP1.png")}
                  style={tw`w-8 h-8`}
                />
              </View>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`text-lg font-bold mt-2`}>{xp}</Text>
                <Text style={tw`text-sm text-gray-600`}>XP</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center w-[45%] gap-2`}>
              <View
                style={tw`w-14 h-14 bg-[#BB1624] rounded-full justify-center items-center`}
              >
                <MaterialCommunityIcons
                  name="checkbox-multiple-marked-circle-outline"
                  size={24}
                  color="white"
                />
              </View>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`text-lg font-bold mt-2`}>{totalScore}</Text>
                <Text style={tw`text-sm text-gray-600`}>Akurasi</Text>
              </View>
            </View>
          </View>

          <Text style={tw`text-red-500 font-bold mb-2`}>Akun</Text>
          <OptionItem
            text="Detail Bisnis"
            onPress={() => navigation.navigate("bisnisSurvey")}
          />
          <OptionItem
            text="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
          />

          <Text style={tw`text-red-500 font-bold mt-6 mb-2`}>Tentang</Text>
          <OptionItem
            text="Keuntungan Belajar di Saraya"
            // onPress={() => navigation.navigate("accordionScreen")}
          />
          <OptionItem
            text="Syarat dan Ketentuan"
            onPress={() => navigation.navigate("accordionScreen")}
          />
          <OptionItem
            text="Kebijakan Privasi"
            onPress={() => navigation.navigate("kebijakanPrivasi")}
          />

          <View style={tw`flex-row justify-between items-center mt-2 px-4`}>
            <Text style={tw`text-gray-500 text-xs`}>Version 1.1</Text>
            <Text style={tw`text-gray-500 text-xs`}>
              #TogetherWeShapeTheFuture
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout}>
            <View
              style={tw`flex-row p-4 justify-center items-center w-full bg-[#BB1624] rounded-2xl mt-8 mb-8`}
            >
              <Text style={tw`text-white font-bold`}>Keluar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
