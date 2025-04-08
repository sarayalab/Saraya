import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "react-native-vector-icons";
import tw from "twrnc";
import { db } from "./../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Fungsi untuk menghitung waktu tersisa hingga pergantian hari (jam 00:00)
const calculateTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Set waktu ke 00:00 besok
  const timeRemaining = midnight - now; // Selisih waktu dalam milidetik
  return timeRemaining;
};

const News = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [countdown, setCountdown] = useState(calculateTimeUntilMidnight());
  const [currentMonth, setCurrentMonth] = useState("");

  // Mengambil data pengguna dari Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "August",
      "September",
      "October",
      "November",
      "Desember",
    ];
    const date = new Date();
    const month = monthNames[date.getMonth()];
    setCurrentMonth(month);

    return () => unsubscribe();
  }, []);

  // Countdown timer untuk hitungan mundur hingga pergantian hari
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) =>
        prevCountdown > 0 ? prevCountdown - 1000 : calculateTimeUntilMidnight()
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format waktu countdown ke format HH:MM:SS
  const formatTime = (timeInMillis) => {
    const hours = Math.floor(timeInMillis / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMillis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMillis % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Urutkan pengguna berdasarkan total skor tertinggi ke terendah untuk peringkat saja
  const sortedUsers = users
    .map((user) => ({
      ...user,
      monthlyXP:
        user.monthlyQuiz &&
        user.monthlyQuiz.month === new Date().toISOString().slice(0, 7)
          ? user.monthlyQuiz.xp
          : 0,
      totalXP: user.xp || 0,
    }))
    // Primary sort by monthly XP
    .sort((a, b) => b.monthlyXP - a.monthlyXP)
    // Secondary sort by total XP if monthly XP is equal
    .sort((a, b) => {
      if (b.monthlyXP === a.monthlyXP) {
        return b.totalXP - a.totalXP;
      }
      return 0;
    })
    .slice(0, 10);

  return (
    <SafeAreaView style={[tw`flex-1`]}>
      <ScrollView>
        <View style={tw`relative`}>
          <ImageBackground
            source={require("./../assets/leaderboard/cardhead.png")}
            style={[
              tw`w-full h-fit bg-cover`,
              {
                borderBottomLeftRadius: 50,
                borderBottomRightRadius: 50,
                overflow: "hidden",
              },
            ]}
          >
            <View style={tw`items-center justify-between flex-row py-6`}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={tw`left-5`}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={tw`text-white text-base`}>Leaderboard</Text>
              <TouchableOpacity
                onPress={() => alert("Sedang Dalam Perbaikan")}
                style={tw`right-5`}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View
              style={tw`pb-6 gap-1 rounded-2xl flex-col items-center justify-center self-center`}
            >
              <Image
                source={require("./../assets/leaderboard/gold.png")}
                style={tw`w-24 h-24 mt-2`}
              />
              <Text style={tw`text-white text-xl`}>{currentMonth}</Text>
              <View style={tw`flex-col gap-3 justify-center items-center`}>
                <Text style={tw`text-white`}>
                  Masuk 3 besar dan dapatkan hadiah!
                </Text>
                <Text style={tw`text-md text-white`}>
                  {formatTime(countdown)}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={tw`w-full p-4 mb-12 h-full`}>
          {sortedUsers.map((user, index) => (
            <View
              key={user.id}
              style={[
                tw`flex-row items-center p-2 bg-white rounded-2xl mb-2 justify-between gap-4 shadow-xl overflow-hidden`,
              ]}
            >
              <LinearGradient
                colors={[
                  index === 0
                    ? "#FCD220"
                    : index === 1
                    ? "rgba(148, 163, 184, 0.3)"
                    : index === 2
                    ? "rgba(234, 88, 12, 0.3)"
                    : "rgba(229, 229, 229, 0.3)",
                  "white",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.9, y: 0 }}
                style={[
                  tw`absolute opacity-80 left-0 top-0 bottom-0`,
                  {
                    width: 100,
                  },
                ]}
              />
              {index + 1 <= 3 ? (
                <Image
                  source={
                    index === 0
                      ? require("./../assets/leaderboard/medal1.png")
                      : index === 1
                      ? require("./../assets/leaderboard/medal2.png")
                      : require("./../assets/leaderboard/medal3.png")
                  }
                  style={tw`w-7 h-7`}
                />
              ) : (
                <View
                  style={tw`w-7 h-7 rounded-full items-center justify-center`}
                >
                  <Text style={tw`text-sm text-gray-700 font-bold`}>
                    {index + 1}
                  </Text>
                </View>
              )}

              <View
                style={tw`w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3`}
              >
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={tw`w-full h-full rounded-full`}
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#fff"
                  />
                )}
              </View>

              <Text style={tw`flex-1 text-base text-gray-700`}>
                {user.fullname || "-"}
              </Text>

              <Text style={tw`text-base text-gray-700`}>
                {user.xp ? `${user.monthlyXP} XP` : "-"}
                {/* Menampilkan XP yang tersimpan */}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default News;
