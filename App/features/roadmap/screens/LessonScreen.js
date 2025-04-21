import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { doc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { auth, db } from "../../../../firebase";
import { useFocusEffect } from "@react-navigation/native";
import { useTimeTracking } from "../hooks/useTimeTracking";

const LessonScreen = ({ navigation, route }) => {
  const { lessonId, levelId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);

  const timeTrackingRef = useRef(null);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  useFocusEffect(
    useCallback(() => {
      // Start tracking time for this specific lesson
      timeTrackingRef.current = useTimeTracking("lesson", lessonId);

      return () => {
        if (timeTrackingRef.current) {
          timeTrackingRef.current.trackEndTime();
        }
      };
    }, [lessonId])
  );

  const fetchLessonData = async () => {
    setLoading(true);
    try {
      // Fetch lesson data
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);

      if (!lessonDoc.exists()) {
        Alert.alert("Error", "Lesson not found");
        navigation.goBack();
        return;
      }

      const lessonData = lessonDoc.data();
      lessonData.id = lessonId;
      setLesson(lessonData);

      // Fetch user progress for this lesson
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const lessonProgress = userData.progress?.lessons?.[lessonId] || null;
          setUserProgress(lessonProgress);

          // If there's a saved position, restore it
          if (lessonProgress?.lastPosition !== undefined) {
            setCurrentContentIndex(lessonProgress.lastPosition);
          }

          // If lesson is not started yet, mark as in-progress
          if (!lessonProgress || lessonProgress.status === "not_started") {
            markLessonInProgress();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching lesson data:", error);
      Alert.alert("Error", "Failed to load lesson content");
    } finally {
      setLoading(false);
    }
  };

  const markLessonInProgress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`progress.lessons.${lessonId}`]: {
          status: "in_progress",
          startedAt: serverTimestamp(),
          lastPosition: currentContentIndex,
        },
      });

      setUserProgress({
        status: "in_progress",
        lastPosition: currentContentIndex,
      });
    } catch (error) {
      console.error("Error updating lesson status:", error);
    }
  };

  const markLessonComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const currentLessonData = userData.progress?.lessons?.[lessonId] || {};

      // Only give XP if lesson hasn't been completed before
      if (!currentLessonData.status || currentLessonData.status !== "completed") {
        await updateDoc(userRef, {
          [`progress.lessons.${lessonId}`]: {
            status: "completed",
            startedAt: userProgress?.startedAt || serverTimestamp(),
            completedAt: serverTimestamp(),
            lastPosition: currentContentIndex,
          },
          xp: increment(10),
        });
        console.log("Lesson XP earned for the first time");
      } else {
        // Just update the lesson status without giving XP
        await updateDoc(userRef, {
          [`progress.lessons.${lessonId}`]: {
            status: "completed",
            startedAt: userProgress?.startedAt || serverTimestamp(),
            completedAt: serverTimestamp(),
            lastPosition: currentContentIndex,
          },
        });
        console.log("Lesson already completed, no XP given");
      }

      // Check if all lessons in this level are complete, then update level progress
      if (levelId) {
        const roadmapRef = doc(db, "roadmap", levelId);
        const roadmapDoc = await getDoc(roadmapRef);

        if (roadmapDoc.exists()) {
          const levelData = roadmapDoc.data();
          const levelLessons = levelData.lessons || [];

          // Now get all user's lesson progress
          const userLessonProgress = userData.progress?.lessons || {};

          // Check if all lessons in this level are completed
          const allLessonsCompleted = levelLessons.every(
            (id) => userLessonProgress[id]?.status === "completed"
          );

          // Update level progress
          const progressData = {
            [`progress.levels.${levelId}`]: {
              status: allLessonsCompleted ? "completed" : "in_progress",
              startedAt:
                userData.progress?.levels?.[levelId]?.startedAt ||
                serverTimestamp(),
            },
          };

          if (allLessonsCompleted) {
            progressData[`progress.levels.${levelId}`].completedAt =
              serverTimestamp();
            progressData[`progress.levels.${levelId}`].progress = 100;
          } else {
            // Calculate progress percentage
            const totalItems =
              levelLessons.length + (levelData.quizzes?.length || 0);
            let completedItems = 0;

            levelLessons.forEach((id) => {
              if (userLessonProgress[id]?.status === "completed")
                completedItems++;
            });

            const progressPercentage =
              totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0;
            progressData[`progress.levels.${levelId}`].progress =
              progressPercentage;
          }

          await updateDoc(userRef, progressData);
        }
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    }
  };

  const handleUpdateProgress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`progress.lessons.${lessonId}.lastPosition`]: currentContentIndex,
      });
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const handleNext = async () => {
    if (!lesson || !lesson.contents) return;

    if (currentContentIndex === lesson.contents.length - 1) {
      // This is the last content, mark lesson as complete
      await markLessonComplete();

      // Check if there's a quiz in this level or more lessons
      if (levelId) {
        const roadmapRef = doc(db, "roadmap", levelId);
        const roadmapDoc = await getDoc(roadmapRef);

        if (roadmapDoc.exists()) {
          const levelData = roadmapDoc.data();

          // Check if there are other lessons in this level
          if (levelData.lessons && levelData.lessons.length > 0) {
            // Get user progress to check which lessons are completed
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);

              // Find the current lesson index in the level
              const currentLessonIndex = levelData.lessons.indexOf(lessonId);

              // Check if there's a next lesson
              if (
                currentLessonIndex >= 0 &&
                currentLessonIndex < levelData.lessons.length - 1
              ) {
                // Navigate to the next lesson
                const nextLessonId = levelData.lessons[currentLessonIndex + 1];
                navigation.navigate("lessons", {
                  lessonId: nextLessonId,
                  levelId,
                });
                return;
              }
            }
          }

          // If no more lessons or current lesson was the last one, check for quizzes
          if (levelData.quizzes && levelData.quizzes.length > 0) {
            // Mark quiz as in progress before navigating
            const quizId = levelData.quizzes[0];
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);
              const userData = userDoc.data();

              // Only update status if quiz isn't already completed
              if (
                !userData.progress?.quizzes?.[quizId] ||
                userData.progress?.quizzes?.[quizId].status !== "completed"
              ) {
                await updateDoc(userRef, {
                  [`progress.quizzes.${quizId}`]: {
                    status: "in_progress",
                    startedAt: serverTimestamp(),
                  },
                });
              }
            }

            navigation.navigate("MainApp", {
              screen: "roadmap",
              params: { refresh: true },
            });
            return;
          }
        }
      }

      // No quiz or level, go back to roadmap
      navigation.navigate("MainApp", {
        screen: "roadmap",
        params: { refresh: true },
      });
    } else {
      // Move to next content
      setCurrentContentIndex(currentContentIndex + 1);
      setScrollProgress(0);
      handleUpdateProgress();
    }
  };

  const handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollY = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    // Calculate scroll progress percentage (avoid division by zero)
    const denominator = contentHeight - scrollViewHeight;
    const currentProgress = denominator > 0 ? (scrollY / denominator) * 100 : 0;

    // Clamp progress between 0-100
    const clampedProgress = Math.min(100, Math.max(0, currentProgress));
    setScrollProgress(clampedProgress);
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#BB1624" />
        <Text style={tw`mt-4 text-gray-600`}>Memuat materi...</Text>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <Text style={tw`text-lg text-gray-700`}>Materi tidak ditemukan</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-gray-600 py-2 px-6 rounded-full`}
          onPress={() => navigation.goBack()}
        >
          <Text style={tw`text-white`}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Check if we have content available
  if (!lesson.contents || lesson.contents.length === 0) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <Text style={tw`text-lg text-gray-700`}>
          Tidak ada konten untuk materi ini
        </Text>
        <TouchableOpacity
          style={tw`mt-4 bg-gray-600 py-2 px-6 rounded-full`}
          onPress={() => navigation.goBack()}
        >
          <Text style={tw`text-white`}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Get current content
  const currentContent = lesson.contents[currentContentIndex]
    .replace(/- /g, "\n- ") // Add newline before bullet points
    .replace(/  /g, "\n") // Replace double spaces with newlines
    .replace(/\n\|/g, "\n|") // Ensure pipe at start of line has newline
    .replace(/\|\n/g, "|\n") // Ensure pipe at end of line has newline
    .replace(/\n\s*\n\|/g, "\n|") // Fix extra newlines before table rows
    .replace(/\|\n\s*\n/g, "|\n"); // Fix extra newlines after table rows

  // Configure markdown styles
  const markdownStyles = {
    body: tw`text-gray-800`,
    heading1: tw`text-xl font-bold text-black my-4`,
    heading2: tw`text-lg font-bold text-gray-800 my-3`,
    heading3: tw`text-md font-semibold text-gray-800 my-2`,
    paragraph: tw`text-base text-gray-700 my-2`,
    bullet_list: tw`my-2`,
    ordered_list: tw`my-2`,
    list_item: tw`my-2 ml-4`,
    image: tw`w-full h-auto my-4 rounded-lg`,
    blockquote: tw`border-l-4 border-gray-300 pl-4 italic my-4`,
    code_block: tw`bg-gray-100 p-3 rounded my-3 font-mono text-sm`,
    code_inline: tw`bg-gray-100 px-1 font-mono text-sm`,
    link: tw`text-black underline`,
    table: tw`border-collapse my-4 w-full`,
    thead: tw`bg-gray-100`,
    tbody: tw``,
    th: tw`p-2 border border-gray-300 font-bold`,
    td: tw`p-2 border border-gray-300`,
    tr: tw`border-b border-gray-300`,
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Bar */}
      <View style={tw`flex-row justify-between w-full h-1.5 mt-4 px-2`}>
        {lesson.contents.map((_, index) => (
          <View key={index} style={tw`flex-1 bg-gray-300 mx-1 rounded-full`}>
            <View
              style={[
                tw`absolute left-0 h-full bg-red-600 rounded-full`,
                index < currentContentIndex
                  ? { width: "100%" }
                  : index === currentContentIndex
                  ? { width: `${scrollProgress}%` }
                  : { width: "0%" },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={tw`flex-row items-center justify-between mt-4 px-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold ml-2`}>{lesson.title}</Text>
        <View style={tw`w-6`} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={tw`flex-grow p-6 pb-10`}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Render Markdown content */}
        <Markdown
          style={markdownStyles}
          markdownit={MarkdownIt({
            typographer: true,
            linkify: true,
            breaks: true,
            // Make sure tables are enabled
            html: true,
            tables: true,
          }).disable(["blockquote", "list", "code"])}
        >
          {currentContent}
        </Markdown>

        <TouchableOpacity
          style={tw`bg-[#BB1624] p-3 rounded-full items-center mt-6`}
          onPress={handleNext}
        >
          <Text style={tw`text-white text-base font-medium`}>
            {currentContentIndex === lesson.contents.length - 1
              ? "Complete Lesson"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LessonScreen;