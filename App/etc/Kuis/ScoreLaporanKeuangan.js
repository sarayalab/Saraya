import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const ScoreLaporanKeuangan = ({ route, navigation }) => {
  const { score } = route.params;
  const xpEarned = score >= 70 ? 30 : 0; // XP diberikan jika skor di atas atau sama dengan KKM 70

  return (
    <SafeAreaView style={tw`flex-1 justify-center items-center bg-white p-6`}>
      <Image
        source={require("../../assets/undraw_winners_kuis.png")}
        style={tw`w-56 h-56 mt-5`}
        resizeMode="contain"
      />

      <Text style={tw`text-4xl text-[#BB1624] font-bold mt-8`}>Selamat!</Text>
      <Text style={tw`text-lg mt-2 text-center`}>
        Kamu berhasil mendapatkan
      </Text>
      <View style={tw`flex-row items-center mt-2  p-4 rounded-lg`}>
        <Image
          source={require("../../assets/homePage/XP1.png")}
          style={tw`w-10 h-10 mr-3`}
          resizeMode="contain"
        />
        <Text style={tw`text-4xl text-yellow-400`}>30</Text>
      </View>

      <Pressable
        style={tw`bg-[#BB1624] py-3 px-16 rounded-lg mt-12`}
        onPress={() => navigation.navigate("MainApp")}
      >
        <Text style={tw`text-white font-semibold`}>Next Lesson</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ScoreLaporanKeuangan;
