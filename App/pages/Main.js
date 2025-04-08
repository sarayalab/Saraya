import {
  ImageBackground,
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Pressable,
  Modal, // Import Modal here
  TouchableOpacity,
  RefreshControl, // Import TouchableOpacity for buttons
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import tw from "twrnc"; // Import twrnc for Tailwind styling
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const MainApp = () => {
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(null);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyXP, setDailyXP] = useState(0);
  const [newXP, setNewXP] = useState(0);

  const fetchUserData = () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        return onSnapshot(userDocRef, async (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const today = new Date().toDateString();
            const lastDailyXPUpdate = userData.dailyXP?.date || "";

            // Reset dailyXP if date is different
            let updatedDailyXP = userData.dailyXP?.value || 0;
            if (lastDailyXPUpdate !== today) {
              updatedDailyXP = 0;
              await updateDoc(userDocRef, {
                dailyXP: {
                  date: today,
                  value: 0,
                },
              });
            }

            setFullname(userData.fullname || "");
            setStreak(userData.streak || 0);
            setLastClaimed(userData.lastClaimed || null);
            setXp(userData.xp || 0);
            setCoins(userData.coins || 0);
            setDailyXP(updatedDailyXP || 0);
          }
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const updateDailyXP = async (newXP) => {
    const today = new Date().toDateString();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        let updatedDailyXP = userData.dailyXP?.value || 0;

        // Tambahkan XP baru ke dailyXP
        updatedDailyXP += newXP;

        // Simpan ke Firestore
        await updateDoc(userDocRef, {
          dailyXP: {
            date: today,
            value: updatedDailyXP, // Update nilai dailyXP
          },
          xp: (userData.xp || 0) + newXP, // Update total XP
        });
        setDailyXP(updatedDailyXP); // Update dailyXP di state
        setXp((userData.xp || 0) + newXP); // Update total XP di state
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  const claimStreak = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const today = new Date().toDateString(); // Current date in string format

      if (lastClaimed === today) {
        alert("Kamu sudah claim streak hari ini!");
        return;
      }

      let updatedStreak = streak;
      let updatedXp = xp;
      let updatedCoins = coins;

      const diffTime = Math.abs(new Date(today) - new Date(lastClaimed));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        updatedStreak = 1; // Reset streak if skipped a day
      } else {
        updatedStreak += 1; // Increment streak
      }

      updatedXp += 10 * updatedStreak; // Add XP based on streak
      updatedCoins += 10 * updatedStreak; // Add Coins based on streak

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        streak: updatedStreak,
        lastClaimed: today,
        xp: updatedXp,
        coins: updatedCoins,
      });

      await updateDailyXP(newXP);
      setStreak(updatedStreak);
      setLastClaimed(today);
      setXp(updatedXp);
      setCoins(updatedCoins);

      alert("Streak berhasil diklaim!");
      closeModal();
    } catch (error) {
      console.error("Failed to claim streak:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserData();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <StatusBar />
      <LinearGradient colors={["#BB1624", "#FCFCFCFF"]} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`}>
          <View style={tw`flex-col p-6 mt-4`}>
            <View style={tw`flex-row items-center justify-between  `}>
              <View style={tw`flex-col  gap-2`}>
                <Text style={tw`text-2xl font-bold text-white `}>
                  Selamat Datang,
                </Text>
              </View>
              <View style={tw`flex-row items-center gap-2`}>
                <Ionicons
                  name="flash-outline"
                  size={24}
                  color="white"
                  onPress={openModal}
                />
                <Ionicons
                  name="notifications"
                  size={24}
                  color="white"
                  onPress={() => navigation.navigate("notification")}
                />
              </View>
            </View>
            <Text style={tw`text-lg font-light text-white `}>{fullname}</Text>
          </View>
          <View style={tw`p-6 mt--4`}>
            <LinearGradient
              colors={["#BB1624", "#53060CFF"]} // Gradient colors
              start={{ x: 0, y: 0 }} // Start point of the gradient
              end={{ x: 1, y: 1 }} // End point of the gradient
              style={[
                tw`p-4 rounded-xl`, // Tailwind styles
                {
                  shadowColor: "#000000", // Shadow color
                  shadowOffset: { width: 3, height: 12 }, // Shadow offset
                  shadowOpacity: 0.3, // Shadow opacity
                  shadowRadius: 2.84, // Shadow radius
                  elevation: 8, // Android shadow
                },
              ]}
            >
              <View style={tw`flex-row `}>
                <Image
                  source={require("./../assets/logoAssets/rina3.png")}
                  style={tw`w-32 `} // Tambahkan ukuran untuk memastikan gambar tidak terlalu besar
                  resizeMode="contain"
                />
                <View style={tw`flex-1 mt-4`}>
                  <Text style={tw`text-lg font-bold text-white`}>
                    Apa kamu sudah siap?
                  </Text>
                  <Text style={tw`text-sm text-white mt-2`}>
                    Bawa bisnismu ke level baru bersama Rina, teman perjalanan
                    suksesmu!
                  </Text>
                  <View
                    style={tw`flex-row items-center gap-4 justify-end mt-4`}
                  >
                    <Text style={tw`text-xs text-gray-200`}>
                      Mulai Sekarang
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("roadmap")}
                      style={tw`bg-white p-1 flex items-center rounded-full`}
                    >
                      <Ionicons name="play" size={20} color="#BB1624" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={tw`px-6 mt-6`}>
            <View style={tw`flex-row justify-between gap-2`}>
              <TouchableOpacity
                style={tw`bg-[#5581F1] flex-1 px-4 py-2 rounded-lg flex-row items-center gap-2`}
                onPress={() => navigation.navigate("tugas")}
              >
                <Image
                  source={require("../assets/homePage/XP1.png")}
                  style={tw`w-10 h-10`}
                />
                <View>
                  <Text style={tw`text-sm text-white`}>{xp}</Text>
                  <Text style={tw`text-sm text-white`}>Total Poin</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-[#EF3C56] flex-1 px-4 py-2 rounded-lg flex-row items-center gap-2`}
                onPress={() => navigation.navigate("tugas")}
              >
                <Image
                  source={require("../assets/homePage/coins.png")}
                  style={tw`w-10 h-10`}
                />
                <View>
                  <Text style={tw`text-sm text-white`}>{coins}</Text>
                  <Text style={tw`text-sm text-white`}>Total Koin</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Explore Lesson */}
            <View style={tw`mt-4`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-lg font-bold text-[#BB1624]`}>
                  Explore Lesson
                </Text>
                <Text
                  style={tw`text-base text-[#BB1624]`}
                  onPress={() => navigation.navigate("myCourses")}
                >
                  Lihat semua
                </Text>
              </View>
              <View style={tw`flex-row flex-wrap justify-between gap-4`}>
                <View
                  style={[
                    tw`flex-1 bg-gray-50 border border-gray-300 px-4 py-4 rounded-lg items-center`,
                    {
                      minHeight: 140, // Konsisten ukuran tinggi card
                      shadowColor: "#000", // Warna bayangan
                      shadowOffset: { width: 0, height: 2 }, // Arah bayangan
                      shadowOpacity: 0.2, // Transparansi bayangan
                      shadowRadius: 3.84, // Radius blur bayangan
                      elevation: 4, // Tinggi bayangan (untuk Android)
                    },
                  ]}
                >
                  <Image
                    source={require("../assets/homePage/inpest.png")}
                    style={tw`w-16 h-16`}
                    resizeMode="contain"
                  />
                  <Text
                    style={tw`text-center text-sm text-gray-800 mt-2`}
                    numberOfLines={2}
                  >
                    Dasar Bisnis Keuangan
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-1 bg-gray-50 border border-gray-300 px-4 py-4 rounded-lg items-center`,
                    {
                      minHeight: 140,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3.84,
                      elevation: 4,
                    },
                  ]}
                >
                  <Image
                    source={require("../assets/homePage/ob.png")}
                    style={tw`w-16 h-16`}
                    resizeMode="contain"
                  />
                  <Text
                    style={tw`text-center text-sm text-gray-800 mt-2`}
                    numberOfLines={2}
                  >
                    Keuangan Pribadi
                  </Text>
                </View>
              </View>
            </View>
            <View style={tw`mt-4 mb-12`}>
              <Text style={tw`text-lg font-bold text-[#BB1624] mb-4`}>
                Spesial Untuk Kamu
              </Text>
              <View
                style={[
                  tw`bg-[#FFB7B7] px-6 py-4 rounded-xl`,
                  {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3.84,
                    elevation: 4,
                  },
                ]}
              >
                <View style={tw`flex-row items-center`}>
                  <Image
                    source={require("../assets/homePage/spesial.png")}
                    style={tw`w-32 h-32`}
                    resizeMode="contain"
                  />
                  <View style={tw`flex-1  items-center`}>
                    <Text style={tw`text-xs text-[#BB1624] text-center `}>
                      Kumpulkan XP dan dapatkan hadiah!
                    </Text>
                    <Text style={tw`text-xl font-bold text-white text-center`}>
                      Ikuti Tantangan Mingguan
                    </Text>
                    <TouchableOpacity
                      style={tw`bg-[#BB1624] mt-2 px-4 py-1 rounded-lg items-center`}
                      onPress={() => navigation.navigate("reward")}
                    >
                      <Text style={tw`text-white text-xs`}>Klik Di Sini</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Text style={tw`text-xs text-neutral-500 mt-4 text-center`}>
                {" "}
                <Text style={tw`font-bold`}>Disclaimer:</Text> Konten ini
                bersifat edukatif dan bukan merupakan saran keuangan. Untuk
                keputusan finansial, harap konsultasikan dengan profesional yang
                berkompeten.
              </Text>
            </View>
          </View>

          {/* Modal claim streak */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}
            >
              <View
                style={tw`w-80 p-6 bg-white items-center rounded-2xl`} // Styling seperti View
              >
                <TouchableOpacity
                  style={tw`absolute top-3 right-3 `}
                  onPress={closeModal} // Close modal on press
                >
                  <Ionicons name="close" size={24} color="#BB1624" />
                </TouchableOpacity>

                {/* Streak Info */}
                <View style={tw`flex-row mb-6 gap-24`}>
                  <View>
                    <Text style={tw`text-left text-black`}>
                      Trek Belajar Kamu
                    </Text>
                    <Text style={tw`text-2xl text-black`}>
                      {streak} <Text style={tw`text-xl`}>Hari</Text>
                    </Text>
                  </View>
                  <Ionicons name="flash-outline" size={58} color="#BB1624" />
                </View>

                {/* Progress Bar */}
                <View style={tw`w-full bg-gray-300 rounded-full h-2.5 mb-4`}>
                  <View
                    style={tw`bg-[#BB1624] h-full rounded-full`}
                    width={`${(streak % 7) * (100 / 7)}%`}
                  />
                </View>

                <Text style={tw`text-sm text-gray-700 mb-4`}>
                  Reward untuk kamu!
                </Text>

                <View
                  style={tw`flex-row justify-evenly items-center w-full mb-6`}
                >
                  <View style={tw` flex-row gap-2 items-center`}>
                    <Image
                      source={require("./../assets/homePage/XP.png")}
                      style={tw`w-10 h-10`}
                    />
                    <Text style={tw`mt-1`}>{xp}</Text>
                  </View>
                  <View style={tw`flex-row gap-2 items-center`}>
                    <Image
                      source={require("./../assets/homePage/coins.png")}
                      style={tw`w-10 h-10`}
                    />
                    <Text style={tw`mt-1`}>{coins}</Text>
                  </View>
                </View>

                <Text style={tw`text-xs mb-2 text-gray-700`}>
                  Kumpulkan poin dan dapatkan hadiahnya
                </Text>

                <TouchableOpacity
                  style={tw`bg-[#BB1624] rounded-lg w-55 py-2 items-center`}
                  onPress={claimStreak}
                >
                  <Text style={tw`text-white text-sm `}>Klaim Sekarang!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MainApp;
