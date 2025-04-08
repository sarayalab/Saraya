import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { reactQuestionsSosmed } from "../../../../config/QuestionsSosmed";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./../../../../../firebase";
import { Ionicons } from "@expo/vector-icons";

const KuisSosmedBranding = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [userUID, setUserUID] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    Alert.alert(
      "Perhatian!",
      "Perhatikan baik-baik soalnya karena setiap jawaban tidak dapat diganti dan akan kekunci jawabannya.",
      [{ text: "OK", onPress: () => console.log("Alert ditutup") }]
    );

    if (user) {
      setUserUID(user.uid);
    }

    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const saveQuizScore = async (uid, quizId, score) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedScores = { ...userData.scores, [quizId]: score };
        await setDoc(
          userDocRef,
          { ...userData, scores: updatedScores },
          { merge: true }
        );
        console.log("Skor berhasil disimpan");
      }
    } catch (error) {
      console.error("Gagal menyimpan skor:", error);
    }
  };

  const saveTimeSpent = async (uid, quizId, timeSpent) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedTimeSpent = { ...userData.timeSpent, [quizId]: timeSpent };
        await setDoc(
          userDocRef,
          { ...userData, timeSpent: updatedTimeSpent },
          { merge: true }
        );
        console.log("Waktu berhasil disimpan");
      }
    } catch (error) {
      console.error("Gagal menyimpan waktu:", error);
    }
  };

  const calculateFinalScore = (totalQuestions, mistakes) => {
    const scorePerQuestion = 100 / totalQuestions;
    const finalScore = 100 - mistakes * scorePerQuestion;
    return Math.round(Math.max(finalScore, 0));
  };

  const updateCorrectAnswers = async (correctCount) => {
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
              ? currentMonthlyQuiz.correctAnswers + correctCount
              : correctCount;

          const newXp =
            currentMonthlyQuiz.month === currentMonth
              ? currentMonthlyQuiz.xp + 30
              : 30;

          const newDailyCorrectAnswers =
            currentDailyQuiz.date === currentDay
              ? currentDailyQuiz.correctAnswers + correctCount
              : correctCount;

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
          });
        }
      }
    } catch (error) {
      console.error("Error updating correct answers:", error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex === reactQuestionsSosmed.length - 1) {
      const finalScore = calculateFinalScore(
        reactQuestionsSosmed.length,
        mistakes
      );
      updateCorrectAnswers(reactQuestionsSosmed.length);
      saveQuizScore(userUID, "quizSosmedBranding", finalScore)
        .then(() => {
          return saveTimeSpent(userUID, "quizSosmedBranding", timeElapsed);
        })
        .then(() => {
          navigation.navigate("scoreSosmedBranding", {
            score: finalScore,
            timeSpent: timeElapsed,
          });
        })
        .catch((error) => {
          console.error("Error handling next:", error);
        });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleOptionPress = (pressedOption) => {
    setSelectedOption(pressedOption);
    const isAnswerCorrect =
      reactQuestionsSosmed[currentQuestionIndex].correctAnswer ===
      pressedOption;

    setIsCorrect(isAnswerCorrect);

    if (!isAnswerCorrect) {
      setMistakes((prevMistakes) => prevMistakes + 1);
    } else {
      setScore((prevScore) => prevScore + 20);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`h-24 w-full rounded-b-xl`}>
        <Image
          source={require("../../../../assets/AkunPage/Promotion.png")}
          style={tw`h-full w-full rounded-b-xl absolute`}
        />
        <View style={tw`flex-row justify-between px-4 mt-6`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={tw`bg-white p-2 rounded-md`}>
            <Text>{formatTime(timeElapsed)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={tw`p-4`}>
        <View style={tw`h-36 justify-center items-center mb-4`}>
          <Image
            source={require("../../../../assets/Success.png")}
            style={tw`w-40 h-40`}
          />
        </View>

        <Text style={tw`text-base font-bold text-center mt-4 mb-5`}>
          {reactQuestionsSosmed[currentQuestionIndex].question}
        </Text>

        {reactQuestionsSosmed[currentQuestionIndex].options.map((option) => (
          <Pressable
            key={option}
            style={[
              tw`border-2 p-2 my-2 rounded-lg`,
              selectedOption === option
                ? isCorrect
                  ? tw`bg-green-200 border-green-500`
                  : { backgroundColor: "#BA5860FF", borderColor: "#BC4A53FF" }
                : tw`border-gray-300`,
            ]}
            onPress={() => handleOptionPress(option)}
            disabled={selectedOption !== null}
          >
            <Text style={tw`text-sm text-center`}>{option}</Text>
          </Pressable>
        ))}

        <Pressable
          style={tw`bg-[#BB1624] p-2 rounded-lg mt-6 mb-5`}
          onPress={handleNext}
        >
          <Text style={tw`text-white text-center text-base`}>
            {currentQuestionIndex === reactQuestionsSosmed.length - 1
              ? "Finish"
              : "Next"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KuisSosmedBranding;
