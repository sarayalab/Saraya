import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import tw from "twrnc";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export default function ProgramList() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [programs, setPrograms] = useState([
    {
      id: 1,
      category: "Keuangan Bisnis",
      title: "Dasar Keuangan Bisnis",
      modules: "15",
      isAvailable: true,
    },
    {
      id: 2,
      category: "Investasi Usaha",
      title: "Pengenalan Strategi Pengembangan Usaha",
      modules: "10",
      isAvailable: true,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false); // State untuk modal
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      checkUserCourses();
    }
  }, [user]);

  const checkUserCourses = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const coursesJoined = userData.coursesJoined || [];
        const updatedPrograms = programs.map((program) => ({
          ...program,
          isAvailable: !coursesJoined.includes(program.id),
        }));
        setPrograms(updatedPrograms);
      }
    } catch (error) {
      console.log("Error checking user courses:", error);
      Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleProgramPress = (program) => {
    navigation.navigate(program.targetPage, { program });
  };

  const handleAddLesson = async (program) => {
    if (!user) {
      Alert.alert("Error", "Anda harus login terlebih dahulu.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        coursesJoined: arrayUnion(program.id),
      });

      const updatedPrograms = programs.map((p) =>
        p.id === program.id ? { ...p, isAvailable: false } : p
      );
      setPrograms(updatedPrograms);

      setModalVisible(true); // Menampilkan modal ketika lesson berhasil ditambahkan
    } catch (error) {
      console.log("Error adding lesson:", error);
      Alert.alert("Error", "Gagal menambahkan lesson. Silakan coba lagi.");
    }
  };

  const filteredPrograms =
    selectedCategory === "All"
      ? programs
      : programs.filter((program) => program.category === selectedCategory);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar />
      <ScrollView>
        <View style={tw`flex flex-row items-center py-3 px-5`}>
          <AntDesign
            name="arrowleft"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
          <View style={tw`flex-1 items-center`}>
            <Text style={tw`text-lg font-semibold`}>Pilihan Lesson</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw`border-b border-gray-200 px-5 py-3`}
        >
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => handleCategoryPress("All")}>
              <Text
                style={
                  selectedCategory === "All"
                    ? tw`text-red-500 font-bold mr-5`
                    : tw`text-gray-500 mr-5`
                }
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCategoryPress("Keuangan Bisnis")}
            >
              <Text
                style={
                  selectedCategory === "Keuangan Bisnis"
                    ? tw`text-red-500 font-bold mr-5`
                    : tw`text-gray-500 mr-5`
                }
              >
                Keuangan Bisnis
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCategoryPress("Keuangan Pribadi")}
            >
              <Text
                style={
                  selectedCategory === "Keuangan Pribadi"
                    ? tw`text-red-500 font-bold mr-5`
                    : tw`text-gray-500 mr-5`
                }
              >
                Keuangan Pribadi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCategoryPress("Pengembangan Usaha")}
            >
              <Text
                style={
                  selectedCategory === "Pengembangan Usaha"
                    ? tw`text-red-500 font-bold mr-5`
                    : tw`text-gray-500 mr-5`
                }
              >
                Pengembangan Usaha
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={tw`px-5 py-4`}>
          <Text style={tw`text-xs mb-4`}>Recent Upload</Text>
          {filteredPrograms.map((program) => (
            <View key={program.id} style={tw`flex-row mb-5 border rounded-lg p-3 border-gray-300 items-center`}>
              <Image
                source={
                  program.id === 1
                    ? require("../assets/keu.png")
                    : require("../assets/financial.png")
                }
                style={tw`w-30 h-30 mr-3 rounded-lg`}
              />
              <View style={tw`flex-1`}>
                <Text style={tw`text-gray-500 text-xs`}>
                  {program.category}
                </Text>
                <Text style={tw`text-black font-semibold`}>
                  {program.title}
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {program.modules} Modul
                </Text>
                <TouchableOpacity
                  style={tw`mt-3 px-3 py-1 rounded-full ${
                    program.isAvailable ? "bg-[#BB1624]" : "bg-gray-400"
                  }`}
                  disabled={!program.isAvailable}
                  onPress={() => handleAddLesson(program)}
                >
                  <Text style={tw`text-white text-center text-sm`}>
                    {program.isAvailable ? "Tambah Lesson" : "Sudah Ditambahkan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal untuk pesan keberhasilan */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-6 rounded-lg w-80 items-center`}>
            <Image
              source={require("../assets/coursesPage/confirmJoinClass.png")} // Ganti path ini sesuai gambar yang diunggah
              style={tw`w-24 h-24 mb-4`}
            />
            <Text style={tw`text-lg font-semibold mb-2 text-gray-700`}>
              Berhasil Ditambahkan
            </Text>
            <Text style={tw`text-center text-gray-500 mb-4`}>
              Ayo mulai belajar dengan Saraya sekarang!
            </Text>
            <TouchableOpacity
              style={tw`bg-[#BB1624] py-2 px-8 rounded-full`}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`text-white font-bold text-center`}>Lesson Saya</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
