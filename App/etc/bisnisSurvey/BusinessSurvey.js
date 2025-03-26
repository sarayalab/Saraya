import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function BusinessSurvey({ route }) {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [businessField, setBusinessField] = useState("");
  const [businessChallenge, setBusinessChallenge] = useState("");
  const [educationTopics, setEducationTopics] = useState([]);
  const [financialSkill, setFinancialSkill] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [userUID, setUserUID] = useState("");
  const [fullname, setFullname] = useState("");
  const [hasSurvey, setHasSurvey] = useState(false);
  const [viewOnly, setViewOnly] = useState(route.params?.viewOnly || false); // New parameter to indicate view mode

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUID(user.uid);
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileImage(userData.profileImage);
        setFullname(userData.fullname || "");
        setHasSurvey(userData.hasCompletedSurvey || false);

        // Only redirect if the user is not in view mode and has completed the survey
        if (userData.hasCompletedSurvey && !viewOnly) {
          navigation.navigate("MainApp");
          alert("Kamu Telah Mengisi Suervey Bisnis mu");
        }

        // Populate fields if survey data exists
        if (userData.businessName) {
          setBusinessName(userData.businessName);
          setBusinessField(userData.businessField);
          setBusinessChallenge(userData.businessChallenge);
          setEducationTopics(userData.educationTopics || []);
          setFinancialSkill(userData.financialSkill || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && businessName === "") {
      Alert.alert("Error", "Nama bisnis tidak boleh kosong!");
      return;
    }
    if (step === 2 && businessField === "") {
      Alert.alert("Error", "Silakan pilih bidang bisnis!");
      return;
    }
    if (step === 3 && businessChallenge === "") {
      Alert.alert("Error", "Silakan pilih tantangan bisnis!");
      return;
    }
    if (step === 4 && educationTopics.length === 0) {
      Alert.alert("Error", "Silakan pilih minimal satu topik edukasi!");
      return;
    }
    if (step === 5 && financialSkill === "") {
      Alert.alert("Error", "Silakan pilih kemampuan finansial Anda!");
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      saveSurveyData();
    }
  };

  const handleEducationTopicSelect = (topic) => {
    if (educationTopics.includes(topic)) {
      setEducationTopics(educationTopics.filter((t) => t !== topic));
    } else if (educationTopics.length < 3) {
      setEducationTopics([...educationTopics, topic]);
    } else {
      Alert.alert("Error", "Anda hanya bisa memilih 3 topik edukasi.");
    }
  };

  const saveSurveyData = async () => {
    try {
      const userDocRef = doc(db, "users", userUID);
      await updateDoc(userDocRef, {
        businessName,
        businessField,
        businessChallenge,
        educationTopics,
        financialSkill,
        hasCompletedSurvey: true,
      });
      Alert.alert("Success", "Survey completed!");
      setHasSurvey(true);
      navigation.navigate("MainApp");
    } catch (error) {
      console.error("Error saving survey data: ", error);
      Alert.alert("Error", "Failed to save survey data.");
    }
  };

  // If survey is completed and viewOnly is true, show survey details
  if (hasSurvey && viewOnly) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <Image
          source={require("./../../assets/LoginPage/Logo.png")}
          style={tw`h-25 w-25 self-center mt-10`}
        />
        <ScrollView contentContainerStyle={tw`p-6`}>
          <Text style={tw`text-2xl font-bold mt-4 text-[#BB1624] text-center`}>
            Detail Bisnis Anda
          </Text>
          <View style={tw`bg-[#FFFFFF] w-full p-4 mt-6 rounded-xl shadow-lg`}>
            <Text style={tw`text-lg font-semibold mb-2`}>Nama Bisnis:</Text>
            <Text style={tw`text-base text-gray-700`}>{businessName}</Text>
            <Text style={tw`text-lg font-semibold mt-4 mb-2`}>Bidang:</Text>
            <Text style={tw`text-base text-gray-700`}>{businessField}</Text>
            <Text style={tw`text-lg font-semibold mt-4 mb-2`}>Tantangan:</Text>
            <Text style={tw`text-base text-gray-700`}>{businessChallenge}</Text>
            <Text style={tw`text-lg font-semibold mt-4 mb-2`}>
              Topik Edukasi:
            </Text>
            <Text style={tw`text-base text-gray-700`}>
              {educationTopics.join(", ")}
            </Text>
            <Text style={tw`text-lg font-semibold mt-4 mb-2`}>
              Kemampuan Finansial:
            </Text>
            <Text style={tw`text-base text-gray-700`}>{financialSkill}</Text>
          </View>

          <View style={tw`flex-row justify-between w-full mt-6`}>
            <TouchableOpacity
              style={tw`flex-1 bg-[#BB1624] py-3 px-6 rounded-full mr-2`}
              onPress={() => {
                setStep(1);
                setViewOnly(false);
              }}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Isi Survey Kembali
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-gray-500 py-3 px-6 rounded-full ml-2`}
              onPress={() => navigation.navigate("MainApp")}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Ke Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Image
        source={require("./../../assets/LoginPage/Logo.png")}
        style={tw`h-25 w-25 self-center mt-20`}
      />
      <ScrollView
        contentContainerStyle={tw`flex-1 justify-center items-center p-6`}
      >
        {step === 0 ? (
          <View style={tw`items-center mb-6`}>
            <Text style={tw`text-xl font-bold mt-4 text-center`}>
              Selamat datang di Saraya, {fullname}
            </Text>
            <Text style={tw`text-center text-xs text-gray-600 mt-2`}>
              Mari kita mulai untuk mempersiapkan konten pilihan sesuai dengan
              kebutuhan kamu!
            </Text>
            <TouchableOpacity
              style={tw`bg-[#BB1624] py-3 px-6 rounded-full mt-4`}
              onPress={() => setStep(1)}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Mulai Sekarang!
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {step === 1 && (
              <View style={tw`w-full`}>
                <Text style={tw`text-lg mb-2 font-bold`}>Nama Bisnis</Text>
                <TextInput
                  style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
                  placeholder="Masukkan nama bisnis Anda"
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>
            )}

            {step === 2 && (
              <View style={tw`w-full`}>
                <Text style={tw`text-lg mb-2 font-bold`}>Bidang Bisnis</Text>
                {[
                  "Makanan/Minuman",
                  "Pakaian",
                  "Kerajinan",
                  "Retail",
                  "Lainnya",
                ].map((field) => (
                  <TouchableOpacity
                    key={field}
                    style={[
                      tw`p-3 rounded-lg mb-2 border`,
                      businessField === field
                        ? tw`bg-[#BB1624] border-[#BB1624]`
                        : tw`border-gray-300`,
                    ]}
                    onPress={() => setBusinessField(field)}
                  >
                    <Text
                      style={tw`text-center ${
                        businessField === field ? "text-white" : "text-black"
                      }`}
                    >
                      {field}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 3 && (
              <View style={tw`w-full`}>
                <Text style={tw`text-lg mb-2 font-bold`}>
                  Tantangan Terbesar yang Dihadapi
                </Text>
                {[
                  "Manajemen Keuangan",
                  "Pemasaran",
                  "Operasional",
                  "Modal Usaha",
                  "Lainnya",
                ].map((challenge) => (
                  <TouchableOpacity
                    key={challenge}
                    style={[
                      tw`p-3 rounded-lg mb-2 border`,
                      businessChallenge === challenge
                        ? tw`bg-[#BB1624] border-[#BB1624]`
                        : tw`border-gray-300`,
                    ]}
                    onPress={() => setBusinessChallenge(challenge)}
                  >
                    <Text
                      style={tw`text-center ${
                        businessChallenge === challenge
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {challenge}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 4 && (
              <View style={tw`w-full`}>
                <Text style={tw`text-lg mb-2 font-bold`}>
                  Apa jenis topik edukasi yang paling Anda butuhkan?
                </Text>
                <ScrollView
                  contentContainerStyle={tw`w-full flex-row flex-wrap justify-between`}
                  horizontal={false}
                >
                  {[
                    "Kelola Keuangan",
                    "Akses Modal",
                    "Investasi",
                    "Tabungan",
                    "Kelola Arus Kas",
                    "Perencanaan Pajak",
                    "Asuransi Bisnis",
                    "Menyusun Anggaran Bisnis",
                    "Pemasaran Ekspansi",
                    "Pemasaran Konten",
                    "Strategi KOL",
                    "Pemasaran Digital",
                  ].map((topic) => (
                    <TouchableOpacity
                      key={topic}
                      style={[
                        tw`w-[48%] p-3 rounded-lg mb-2 border`,
                        educationTopics.includes(topic)
                          ? tw`bg-[#BB1624] border-[#BB1624]`
                          : tw`border-gray-300`,
                      ]}
                      onPress={() => handleEducationTopicSelect(topic)}
                    >
                      <Text
                        style={tw`text-center ${
                          educationTopics.includes(topic)
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {topic}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {step === 5 && (
              <View style={tw`w-full`}>
                <Text style={tw`text-lg mb-2 font-bold`}>
                  Kemampuan Finansial Anda saat ini (pilih yang paling sesuai):
                </Text>
                {[
                  "Basic: Baru memulai",
                  "Menengah: Paham dasar keuangan",
                  "Mahir: Paham perencanaan dan analisis",
                ].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      tw`p-3 rounded-lg mb-2 border`,
                      financialSkill === level
                        ? tw`bg-[#BB1624] border-[#BB1624]`
                        : tw`border-gray-300`,
                    ]}
                    onPress={() => setFinancialSkill(level)}
                  >
                    <Text
                      style={tw`text-center ${
                        financialSkill === level ? "text-white" : "text-black"
                      }`}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={tw`bg-[#BB1624] py-3 px-6 rounded-full mt-4`}
              onPress={handleNextStep}
            >
              <Text style={tw`text-white text-center font-bold`}>
                {step < 5 ? "Lanjutkan" : "Selesai"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
