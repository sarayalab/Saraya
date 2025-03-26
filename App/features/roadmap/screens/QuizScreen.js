import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { db, auth } from "../../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  QuizTimerProvider,
  TimerDisplay,
  useQuizTimer,
} from "../components/QuizTimer";
import { useFocusEffect } from "@react-navigation/native";
import { useTimeTracking } from "../hooks/useTimeTracking";

const QuizScreen = ({ route, navigation }) => {
  const { quizId, levelId } = route.params;
  const uid = auth.currentUser.uid;

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time tracking
  const timeTrackingRef = useRef(null);

  // Modal animation
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useFocusEffect(
    useCallback(() => {
      // Start tracking time for this specific lesson
      timeTrackingRef.current = useTimeTracking("quiz", quizId);

      return () => {
        if (timeTrackingRef.current) {
          timeTrackingRef.current.trackEndTime();
        }
      };
    }, [quizId])
  );

  // Separate effect for modal visibility changes
  useEffect(() => {
    if (showFeedbackModal) {
      // Fade in animation
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFeedbackModal]);

  // Handle modal dismissal - memoize to prevent recreation on render
  const dismissFeedbackModal = useCallback(() => {
    // Start dismiss animation
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFeedbackModal(false);

      // Move to next question or show results after modal fades out
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        // Complete the quiz if all questions are answered
        setShowResults(true);
      }
    });
  }, [currentQuestionIndex, quiz, answers]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      // Fetch quiz data
      const quizDocRef = doc(db, "quizzes", quizId);
      const quizDoc = await getDoc(quizDocRef);

      if (quizDoc.exists()) {
        setQuiz({ ...quizDoc.data(), id: quizId });

        // Mark quiz as in-progress
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const quizProgress = userData.progress?.quizzes?.[quizId];

          // If quiz not started, mark as in-progress
          if (!quizProgress || quizProgress.status === "not_started") {
            await updateDoc(userRef, {
              [`progress.quizzes.${quizId}`]: {
                status: "in_progress",
                startedAt: serverTimestamp(),
              },
            });
          }
        }
      } else {
        Alert.alert("Error", "Quiz not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      Alert.alert("Error", "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = useCallback((optionKey) => {
    setSelectedOption(optionKey);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (selectedOption === null) {
      Alert.alert("Please select an answer");
      return;
    }

    // Get current question
    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Save answer
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: selectedOption,
    };
    setAnswers(updatedAnswers);

    // Check if answer is correct
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      setScore(score + 1);
    } else {
      // Add to incorrect questions for potential retry
      setIncorrectQuestions([...incorrectQuestions, currentQuestionIndex]);
    }

    // Reset modal opacity for fresh animation
    modalOpacity.setValue(0);

    // Show feedback modal
    setShowFeedbackModal(true);
  }, [
    selectedOption,
    quiz,
    currentQuestionIndex,
    answers,
    score,
    incorrectQuestions,
    modalOpacity,
  ]);

  // Feedback Modal Component - using React.memo to prevent unnecessary re-renders
  const FeedbackModal = React.memo(() => {
    if (!quiz || !showFeedbackModal) return null;

    return (
      <Modal transparent visible={showFeedbackModal} animationType="none">
        <TouchableOpacity
          activeOpacity={1}
          style={tw`flex-1 bg-black bg-opacity-50 justify-end`}
          onPress={dismissFeedbackModal}
        >
          <Animated.View
            style={[
              tw`bg-white rounded-t-3xl pb-6`,
              {
                opacity: modalOpacity,
                transform: [
                  {
                    translateY: modalOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Pill handle - make it more visible to indicate draggability */}
            <View
              style={tw`w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3`}
            />

            {/* Color indicator at top */}
            <View style={tw`h-1.5 w-full mt-3 mb-4`} />

            {/* Content */}
            <TouchableOpacity
              activeOpacity={1}
              style={tw`px-6 items-center`}
              onPress={(e) => e.stopPropagation()} // Prevent taps on content from dismissing modal
            >
              <View style={tw`mb-4`}>
                <View
                  style={tw`w-20 h-20 rounded-full items-center justify-center ${
                    isAnswerCorrect ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Ionicons
                    name={isAnswerCorrect ? "checkmark" : "close"}
                    size={36}
                    color={isAnswerCorrect ? "#34D399" : "#EF4444"}
                  />
                </View>
              </View>

              <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
                {isAnswerCorrect ? "Correct!" : "Incorrect!"}
              </Text>

              {isAnswerCorrect ? (
                <Text style={tw`text-base text-gray-600 text-center mb-4`}>
                  Great job! You got the right answer.
                </Text>
              ) : (
                <Text style={tw`text-base text-gray-600 text-center mb-3`}>
                  Don't worry! Learning comes from mistakes.
                </Text>
              )}

              <TouchableOpacity
                style={tw`bg-[#BB1624] py-3 px-6 rounded-lg w-full items-center mt-4`}
                onPress={dismissFeedbackModal}
              >
                <Text style={tw`text-white text-base font-medium`}>
                  {currentQuestionIndex === quiz.questions.length - 1
                    ? "See Results"
                    : "Next Question"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  });

  const ResultsScreen = () => {
    // Get timer context with pause functionality
    const { timeSpent, pauseTimer, resumeTimer, formatTimeSpent } =
      useQuizTimer();

    const finalScore = Math.round((score / quiz.questions.length) * 100);
    const isPassing = finalScore >= 70;

    const saveQuizResults = async (finalAnswers) => {
      try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const currentQuizData = userData.progress?.quizzes?.[quizId] || {};

        // Calculate percentage score
        const finalScore = Math.round((score / quiz.questions.length) * 100);
        const bestScore = Math.max(currentQuizData.bestScore || 0, finalScore);

        // Update quiz progress including time spent
        await updateDoc(userRef, {
          [`progress.quizzes.${quizId}`]: {
            status: "completed",
            attempts: (currentQuizData.attempts || 0) + 1,
            bestScore: bestScore,
            lastCompletedAt: serverTimestamp(),
            timeSpent: timeSpent, // Save the time spent on the quiz
            answers: finalAnswers,
          },
        });

        // Update statistics
        await updateDoc(userRef, {
          "statistics.quizzesCompleted": increment(1),
          "statistics.lastActiveAt": serverTimestamp(),
          "statistics.totalQuizTime": increment(timeSpent), // Track total time spent on quizzes
        });

        // Only update XP if this is the first completion
        if (!currentQuizData.status || currentQuizData.status !== "completed") {
          await updateUserXP();
        }

        // Check if this completes the level
        if (levelId) {
          const roadmapRef = doc(db, "roadmap", levelId);
          const roadmapDoc = await getDoc(roadmapRef);

          if (roadmapDoc.exists()) {
            const levelData = roadmapDoc.data();
            const levelQuizzes = levelData.quizzes || [];
            const levelLessons = levelData.lessons || [];

            // Get updated user progress
            const updatedUserDoc = await getDoc(userRef);
            const updatedUserData = updatedUserDoc.data();
            const userQuizProgress = updatedUserData.progress?.quizzes || {};
            const userLessonProgress = updatedUserData.progress?.lessons || {};

            // Check if all quizzes are completed
            const allQuizzesCompleted = levelQuizzes.every(
              (id) => userQuizProgress[id]?.status === "completed"
            );

            // Check if all lessons are completed
            const allLessonsCompleted = levelLessons.every(
              (id) => userLessonProgress[id]?.status === "completed"
            );

            // If everything is completed, mark level as completed
            if (allQuizzesCompleted && allLessonsCompleted) {
              await updateDoc(userRef, {
                [`progress.levels.${levelId}`]: {
                  status: "completed",
                  completedAt: serverTimestamp(),
                  progress: 100,
                },
              });

              // Update statistics
              await updateDoc(userRef, {
                "statistics.levelsCompleted": increment(1),
              });
            } else {
              // Calculate level progress
              const totalItems = levelLessons.length + levelQuizzes.length;
              let completedItems = 0;

              levelLessons.forEach((id) => {
                if (userLessonProgress[id]?.status === "completed")
                  completedItems++;
              });

              levelQuizzes.forEach((id) => {
                if (userQuizProgress[id]?.status === "completed")
                  completedItems++;
              });

              const progressPercentage = Math.round(
                (completedItems / totalItems) * 100
              );

              await updateDoc(userRef, {
                [`progress.levels.${levelId}`]: {
                  status: "in_progress",
                  progress: progressPercentage,
                },
              });

              // Automatically unlock next quiz if available
              if (!allQuizzesCompleted) {
                // Find the current quiz's index in the level's quiz array
                const currentQuizIndex = levelQuizzes.indexOf(quizId);

                // If there's a next quiz and it's not already started/completed
                if (
                  currentQuizIndex >= 0 &&
                  currentQuizIndex < levelQuizzes.length - 1
                ) {
                  const nextQuizId = levelQuizzes[currentQuizIndex + 1];
                  const nextQuizStatus = userQuizProgress[nextQuizId]?.status;

                  // Only update if the next quiz is not already in progress or completed
                  if (!nextQuizStatus || nextQuizStatus === "not_started") {
                    await updateDoc(userRef, {
                      [`progress.quizzes.${nextQuizId}`]: {
                        status: "in-progress",
                        startedAt: serverTimestamp(),
                      },
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    };

    const updateUserXP = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const today = new Date();
          const currentMonth = today.toISOString().slice(0, 7); // Gets YYYY-MM format
          const currentDay = today.toISOString().slice(0, 10); // Gets YYYY-MM-DD format
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentMonthlyQuiz = userData.monthlyQuiz || {
              month: "",
              correctAnswers: 0,
              xp: 0,
            };

            const currentDailyQuiz = userData.dailyQuiz || {
              date: "",
              correctAnswers: 0,
              xp: 0,
            };

            const newCorrectAnswers =
              currentMonthlyQuiz.month === currentMonth
                ? currentMonthlyQuiz.correctAnswers + score
                : score;

            const newXp =
              currentMonthlyQuiz.month === currentMonth
                ? currentMonthlyQuiz.xp + 30
                : 30;

            const newDailyCorrectAnswers =
              currentDailyQuiz.date === currentDay
                ? currentDailyQuiz.correctAnswers + score
                : score;

            const newDailyXp =
              currentDailyQuiz.date === currentDay
                ? currentDailyQuiz.xp + 30
                : 30;

            await updateDoc(userDocRef, {
              monthlyQuiz: {
                month: currentMonth,
                correctAnswers: newCorrectAnswers,
                xp: newXp,
              },
              dailyQuiz: {
                date: currentDay,
                correctAnswers: newDailyCorrectAnswers,
                xp: newDailyXp,
              },
              xp: increment(30),
            });
          }
        }
      } catch (error) {
        console.error("Error updating correct answers:", error);
      }
    };

    // Ensure timer is paused when this component is rendered
    useEffect(() => {
      pauseTimer();
    }, []);

    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <StatusBar style="dark" />

        <View style={tw`px-6 py-8 flex-1 justify-center items-center`}>
          <Text style={tw`text-2xl font-bold text-center mb-2`}>
            {isPassing ? "Selamat!" : "Hampir nih!"}
          </Text>

          <Text style={tw`text-lg text-gray-600 text-center mb-6`}>
            {isPassing
              ? "Kamu telah menyelesaikan quiz hari ini!"
              : "Kamu bisa mencoba lagi untuk mendapatkan skor lebih tinggi."}
          </Text>

          <View style={tw`bg-gray-100 rounded-lg p-6 w-full items-center mb-8`}>
            <Text style={tw`text-lg text-gray-700 mb-2`}>Skor Kamu</Text>
            <Text
              style={tw`text-4xl font-bold mb-2 ${
                finalScore >= 70
                  ? "text-green-600"
                  : finalScore >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {finalScore}%
            </Text>

            <Text style={tw`text-base text-gray-600 text-center mb-3`}>
              Kamu menjawab {score} dari {quiz.questions.length} pertanyaan
              benar
            </Text>

            <Text style={tw`text-sm text-gray-500`}>
              Waktu: {formatTimeSpent(timeSpent)}
            </Text>
          </View>

          <TouchableOpacity
            style={tw`bg-[#BB1624] py-3 px-6 rounded-full w-full items-center mb-4`}
            onPress={async () => {
              await saveQuizResults(answers);

              navigation.navigate("MainApp", {
                screen: "roadmap",
                params: { refresh: true },
              });
            }}
          >
            <Text style={tw`text-white text-base font-medium`}>
              Kembali ke Roadmap
            </Text>
          </TouchableOpacity>

          {!isPassing && (
            <TouchableOpacity
              style={tw`border border-[#BB1624] py-3 px-6 rounded-full w-full items-center`}
              onPress={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setAnswers({});
                setScore(0);
                setIncorrectQuestions([]);
                resumeTimer();
                // We don't reset the timer - it keeps counting
              }}
            >
              <Text style={tw`text-[#BB1624] text-base font-medium`}>
                Ulangi Quiz
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#BB1624" />
        <Text style={tw`mt-4 text-gray-600`}>Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <Text style={tw`text-lg text-gray-700`}>Quiz not found</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-gray-600 py-2 px-6 rounded-full`}
          onPress={() => navigation.goBack()}
        >
          <Text style={tw`text-white`}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return <ResultsScreen />;
  }

  // Get current question
  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={["#BB1624", "#53060CFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`flex-1`}
      >
        {/* Header */}
        <View style={tw`px-4 py-4`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <TimerDisplay />
            </View>
            <View style={tw`flex-1 mx-4`}>
              <View style={tw`w-full bg-gray-300 rounded-full h-2`}>
                <View
                  style={tw`bg-white h-full rounded-full`}
                  width={`${
                    ((currentQuestionIndex + 1) / quiz.questions.length) * 100
                  }%`}
                />
              </View>
            </View>
            <View
              style={tw`flex-row items-center bg-[#EF980C] py-1 px-3 rounded-lg`}
            >
              <Image
                source={require("../../../assets/homePage/XP1.png")}
                style={tw`w-5 h-5`}
              />
              <Text style={tw`text-white font-bold ml-2`}>30</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`bg-white min-h-full rounded-t-3xl p-6`}>
            {/* Question */}
            <View style={tw`mb-4 items-center`}>
              <Image
                source={require("../../../assets/coursesPage/undraw_online_learning.png")}
                style={tw`w-32 h-32 mb-4`}
              />

              <Text
                style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}
              >
                {currentQuestion.question}
              </Text>
            </View>

            {/* Options */}
            <View style={tw`mb-8`}>
              {Object.entries(currentQuestion.options).map(
                ([key, optionText]) => (
                  <TouchableOpacity
                    key={key}
                    style={tw`border-2 rounded-xl p-4 mb-3 ${
                      selectedOption === key
                        ? "border-[#BB1624] bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    onPress={() => handleOptionSelect(key)}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Text
                        style={tw`flex-1 text-gray-800 text-base text-center ${
                          selectedOption === key ? "font-medium" : "font-normal"
                        }`}
                      >
                        {optionText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={tw`bg-[#BB1624] py-4 px-6 rounded-xl items-center ${
                selectedOption === null ? "opacity-50" : "opacity-100"
              }`}
              onPress={handleNextQuestion}
              disabled={selectedOption === null}
            >
              <Text style={tw`text-white text-base font-medium`}>
                {currentQuestionIndex === quiz.questions.length - 1
                  ? "Submit"
                  : "Next Question"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Feedback Modal */}
      <FeedbackModal />
    </SafeAreaView>
  );
};

// Wrap the QuizScreen with the timer provider
const QuizScreenWithTimer = (props) => (
  <QuizTimerProvider>
    <QuizScreen {...props} />
  </QuizTimerProvider>
);

export default QuizScreenWithTimer;
