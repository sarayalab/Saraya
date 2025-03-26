import React from 'react';
import { Video } from 'expo-av';
import { SafeAreaView, ScrollView, StatusBar, Text, View, Pressable, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const InvestasiUsaha = () => {
  const navigation = useNavigation();
  const video = React.useRef(null);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        {/* Header dengan Arrow Back dan Title */}
        <View style={tw`py-4 px-5 bg-white mt-8 flex-row items-center`}>
          <AntDesign name="arrowleft" size={24} color="black" onPress={() => navigation.navigate("programList")}/>
          <Text style={tw`text-lg text-center font-bold flex-1`}>Details</Text>
        </View>

        {/* Bagian Video */}
        <View style={tw`h-50 bg-gray-200 justify-center items-center`}>
          <Video
            ref={video}
            source={require("./../assets/Video/adsIklan.mp4")}
            style={tw`w-full h-50`}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        </View>

        {/* Bagian Pengantar */}
        <View style={tw`p-3`}>
          <Text style={tw`text-base font-bold text-[#BB1624]`}>
            Introduction of Lorem Ipsum
          </Text>
          <Text style={tw`text-xs text-gray-600 mt-1`}>
            Dive into essential venture capital insights in our video,
            empowering your startup to secure the funding it deserves. Watch now
            and master the art of funding!
          </Text>

          {/* Rating dan Informasi */}
          <View style={tw`flex-row items-center mt-2`}>
            <Text style={tw`text-yellow-500 text-xs`}>⭐ 4.5 (823)</Text>
            <Text style={tw`text-gray-400 ml-2 text-xs`}>4 Module</Text>
            <Text style={tw`text-gray-400 ml-2 text-xs`}>Investasi Usaha</Text>
          </View>
        </View>

        {/* List Modul */}
        <View style={tw`p-3`}>
          <View style={tw`bg-white rounded-xl p-3 shadow-lg`}>
            {/* Item Modul */}
            {[
              {
                title: "Fundamentals for Startup Success",
                duration: "30 minutes",
              },
              {
                title: "Crafting the Perfect Investor Pitch Guide",
                duration: "1 hour 20 minutes",
              },
              {
                title: "Negotiating Deal Terms: Value Maximization Strategies",
                duration: "45 minutes",
              },
              {
                title: "Venture Capital: Fueling Growth Strategies Explored",
                duration: "1 hour 3 minutes",
              },
            ].map((item, index) => (
              <View
                key={index}
                style={tw`flex-row items-center mb-3 flex-wrap`}
              >
                {/* Placeholder untuk gambar kotak */}
                <View style={tw`w-10 h-10 bg-gray-200 rounded-md`} />
                <View style={tw`ml-3 flex-1`}>
                  <Text style={tw`text-sm `}>{item.title}</Text>
                  <Text style={tw`text-xs text-gray-500`}>{item.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tombol Join Class */}
        <View style={tw`p-3`}>
          <Pressable style={tw`bg-[#BB1624] py-2 rounded-full items-center`} onPress={() => navigation.navigate("confirmkeuanganProgram")}>
            <Text style={tw`text-white text-sm font-semibold`}>
              JOIN CLASS
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvestasiUsaha;
