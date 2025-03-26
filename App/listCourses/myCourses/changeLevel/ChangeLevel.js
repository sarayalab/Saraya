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
import { auth, db } from "../../../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangeLevel = () => {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null); // State untuk modul aktif
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserCourses(user.uid);
        fetchActiveCourseId(); // Ambil modul aktif saat ini
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
                ? require("../../../assets/keu.png")
                : require("../../../assets/financial.png"),
          };
        })
      );
    }
  };

  const fetchActiveCourseId = async () => {
    try {
      const storedActiveCourseId = await AsyncStorage.getItem("activeModule");
      if (storedActiveCourseId) {
        setActiveCourseId(JSON.parse(storedActiveCourseId));
      }
    } catch (error) {
      console.error("Failed to fetch active course ID:", error);
    }
  };

  const setActiveModule = async (courseId) => {
    try {
      await AsyncStorage.setItem("activeModule", JSON.stringify(courseId));
      setActiveCourseId(courseId); // Update activeCourseId setelah modul diaktifkan
      alert("Kamu sudah mengganti level selamat belajar!");
    } catch (error) {
      console.error("Failed to set active module:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchUserCourses(userId);
      await fetchActiveCourseId();
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
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={tw`p-5`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={tw`flex-row items-center mt-10 mb-2  pb-2`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#505050FF" />
          </TouchableOpacity>
          <View style={tw`flex-1 items-center`}>
            <Text style={tw`text-lg text-gray-700`}>Ubah Level</Text>
          </View>
        </View>

        <View style={tw`flex-row justify-around mb-4 mt-4 bg-gray-200 rounded-xl p-1`}>
          <TouchableOpacity
            style={tw`flex-1 items-center py-2 rounded-lg ${
              filter === "all" ? "bg-[#BB1624]" : ""
            }`}
            onPress={() => setFilter("all")}
          >
            <Text style={tw`${filter === "all" ? "text-white" : "text-gray-500"}`}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`flex-1 items-center py-2 rounded-lg ${
              filter === "inProgress" ? "bg-[#BB1624]" : ""
            }`}
            onPress={() => setFilter("inProgress")}
          >
            <Text style={tw`${filter === "inProgress" ? "text-white" : "text-gray-500"}`}>
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`flex-1 items-center py-2 rounded-lg ${
              filter === "completed" ? "bg-[#BB1624]" : ""
            }`}
            onPress={() => setFilter("completed")}
          >
            <Text style={tw`${filter === "completed" ? "text-white" : "text-gray-500"}`}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {filteredCourses.length === 0 ? (
          <Text style={tw`text-gray-500 mt-4`}>
            You haven't joined any courses yet.
          </Text>
        ) : (
          filteredCourses.map((course, index) => {
            const completedPercentage = course.moduleProgress;
            const isActive = course.courseId === activeCourseId; // Cek apakah modul ini adalah modul aktif
            return (
              <View
                key={index}
                style={tw`bg-white rounded-xl p-4 shadow-lg mb-4 flex-col `}
              >
                <View style={tw`flex-row items-center mb-2`}>
                  <Image source={course.image} style={tw`w-20 h-20 rounded-lg`} />
                  <View style={tw`ml-4 flex-1`}>
                    <Text style={tw`text-sm text-[#BB1624]`}>
                      {course.category}
                    </Text>
                    <Text style={tw`text-base font-bold mt-1`}>
                      {course.title}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>
                      {course.totalModules} Modules
                    </Text>
                    <View style={tw`mt-2`}>
                      <Text style={tw`text-sm text-gray-500`}>
                        Complete {Math.floor(completedPercentage)}%
                      </Text>
                      <View style={tw`w-full h-2 bg-gray-300 rounded-full mt-1`}>
                        <View
                          style={[
                            tw`h-full bg-[#BB1624] rounded-full`,
                            { width: `${completedPercentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={tw`p-2 rounded-lg ${isActive ? "bg-gray-300" : "bg-[#BB1624]"}`}
                  onPress={() => !isActive && setActiveModule(course.courseId)}
                  disabled={isActive} // Jika aktif, button akan di-disable
                >
                  <Text style={tw`text-center ${isActive ? "text-gray-600" : "text-white"}`}>
                    {isActive ? "Ini Level Kamu" : "Aktifkan Level"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangeLevel;
