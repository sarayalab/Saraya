import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../../firebase";
import { LinearGradient } from "expo-linear-gradient";

const MyLessonScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userLessons, setUserLessons] = useState({
    inProgress: [],
    completed: [],
  });

  useEffect(() => {
    fetchUserLessons();
  }, []);

  const fetchUserLessons = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.navigate("login");
        return;
      }

      // Fetch user's progress data
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const lessonProgress = userData.progress?.lessons || {};

      // Create arrays to hold in-progress and completed lessons
      const inProgressLessons = [];
      const completedLessons = [];

      // Get all lesson IDs from the progress
      const lessonIds = Object.keys(lessonProgress);

      if (lessonIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch lesson details for each lesson in progress
      const fetchPromises = lessonIds.map(async (lessonId) => {
        const lessonRef = doc(db, "lessons", lessonId);
        const lessonDoc = await getDoc(lessonRef);

        if (lessonDoc.exists()) {
          const lessonData = lessonDoc.data();

          // Create a lesson object with progress information
          const lesson = {
            id: lessonId,
            title: lessonData.title,
            description: lessonData.description || "",
            thumbnail: lessonData.thumbnail || null,
            contentsCount: lessonData.contents?.length || 0,
            status: lessonProgress[lessonId].status,
            lastPosition: lessonProgress[lessonId].lastPosition || 0,
            progress: lessonProgress[lessonId].lastPosition
              ? Math.round(
                  ((lessonProgress[lessonId].lastPosition + 1) /
                    (lessonData.contents?.length || 1)) *
                    100
                )
              : 0,
            startedAt: lessonProgress[lessonId].startedAt,
            completedAt: lessonProgress[lessonId].completedAt,
          };

          // Add to appropriate array based on status
          if (lessonProgress[lessonId].status === "completed") {
            completedLessons.push(lesson);
          } else if (lessonProgress[lessonId].status === "in-progress") {
            inProgressLessons.push(lesson);
          }
        }

        return null;
      });

      // Wait for all lessons to be fetched
      await Promise.all(fetchPromises);

      // Sort in-progress lessons by last accessed (most recent first)
      inProgressLessons.sort((a, b) => {
        const dateA = a.startedAt?.toDate() || new Date(0);
        const dateB = b.startedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      // Sort completed lessons by completion date (most recent first)
      completedLessons.sort((a, b) => {
        const dateA = a.completedAt?.toDate() || new Date(0);
        const dateB = b.completedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setUserLessons({
        inProgress: inProgressLessons,
        completed: completedLessons,
      });
    } catch (error) {
      console.error("Error fetching user lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLesson = (lessonId, levelId = null) => {
    navigation.navigate("lessons", { lessonId, levelId });
  };

  const renderLessonItem = ({ item, index }) => {
    // Base colors for our gradient
    const baseColorStart = "#BB1624"; // Your primary red
    const baseColorEnd = "#53060C"; // Your darker red

    // Generate subtle variations for each card based on the item's index or id
    // Using the item ID string converted to a number for consistency
    const idSum = item.id
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const variation = (idSum % 20) / 100; // Small variation between 0-0.2

    // Create variations of the base colors while keeping them in the same family
    // Adjust hue/brightness slightly but maintain the red theme
    const startColor = adjustColor(baseColorStart, variation);
    const endColor = adjustColor(baseColorEnd, -variation); // Opposite direction

    // Choose from a few gradient direction variants
    const gradientDirections = [
      { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }, // diagonal ↘
      { start: { x: 0, y: 0 }, end: { x: 1, y: 0.5 } }, // diagonal slight ↘
      { start: { x: 0, y: 0.3 }, end: { x: 1, y: 0.7 } }, // horizontal with slight angle
      { start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } }, // steeper diagonal
    ];

    // Use the lesson ID to pick a consistent direction for each lesson
    const directionIndex = idSum % gradientDirections.length;
    const gradientDirection = gradientDirections[directionIndex];

    return (
      <TouchableOpacity
        style={tw`bg-white rounded-xl shadow-sm mb-1 overflow-hidden`}
        onPress={() => navigateToLesson(item.id)}
      >
        <LinearGradient
          colors={[startColor, endColor]}
          start={gradientDirection.start}
          end={gradientDirection.end}
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
          <View style={tw`flex-row`}>
            <Image
              source={require("../../../assets/logoAssets/rina3.png")}
              style={tw`w-32 `} // Tambahkan ukuran untuk memastikan gambar tidak terlalu besar
              resizeMode="contain"
            />

            <View style={tw`flex-1 p-3`}>
              <Text style={tw`font-bold text-lg text-white`} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={tw`text-sm text-white mt-2`}>
                Sukses butuh perjuangan, jangan sendirian. Rina siap menemani,
                ayo lanjutkan belajar!
              </Text>

              <View style={tw`flex-row items-center gap-4 justify-end mt-4`}>
                <Text style={tw`text-xs text-gray-200`}>Lanjut Belajar</Text>
                <View
                  style={tw`bg-white p-[8px] flex items-center rounded-full`}
                >
                  <Ionicons name="play" size={12} color="#BB1624" />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const EmptyList = ({ message }) => (
    <View style={tw`items-center justify-center py-8`}>
      <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
      <Text style={tw`text-gray-500 mt-2 text-center`}>{message}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50 justify-center items-center`}>
        <ActivityIndicator size="large" color="#BB1624" />
        <Text style={tw`mt-4 text-gray-600`}>Loading your lessons...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`flex-row items-center justify-between px-4 py-3`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-gray-800`}>Explore Lesson</Text>
        <View style={tw`w-6`} />
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={() => (
          <View style={tw`px-4 pt-2 pb-4`}>
            {userLessons.inProgress.length > 0 && (
              <View style={tw`mb-6`}>
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={tw`text-base font-bold text-gray-800`}>
                    Continue Learning
                  </Text>
                </View>

                <FlatList
                  data={userLessons.inProgress.slice(0, 5)}
                  renderItem={renderLessonItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={tw`pt-1`}
                  ListEmptyComponent={
                    <EmptyList message="No lessons in progress" />
                  }
                  scrollEnabled={false}
                />
              </View>
            )}

            {userLessons.completed.length > 0 && (
              <View>
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={tw`text-base font-bold text-gray-800`}>
                    Completed Lessons
                  </Text>
                </View>

                <FlatList
                  data={userLessons.completed.slice(0, 5)}
                  renderItem={renderLessonItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={tw`pt-1`}
                  ListEmptyComponent={
                    <EmptyList message="No completed lessons" />
                  }
                  scrollEnabled={false}
                />
              </View>
            )}

            {userLessons.inProgress.length === 0 &&
              userLessons.completed.length === 0 && (
                <View style={tw`items-center justify-center py-16`}>
                  <Ionicons name="book-outline" size={64} color="#9CA3AF" />
                  <Text
                    style={tw`text-gray-700 font-medium mt-4 text-lg text-center`}
                  >
                    No lessons yet
                  </Text>
                  <Text style={tw`text-gray-500 mt-2 text-center px-8`}>
                    Start learning by selecting a topic from the roadmap
                  </Text>
                  <TouchableOpacity
                    style={tw`mt-6 bg-[#BB1624] py-3 px-6 rounded-full`}
                    onPress={() => navigation.navigate("roadmap")}
                  >
                    <Text style={tw`text-white font-medium`}>
                      Go to Roadmap
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}
        renderItem={() => null}
        keyExtractor={() => "spacer"}
      />
    </SafeAreaView>
  );
};

// Helper function to adjust hex color
// Add this function at the top of your file or before the component
function adjustColor(color, amount) {
  // Parse the hex color
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  // Adjust brightness - positive amount brightens, negative darkens
  // Keeping it subtle to maintain brand colors
  r = Math.min(255, Math.max(0, r + Math.round(r * amount)));
  g = Math.min(255, Math.max(0, g + Math.round(g * amount)));
  b = Math.min(255, Math.max(0, b + Math.round(b * amount)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default MyLessonScreen;
