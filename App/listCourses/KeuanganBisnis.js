import React, { useState, useEffect } from "react";
import { Video } from "expo-av";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebase";

const KeuanganBisnis = () => {
  const navigation = useNavigation();
  const video = React.useRef(null);
  const [userId, setUserId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const modules = [
    {
      title: "Fundamentals for Startup Success",
      duration: "30 minutes",
      level: 1,
    },
    {
      title: "Fundamentals for Startup Success",
      duration: "30 minutes",
      level: 1,
    },
    {
      title: "Fundamentals for Startup Success",
      duration: "30 minutes",
      level: 1,
    },
    {
      title: "Fueling Growth Strategies",
      duration: "1 hour 3 minutes",
      level: 4,
    },
  ];
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        checkUserJoined(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserJoined = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setJoined(userData.coursesJoined?.includes("keuanganBisnis"));
    }
  };

  const handleJoinClass = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        coursesJoined: arrayUnion("keuanganBisnis"),
        completedModules: { keuanganBisnis: [] },
        points: 0,
      });

      setModalVisible(true);
      setJoined(true);
    } catch (error) {
      console.error("Error joining class:", error);
      Alert.alert("Error", "Failed to join class.");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={tw`py-4 px-5 bg-white mt-8 flex-row items-center`}>
          <AntDesign
            name="arrowleft"
            size={24}
            color="black"
            onPress={() => navigation.navigate("programList")}
          />
          <Text style={tw`text-lg text-center font-bold flex-1`}>Details</Text>
        </View>

        <View style={tw`h-50 bg-gray-200 justify-center items-center`}>
          <Video
            ref={video}
            source={require("./../assets/Video/Keuangan.mp4")}
            style={tw`w-full h-50`}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        </View>

        <View style={tw`p-3`}>
          <Text style={tw`text-base font-bold text-[#BB1624]`}>
            Introduction of Venture Capital
          </Text>
          <Text style={tw`text-xs text-gray-600 mt-1`}>
            Learn about the fundamentals of venture capital to empower your
            startup.
          </Text>

          <View style={tw`flex-row items-center mt-2`}>
            <Text style={tw`text-yellow-500 text-xs`}>⭐ 4.5 (823)</Text>
            <Text style={tw`text-gray-400 ml-2 text-xs`}>4 Modules</Text>
          </View>
        </View>

        <View style={tw`p-3`}>
          <View style={tw`bg-white rounded-xl p-3 shadow-lg`}>
            {modules.map((item, index) => (
              <View key={index} style={tw`flex-row items-center mb-3`}>
                <View style={tw`w-10 h-10 bg-gray-200 rounded-md`} />
                <View style={tw`ml-3 flex-1`}>
                  <Text style={tw`text-sm`}>{item.title}</Text>
                  <Text style={tw`text-xs text-gray-500`}>{item.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={tw`p-3`}>
          {!joined ? (
            <Pressable
              style={tw`bg-[#BB1624] py-2 rounded-full items-center`}
              onPress={handleJoinClass}
            >
              <Text style={tw`text-white text-sm font-semibold`}>
                JOIN CLASS
              </Text>
            </Pressable>
          ) : (
            <Text style={tw`text-green-600 text-center`}>
              Yeayyy!! Kamu udah join kelasnya
            </Text>
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-6 rounded-lg items-center`}>
              <Image
                source={require("./../assets/coursesPage/confirmJoinClass.png")}
                style={tw`w-58 h-68 mb-6`}
                resizeMode="contain"
              />
              <Text style={tw`text-2xl font-semibold text-gray-700 mb-6`}>
                Confirmed
              </Text>
              <Text style={tw`text-center text-gray-500 mb-6`}>
                Start learning now to enhance your entrepreneur skills!
              </Text>
              <TouchableOpacity
                style={tw`bg-[#BB1624] px-16 py-2 rounded-full`}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  navigation.navigate("MainApp");
                }}
              >
                <Text style={tw`text-white text-base font-semibold`}>
                  My Course
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KeuanganBisnis;
