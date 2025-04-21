import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Button,
} from "react-native";
import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../../../firebase";
import { Ionicons } from "react-native-vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTimeTracking } from "../hooks/useTimeTracking";
import { onSnapshot } from "firebase/firestore";



const addQuizToFirestore = async () => {
  try {
    const quizData = {
      name: "Keuangan Sehari-hari",
      questions: [
        {
          question: "Bagaimana cara menabung dengan konsisten?",
          options: [
            "Menyisihkan uang terlebih dahulu sebelum membelanjakannya",
            "Menabung hanya jika ada sisa uang",
            "Menyimpan uang dalam bentuk tunai tanpa perencanaan",
            "Menghabiskan uang untuk hiburan sebelum menabung",
          ],
          correctAnswer: "0",
        },
        {
          question: "Apa strategi terbaik dalam mengatur keuangan harian?",
          options: [
            "Membuat anggaran dan mengikuti rencana pengeluaran",
            "Menggunakan kartu kredit sebanyak mungkin",
            "Berbelanja tanpa memikirkan konsekuensi",
            "Meminjam uang untuk menutupi pengeluaran",
          ],
          correctAnswer: "0",
        },
        {
          question:
            "Bagaimana cara mengatur keuangan saat penghasilan tidak tetap?",
          options: [
            "Membelanjakan uang tanpa perhitungan",
            "Membuat anggaran fleksibel dan memiliki dana darurat",
            "Meminjam uang setiap bulan",
            "Menghindari menabung",
          ],
          correctAnswer: "1",
        },
        {
          question: "Apa cara sederhana untuk mulai investasi?",
          options: [
            "Menanamkan uang dalam aset yang bertambah nilainya secara bertahap",
            "Membeli barang konsumtif yang mahal",
            "Menghindari investasi karena risikonya tinggi",
            "Meminjam uang untuk membeli saham tanpa pemahaman",
          ],
          correctAnswer: "0",
        },
        {
          question: "Apa dampak dari tidak memiliki dana darurat?",
          options: [
            "Kesulitan menghadapi situasi tak terduga dan berisiko berutang",
            "Bisa tetap menjalani hidup tanpa masalah",
            "Tidak ada dampak yang berarti",
            "Memiliki lebih banyak uang untuk dibelanjakan",
          ],
          correctAnswer: "0",
        },
      ],
    };

    // Add the quiz to Firestore with an auto-generated document ID
    const quizRef = await addDoc(collection(db, "quizzes"), quizData);

    console.log("Quiz added successfully with ID:", quizRef.id);
  } catch (error) {
    console.error("Error adding quiz: ", error);
  }
};

const RoadmapScreen = ({ navigation, route }) => {
const [coins, setCoins] = useState(0);
const [xp, setXp] = useState(0);

  const uid = auth.currentUser.uid;

  const [levels, setLevels] = useState([]);
  const [lessons, setLessons] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [userProgress, setUserProgress] = useState({
    levels: {},
    lessons: {},
    quizzes: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchCoinsXP();
  }, []);

  // Add this to your RoadmapScreen component
  useEffect(() => {
    // Check if we have a refresh parameter
    if (route.params?.refresh) {
      // Fetch the latest user data
      fetchData();

      // Optionally clear the parameter after using it
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // Set up time tracking
  const timeTrackingRef = useRef(null);

  // Track time when screen comes into focus and loses focus
  useFocusEffect(
    useCallback(() => {
      // Screen is in focus - start tracking time
      timeTrackingRef.current = useTimeTracking("roadmap");

      // Return cleanup function to be called when screen goes out of focus
      return () => {
        if (timeTrackingRef.current) {
          timeTrackingRef.current.trackEndTime();
        }
      };
    }, [])
  );

  const fetchCoinsXP = () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        // return onSnapshot(userDocRef, async (doc) => {
        //   if (doc.exists()) {
        //     const userData = doc.data();

        //     setXp(userData.xp || 0);
        //     setCoins(userData.coins || 0);

        //   }
        // });
        const unsubscribe = onSnapshot(userDocRef, (docSnap)=>{
          if (docSnap.exists()) {
            const data = docSnap.data();
            setXp(data.xp || 0);
            setCoins(data.coins || 0);
          }
        });

        return () => unsubscribe();
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
};


  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      // const [userData, levelsData, lessonsData, quizzesData] 
      const [userData, levelsData,quizzesData]=
        await Promise.all([
          fetchUserProgress(),
          fetchRoadmapLevels(),
         
          fetchQuizzes()
      
        ]);
      const lessonsData = await fetchLessons(levelsData, userData);
      
      setUserProgress(userData);
      setLevels(levelsData);
      setLessons(lessonsData);
      setQuizzes(quizzesData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    // Get user progress
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    let userProgressData = {
      levels: {},
      lessons: {},
      quizzes: {},
    };

    if (userDoc.exists()) {
      const userData = userDoc.data();
      userProgressData = {
        levels: userData.progress?.levels || {},
        lessons: userData.progress?.lessons || {},
        quizzes: userData.progress?.quizzes || {},
      };
    }

    return userProgressData;
  };

  const fetchRoadmapLevels = async () => {
    // Fetch all roadmap levels
    const levelsCollection = collection(db, "roadmap");
    const levelsSnapshot = await getDocs(levelsCollection);

    const levelsData = [];
    levelsSnapshot.forEach((doc) => {
      const level = doc.data();
      level.id = doc.id; // Ensure the ID is included
      levelsData.push(level);
    });

    // Sort levels by order
    levelsData.sort((a, b) => a.order - b.order);

    return levelsData;
  };

  const fetchLessons = async (levelsData, userProgressData = { lessons: {}}) => {
    // Fetch all lessons
    const lessonsCollection = collection(db, "lessons");
    const lessonsSnapshot = await getDocs(lessonsCollection);

    const lessonsData = {};
    lessonsSnapshot.forEach((doc) => {
      const lesson = doc.data();
      lesson.id = doc.id; // Ensure the ID is included
      lessonsData[doc.id] = lesson;
    });
    
    let progressWasUpdated = false;

    // If there's at least one level and it has lessons, mark the first lesson as in-progress
    if (levelsData.length > 0 && levelsData[0].lessons?.length > 0) {
      // const firstLevelId = levels[0].id;
      const firstLessonId = levelsData[0].lessons[0];

      // Update user progress for the first lesson if not already started

      if (!userProgressData.lessons[firstLessonId]) {
        progressWasUpdated = true;

        userProgressData.lessons[firstLessonId] = {status: "in-progress"};
        // // Update local state
        // setUserProgress((prev) => ({
        //   ...prev,
        //   lessons: {
        //     ...prev.lessons,
        //     [firstLessonId]: { status: "in-progress" },
        //   },
        // }));

        // Update in database
        const userDocRef = doc(db, "users", uid);
        const docSnap = await getDoc(userDocRef);

        // await getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const updatedProgress = {
              ...(userData.progress || {}),
              lessons: {
                ...(userData.progress?.lessons || {}),
                [firstLessonId]: { status: "in-progress" },
              },
            };

            // Update Firestore
            // getDoc(userDocRef).then(() => {
            //   updateDoc(userDocRef, { progress: updatedProgress });
            // });
            await updateDoc(userDocRef, { progress: updatedProgress});
          }
        // });
      }
    }

    return lessonsData;
  };

  const fetchQuizzes = async () => {
    // Fetch all quizzes
    const quizzesCollection = collection(db, "quizzes");
    const quizzesSnapshot = await getDocs(quizzesCollection);

    const quizzesData = {};
    quizzesSnapshot.forEach((doc) => {
      const quiz = doc.data();
      quiz.id = doc.id; // Ensure the ID is included
      quizzesData[doc.id] = quiz;
    });

    return quizzesData;
  };

  const isLevelLocked = (levelId, index) => {
    // First level is always unlocked
    if (index === 0) return false;

    // Check if previous level is completed
    const previousLevel = levels[index - 1];
    if (!previousLevel) return false;

    return userProgress.levels[previousLevel.id]?.status !== "completed";
  };

  const handleLessonPress = (lessonId, levelId) => {
    // Track end time before navigating away
    if (timeTrackingRef.current) {
      timeTrackingRef.current.trackEndTime();
    }

    const levelIndex = levels.findIndex((l) => l.id === levelId);

    if (isLevelLocked(levelId, levelIndex)) {
      // Show "Complete previous level" message
      alert("Complete the previous level first");
      return;
    }

    // Get the current level and find the index of the lesson within this level
    const level = levels.find((l) => l.id === levelId);
    if (level && level.lessons) {
      const lessonIndex = level.lessons.indexOf(lessonId);

      // If not the first lesson in this level, check if previous lesson is completed
      if (lessonIndex > 0) {
        const previousLessonId = level.lessons[lessonIndex - 1];
        if (userProgress.lessons[previousLessonId]?.status !== "completed") {
          alert("Complete the previous lesson first");
          return;
        }
      }
    }

    navigation.navigate("lessons", { lessonId, levelId });
  };

  const handleQuizPress = (quizId, levelId) => {
    // Track end time before navigating away
    if (timeTrackingRef.current) {
      timeTrackingRef.current.trackEndTime();
    }

    const levelIndex = levels.findIndex((l) => l.id === levelId);

    if (isLevelLocked(levelId, levelIndex)) {
      // Show "Complete previous level" message
      alert("Complete the previous level first");
      return;
    }

    // Check if all lessons in this level are completed before allowing quiz
    const level = levels.find((l) => l.id === levelId);
    const allLessonsCompleted =
      level.lessons?.every(
        (lessonId) => userProgress.lessons[lessonId]?.status === "completed"
      ) || false;

    if (!allLessonsCompleted) {
      // Show "Complete all lessons first" message
      alert("Complete all lessons in this level first");
      return;
    }

    navigation.navigate("quiz", { quizId, levelId });
  };

  const renderModuleIcon = (status) => {
    if (status === "completed") {
      return (
        <Image
          source={require("../../../assets/roadMap/checkicon.png")}
          style={tw`w-15 h-15 resize-contain`}
          resizeMode="contain"
        />
      );
    }
    if (status === "in-progress") {
      return (
        <Image
          source={require("../../../assets/roadMap/bookicon.png")}
          style={tw`w-15 h-15 resize-contain`}
          resizeMode="contain"
        />
      );
    }
    return (
      <Image
        source={require("../../../assets/roadMap/lock-icon.png")}
        style={tw`w-15 h-15 resize-contain`}
        resizeMode="contain"
      />
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar />

      {/* <Button title="Add Quiz" onPress={addQuizToFirestore} /> */}

      <LinearGradient colors={["#B93C46FF", "#FCFCFCFF"]} style={tw`flex-1`}>
        <ScrollView>
          <View style={tw`relative flex-col gap-5`}>
            <ImageBackground
              source={require("../../../assets/leaderboard/cardhead.png")}
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
                      source={require("../../../assets/homePage/XP1.png")}
                      style={tw`w-8 h-8`}
                    />
                    <Text style={tw`text-white text-base`}>{xp}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-2`}>
                    <Image
                      source={require("../../../assets/homePage/coins.png")}
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
                  source={require("../../../assets/homePage/inpest.png")}
                  style={tw`w-10 h-10`}
                />
                <Text style={tw`text-white text-base`}>
                  {"Dasar Keuangan Bisnis"}
                </Text>
                <TouchableOpacity
                  style={tw`bg-[#040404] bg-opacity-20 rounded`}
                  onPress={() => navigation.navigate("myLessons")}
                >
                  <Text style={tw`text-white text-xs underline p-1 bg-[#2220]`}>
                    {"Ubah Level"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            <View style={tw`w-full px-6 flex-col items-center gap-2`}>
              {levels.map((level, index) => {
                const levelProgress = userProgress.levels[level.id] || {};
                const isLocked = isLevelLocked(level.id, index);

                return (
                  <View key={level.id} style={tw`w-full p-4`}>
                    <View style={tw`grid grid-cols-1 gap-4 mt-2`}>
                      {level.lessons?.map((lessonId) => {
                        const lesson = lessons[lessonId] || {};
                        const lessonProgress =
                          userProgress.lessons[lessonId] || {};

                        return (
                          <TouchableOpacity
                            key={lessonId}
                            style={tw`flex-col items-center gap-1`}
                            onPress={() =>
                              handleLessonPress(lessonId, level.id)
                            }
                          >
                            {renderModuleIcon(lessonProgress.status)}
                            <Text
                              style={tw`text-center mt-2 text-xs ${
                                isLocked ? "text-gray-400" : "text-black"
                              }`}
                            >
                              {lesson.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View
                      style={[
                        tw`px-6 py-6 my-8 bg-white rounded-3xl`,
                        { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                      ]}
                    >
                      <Text style={tw`text-center text-sm text-[#BB1624]`}>
                        {`Level ${level.order}`}
                      </Text>
                      <Text
                        style={tw`text-center text-xl font-bold text-[#BB1624] mb-6`}
                      >
                        {level.name}
                      </Text>

                      {level.quizzes && level.quizzes.length > 0 && (
                        <View style={tw`mt-2`}>
                          {Array(Math.ceil(level.quizzes.length / 2))
                            .fill(0)
                            .map((_, rowIndex) => {
                              // Get current row's quizzes
                              const rowQuizzes = level.quizzes.slice(
                                rowIndex * 2,
                                rowIndex * 2 + 2
                              );
                              // Check if this row has only one item and it's the last row
                              const isSingleItemRow =
                                rowQuizzes.length === 1 &&
                                rowIndex ===
                                  Math.ceil(level.quizzes.length / 2) - 1;

                              return (
                                <View
                                  key={`row-${rowIndex}`}
                                  style={tw`mb-4 ${
                                    isSingleItemRow ? "flex-col" : "flex-row"
                                  }  justify-center item-center content-center`}
                                >
                                  {level.quizzes
                                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                                    .map((quizId) => {
                                      const quiz = quizzes[quizId] || {};
                                      const quizzesProgress =
                                        userProgress.quizzes[quizId] || {};

                                      return (
                                        <TouchableOpacity
                                          key={quizId}
                                          style={tw`flex-col items-center gap-1 flex-1 mx-2`}
                                          onPress={() =>
                                            handleQuizPress(quizId, level.id)
                                          }
                                        >
                                          {renderModuleIcon(
                                            quizzesProgress.status
                                          )}
                                          <Text
                                            style={tw`text-center mt-2 text-xs ${
                                              isLocked
                                                ? "text-gray-400"
                                                : "text-black"
                                            }`}
                                          >
                                            {quiz.name}
                                          </Text>
                                        </TouchableOpacity>
                                      );
                                    })}
                                  {/* Add empty placeholder if last row has odd number */}
                                  {rowIndex ===
                                    Math.ceil(level.quizzes.length / 2) - 1 &&
                                    level.quizzes.length % 2 !== 0 && (
                                      <View style={tw`flex-1 mx-2`} />
                                    )}
                                </View>
                              );
                            })}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RoadmapScreen;