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
import { reactQuestionsTujuanKeuangan } from "./../../../config/TujuanKeuangan";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./../../../../firebase";
import { Ionicons } from "@expo/vector-icons";

const TujuanKeuangan = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [userUID, setUserUID] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [xp, setXp] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserUID(user.uid);
      fetchUserXp(user.uid);
    }

    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const fetchUserXp = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setXp(userDoc.data().xp || 0);
      }
    } catch (error) {
      console.error("Gagal mengambil XP pengguna:", error);
    }
  };

  const handleOptionPress = (pressedOption) => {
    setSelectedOption(pressedOption);
    const isAnswerCorrect =
      reactQuestionsTujuanKeuangan[currentQuestionIndex].correctAnswer ===
      pressedOption;

    setIsCorrect(isAnswerCorrect);

    if (!isAnswerCorrect) {
      setIncorrectQuestions((prev) => {
        // Tambahkan pertanyaan jika belum ada di daftar incorrectQuestions
        if (!prev.includes(currentQuestionIndex)) {
          return [...prev, currentQuestionIndex];
        }
        return prev;
      });
    } else {
      // Hapus pertanyaan dari daftar incorrectQuestions jika dijawab benar
      setIncorrectQuestions((prev) =>
        prev.filter((index) => index !== currentQuestionIndex)
      );
    }
  };

  // Fungsi sinkronisasi XP ke Firestore
  const updateXpInFirestore = async (updatedXp) => {
    try {
      const userDocRef = doc(db, "users", userUID);
      await updateDoc(userDocRef, { xp: updatedXp });
      console.log("XP berhasil disinkronkan ke Firestore");
    } catch (error) {
      console.error("Gagal menyinkronkan XP:", error);
    }
  };

  const completeModule = async (moduleId) => {
    try {
      const userDocRef = doc(db, "users", userUID);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedModules = userData.completedModules || [];

        if (!completedModules.includes(moduleId)) {
          const updatedCompletedModules = [...completedModules, moduleId];

          await updateDoc(userDocRef, {
            completedModules: updatedCompletedModules,
          });

          console.log(`Modul ${moduleId} berhasil ditandai sebagai selesai`);
        }
      }
    } catch (error) {
      console.error("Gagal menandai modul sebagai selesai: ", error);
    }
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

  const handleNext = async () => {
    if (selectedOption === null) {
      Alert.alert("Pilih jawaban terlebih dahulu!");
      return;
    }
    if (currentQuestionIndex === reactQuestionsTujuanKeuangan.length - 1) {
      if (incorrectQuestions.length > 0) {
        // Masih ada jawaban salah, ulangi pertanyaan yang salah
        setCurrentQuestionIndex(incorrectQuestions[0]); // Kembali ke pertanyaan salah pertama
        setSelectedOption(null);
        Alert.alert(
          "Perbaiki Jawaban",
          "Masih ada jawaban salah. Silakan ulangi."
        );
      } else {
        // Semua jawaban benar, tambahkan XP
        const updatedXp = xp + 30;
        await updateXpInFirestore(updatedXp); // Sinkronkan ke Firestore
        setXp(updatedXp); // Perbarui state lokal
        updateCorrectAnswers(reactQuestionsTujuanKeuangan.length);

        // Tandai modul sebagai selesai
        await completeModule(4); // ID modul untuk "Tujuan Keuangan"

        saveTimeSpent(userUID, timeElapsed); // Simpan waktu
        navigation.navigate("scoreLaporanKeuangan", { timeSpent: timeElapsed });
      }
    } else {
      // Pindah ke pertanyaan berikutnya
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const saveQuizScore = async (uid, xpEarned) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        xp: xp + xpEarned,
      });
      setXp(xp + xpEarned);
      console.log("XP berhasil disimpan");
    } catch (error) {
      console.error("Gagal menyimpan XP:", error);
    }
  };

  const saveTimeSpent = async (uid, timeSpent) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedTimeSpent = {
          ...userData.timeSpent,
          quizLaporanKeuangan: timeSpent,
        };
        await setDoc(
          userDocRef,
          { timeSpent: updatedTimeSpent },
          { merge: true }
        );
        console.log("Waktu berhasil disimpan");
      }
    } catch (error) {
      console.error("Gagal menyimpan waktu:", error);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView style={tw`p-4`}>
        <Text style={tw`text-base font-bold text-center mt-4 mb-5`}>
          {reactQuestionsTujuanKeuangan[currentQuestionIndex].question}
        </Text>

        {reactQuestionsTujuanKeuangan[currentQuestionIndex].options.map(
          (option) => (
            <Pressable
              key={option}
              style={[
                tw`border-2 p-2 my-2 rounded-lg`,
                selectedOption === option
                  ? isCorrect
                    ? tw`bg-green-200 border-green-500`
                    : tw`bg-red-200 border-red-500`
                  : tw`border-gray-300`,
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={selectedOption !== null}
            >
              <Text style={tw`text-sm text-center`}>{option}</Text>
            </Pressable>
          )
        )}

        {selectedOption !== null && !isCorrect && (
          <Text style={tw`text-red-500 mt-2`}>
            Jawaban benar:{" "}
            {reactQuestionsTujuanKeuangan[currentQuestionIndex].correctAnswer}
          </Text>
        )}

        <Pressable
          style={tw`bg-[#BB1624] p-2 rounded-lg mt-6 mb-5`}
          onPress={handleNext}
        >
          <Text style={tw`text-white text-center text-base`}>
            {currentQuestionIndex === reactQuestionsTujuanKeuangan.length - 1
              ? "Finish"
              : "Next"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TujuanKeuangan;
