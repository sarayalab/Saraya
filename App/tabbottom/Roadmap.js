import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "react-native-elements";

const Roadmap = () => {
  const [initialModules, setInitialModules] = useState([
    {
      id: 0,
      title: "Dasar-Dasar Keuangan I",
      status: "in-progress",
      route: "videoKeuangan",
    },
    {
      id: 1,
      title: "Dasar-Dasar Keuangan II",
      status: "locked",
      route: "dasarKeuangan",
    },
  ]);

  const [mainModules, setMainModules] = useState([
    {
      id: 2,
      title: "Foundation I",
      status: "locked",
      route: "kuisLaporanKeuangan",
    },
    {
      id: 3,
      title: "Foundation II",
      status: "locked",
      route: "kuisFondationI",
    },
    {
      id: 4,
      title: "Tujuan Keuangan",
      status: "locked",
      route: "kuisTujuanKeuangan",
    },
    { id: 5, title: "Nilai Uang", status: "locked", route: "kuisNilaiUang" },
    {
      id: 6,
      title: "Aset dan Liabilitas",
      status: "locked",
      route: "kuisAsetLiabilitas",
    },
  ]);

  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      fetchUserData(user.uid);
      console.log("user", user);
    }
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);

      // Create real-time listener
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setXp(userData.xp || 0);
          setCoins(userData.coins || 0);

          const completedModules = userData.completedModules || [];

          // Update initialModules
          setInitialModules((prevModules) =>
            prevModules.map((module, index) => {
              if (index === 0) {
                return { ...module, status: "in-progress" };
              }
              if (completedModules.includes(module.id)) {
                return { ...module, status: "completed" };
              } else if (
                index > 0 &&
                completedModules.includes(prevModules[index - 1].id)
              ) {
                return { ...module, status: "in-progress" };
              } else {
                return { ...module, status: "locked" };
              }
            })
          );

          // Update mainModules
          setMainModules((prevModules) =>
            prevModules.map((module, index) => {
              if (completedModules.includes(module.id)) {
                return { ...module, status: "completed" };
              } else if (
                index === 0 &&
                completedModules.includes(initialModules[1].id)
              ) {
                return { ...module, status: "in-progress" };
              } else if (
                index > 0 &&
                completedModules.includes(prevModules[index - 1].id)
              ) {
                return { ...module, status: "in-progress" };
              } else {
                return { ...module, status: "locked" };
              }
            })
          );
        }
      });

      // Clean up listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up listener: ", error);
    }
  };

  const completeModule = async (moduleId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const completedModules = userData.completedModules || [];

        if (!completedModules.includes(moduleId)) {
          // Tambahkan modul yang telah selesai
          const updatedCompletedModules = [...completedModules, moduleId];

          await updateDoc(userRef, {
            completedModules: updatedCompletedModules,
          });

          fetchUserData(userId);
        }
      }
    } catch (error) {
      console.error("Error completing module: ", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserData(userId).then(() => setIsRefreshing(false));
  };

  const renderModuleIcon = (status) => {
    if (status === "completed") {
      return (
        <Image
          source={require("./../assets/roadMap/checkicon.png")}
          style={tw`w-15 h-15 resize-contain`}
          resizeMode="contain"
        />
      );
    }
    if (status === "in-progress") {
      return (
        <Image
          source={require("./../assets/roadMap/bookicon.png")}
          style={tw`w-15 h-15 resize-contain`}
          resizeMode="contain"
        />
      );
    }
    return (
      <Image
        source={require("./../assets/roadMap/lock-icon.png")}
        style={tw`w-15 h-15 resize-contain`}
        resizeMode="contain"
      />
    );
  };

  const handleModulePress = (module) => {
    if (module.status === "in-progress" || module.status === "completed") {
      navigation.navigate(module.route);
    }
  };

  const finishModule = (moduleId) => {
    completeModule(moduleId);
    Alert.alert("Selamat!", "Modul selesai. Modul berikutnya telah dibuka.");
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Check if there's a pending module to complete
      if (route.params?.moduleToComplete) {
        finishModule(route.params.moduleToComplete);
      }
    });

    return unsubscribe;
  }, [navigation, route]);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <StatusBar />
      <LinearGradient colors={["#B93C46FF", "#FCFCFCFF"]} style={tw`flex-1`}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          <View style={tw`relative flex-col gap-5`}>
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
              <View
                style={tw`items-center justify-between content-center flex-row p-6`}
              >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={tw`justify-center gap-10 flex-row`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <Image
                      source={require("./../assets/homePage/XP1.png")}
                      style={tw`w-8 h-8`}
                    />
                    <Text style={tw`text-white text-base`}>{xp}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-2`}>
                    <Image
                      source={require("./../assets/homePage/coins.png")}
                      style={tw`w-8 h-8`}
                    />
                    <Text style={tw`text-white text-base`}>{coins}</Text>
                  </View>
                </View>
                <View style={tw`w-[24px] h-[24px]`} />
              </View>

              <View style={tw`w-full border-b-2 border-gray-400`} />
              <View style={tw`justify-center items-center w-full gap-2 my-4`}>
                <Image
                  source={require("./../assets/homePage/inpest.png")}
                  style={tw`w-10 h-10`}
                />
                <Text style={tw`text-white text-base`}>
                  {"Dasar Keuangan Bisnis"}
                </Text>
                <TouchableOpacity
                  style={tw`bg-[#040404] bg-opacity-20 rounded`}
                  onPress={() => navigation.navigate("myCourses")}
                >
                  <Text style={tw`text-white text-xs underline p-1 bg-[#2220]`}>
                    {"Ubah Level"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            {/* Roadmap Content */}
            <View style={tw`px-6`}>
              <View style={tw`flex-col items-center gap-8`}>
                {initialModules.map((module) => (
                  <View key={module.id} style={tw`items-center`}>
                    <TouchableOpacity
                      style={tw`items-center`}
                      disabled={module.status === "locked"}
                      onPress={() => handleModulePress(module)}
                    >
                      {renderModuleIcon(module.status)}
                      <Text
                        style={tw`text-center mt-2 text-xs ${
                          module.status === "locked"
                            ? "text-gray-400"
                            : "text-black"
                        }`}
                      >
                        {module.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Main Roadmap */}
            <View
              style={[
                tw`px-6 py-6 mx-8 mb-12 mt-4 bg-white rounded-3xl`,
                { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              ]}
            >
              <Text style={tw`text-center text-sm text-[#BB1624]`}>
                Level 1
              </Text>
              <Text
                style={tw`text-center text-xl font-bold text-[#BB1624] mb-6`}
              >
                Dasar Keuangan
              </Text>
              <View style={tw`flex-row flex-wrap justify-center`}>
                {mainModules.map((module) => (
                  <View key={module.id} style={tw`w-1/2 items-center mb-6`}>
                    <TouchableOpacity
                      style={tw`items-center`}
                      disabled={module.status === "locked"}
                      onPress={() => handleModulePress(module)}
                    >
                      {renderModuleIcon(module.status)}
                      <Text
                        style={tw`text-center mt-2 text-xs ${
                          module.status === "locked"
                            ? "text-gray-400"
                            : "text-black"
                        }`}
                      >
                        {module.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Roadmap;