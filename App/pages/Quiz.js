import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import tw from 'twrnc';
import { addQuizXP } from "./Signin";

const Quiz = ({ navigation, route }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 detik per soal
  const [isTimerActive, setIsTimerActive] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isTimerActive]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    Alert.alert(
      "Waktu Habis!",
      "Waktu Anda untuk menjawab pertanyaan ini telah habis.",
      [
        {
          text: "OK",
          onPress: () => {
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setSelectedAnswer(null);
              setTimeLeft(60); // Reset timer untuk pertanyaan berikutnya
              setIsTimerActive(true);
            } else {
              finishQuiz();
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      Alert.alert("Peringatan", "Silakan pilih jawaban terlebih dahulu");
      return;
    }

    setIsTimerActive(false); // Hentikan timer saat jawaban dipilih
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (currentQuestionIndex === questions.length - 1) {
      finishQuiz(newScore);
    } else {
      setScore(newScore);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(60); // Reset timer untuk pertanyaan berikutnya
      setIsTimerActive(true);
    }
  };

  const finishQuiz = async (finalScore = score) => {
    const percentage = (finalScore / questions.length) * 100;
    const isPassed = percentage >= 100; // Harus 100% untuk lulus

    if (isPassed) {
      await addQuizXP(userId);
    }

    // Panggil onComplete dengan nilai quiz
    if (route.params?.onComplete) {
      route.params.onComplete(percentage);
    }

    Alert.alert(
      "Quiz Selesai",
      `Skor Anda: ${finalScore}/${questions.length} (${percentage.toFixed(1)}%)\n${
        isPassed ? "Selamat! Anda lulus!" : "Maaf, Anda belum lulus. Silakan coba lagi."
      }`,
      [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-lg font-bold`}>
            Pertanyaan {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <Text style={[
            tw`text-lg font-bold`,
            timeLeft <= 10 ? tw`text-red-500` : tw`text-black`
          ]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <Text style={tw`text-lg mb-4`}>{questions[currentQuestionIndex].question}</Text>

        {questions[currentQuestionIndex].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              tw`p-4 mb-2 rounded-lg border border-gray-300`,
              selectedAnswer === index ? tw`bg-blue-100 border-blue-500` : null,
            ]}
            onPress={() => setSelectedAnswer(index)}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={tw`bg-blue-500 p-4 rounded-lg mt-4`}
          onPress={handleSubmit}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {currentQuestionIndex === questions.length - 1 ? "Selesai" : "Selanjutnya"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Quiz; 