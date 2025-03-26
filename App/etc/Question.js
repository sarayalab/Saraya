import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";

export default function Notifications({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulasi pengambilan data notifikasi, misalnya dari API atau database
    // Set notifications jika ada data
    // Jika kosong, biarkan array kosong untuk menampilkan pesan "Belum ada notifikasi"
    setNotifications([]);
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar />

      <View style={tw`flex-row items-center justify-between px-4 py-3 `}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#787879" />
        </TouchableOpacity>
        <Text style={tw`text-lg text-gray-600`}>Notifikasi</Text>
        <View style={tw`w-6`} /> 
      </View>

      <ScrollView contentContainerStyle={tw`flex-1 items-center justify-center`}>
        {notifications.length === 0 ? (
          // Jika tidak ada notifikasi, tampilkan pesan ini
          <View style={tw`items-center`}>
            <Ionicons name="notifications-outline" size={100} color="#B0B0B0" />
            <Text style={tw`text-gray-500 mt-4`}>Belum ada notifikasi</Text>
          </View>
        ) : (
          // Jika ada notifikasi, tampilkan daftar notifikasi
          <View style={tw`w-full p-4`}>
            {notifications.map((notif, index) => (
              <View key={index} style={tw`border-b border-gray-200 py-2`}>
                <Text style={tw`text-gray-700`}>{notif.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
