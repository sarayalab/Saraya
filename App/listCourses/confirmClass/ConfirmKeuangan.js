import { View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import React from 'react';
import tw from 'twrnc';

const ConfirmKeuangan = () => {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* StatusBar untuk mengatur gaya bar status */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* ScrollView untuk konten yang dapat digulir */}
      <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center p-8`}>
        {/* Gambar */}
        <Image
          source={require('./../../assets/coursesPage/confirmJoinClass.png')}
          style={tw`w-58 h-68 mb-6`}
          resizeMode="contain"
        />

        {/* Teks "Confirmed" */}
        <Text style={tw`text-2xl font-semibold text-gray-700 mb-6`}>Confirmed</Text>

        {/* Teks deskripsi */}
        <Text style={tw`text-center text-gray-500 mb-6`}>
          Start learning now to enhance your entrepreneur skills!
        </Text>

        {/* Tombol "My Course" */}
        <TouchableOpacity style={tw`bg-[#BB1624] px-16 py-2 rounded-full`}>
          <Text style={tw`text-white text-base font-semibold`}>My Course</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmKeuangan;
