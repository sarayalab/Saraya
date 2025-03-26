import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const ProgramSaya = () => {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserCourses(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserCourses = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userCourses = userData.coursesJoined || [];
      const completedModules = userData.completedModules || {};

      const storedModules = await AsyncStorage.getItem("modules");
      const parsedModules = storedModules ? JSON.parse(storedModules) : [];

      setCourses(
        userCourses.map((courseId) => {
          const progress = completedModules[courseId] || [];
          const moduleProgress = parsedModules.length
            ? (parsedModules.reduce(
                (sum, module) =>
                  sum +
                  module.lessons.filter((lesson) => lesson.completed).length,
                0
              ) /
                parsedModules.reduce(
                  (sum, module) => sum + module.lessons.length,
                  0
                )) *
              100
            : 0;

          return {
            courseId,
            progress,
            totalModules: 4,
            moduleProgress,
            title:
              courseId === 1
                ? "Dasar Keuangan Bisnis"
                : "Pengenalan Strategi Pengembangan Usaha",
            category: courseId === 1 ? "Keuangan Bisnis" : "Investasi Usaha",
            image:
              courseId === 1
                ? require("../../assets/keu.png")
                : require("../../assets/financial.png"),
          };
        })
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchUserCourses(userId);
    }
    setRefreshing(false);
  };

  const filteredCourses = courses.filter((course) => {
    const completedPercentage = course.moduleProgress;
    if (filter === "all") return true;
    if (filter === "inProgress")
      return completedPercentage > 0 && completedPercentage < 100;
    if (filter === "completed") return completedPercentage === 100;
    return true;
  });

  return (
    <SafeAreaView style={tw`flex-1`}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={tw`p-5`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={tw`flex-row items-center mb-2  pb-2`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={tw`flex-1 items-center`}>
            <Text style={tw`text-lg text-black`}>Explore Lesson</Text>
          </View>
        </View>

        {filteredCourses.length === 0 ? (
          <Text style={tw`text-gray-500 mt-4`}>
            You haven't joined any courses yet.
          </Text>
        ) : (
          filteredCourses.map((course, index) => {
            const completedPercentage = course.moduleProgress;
            return (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate("roadmap", {
                    courseId: course.courseId,
                  })
                }
              >
                <LinearGradient
                  colors={["#BB1624", "#53060CFF"]} // Gradient colors
                  start={{ x: 0, y: 0 }} // Start point of the gradient
                  end={{ x: 1, y: 1 }} // End point of the gradient
                  style={[
                    tw`p-4 rounded-xl mt-4`, // Tailwind styles
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
                      source={require("./../../assets/logoAssets/rina3.png")}
                      style={tw`w-32 `} // Tambahkan ukuran untuk memastikan gambar tidak terlalu besar
                      resizeMode="contain"
                    />
                    <View style={tw`flex-1 mt-4`}>
                      <Text style={tw`text-lg font-bold text-white`}>
                        {course.title}
                      </Text>
                      <Text style={tw`text-sm text-white mt-2`}>
                        Sukses butuh perjuangan, jangan sendirian. Rina siap
                        menemani, ayo lanjutkan belajar!
                      </Text>
                      <View
                        style={tw`flex-row items-center gap-4 justify-end mt-4`}
                      >
                        <Text style={tw`text-xs text-gray-200`}>
                          Lanjut Belajar
                        </Text>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("programList")}
                          style={tw`bg-white p-[8px] flex items-center rounded-full`}
                        >
                          <Ionicons name="play" size={12} color="#BB1624" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgramSaya;
