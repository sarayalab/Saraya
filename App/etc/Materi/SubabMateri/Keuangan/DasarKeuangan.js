import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { db, auth } from "./../../../../../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const reactMateriKeuangan = [
  {
    Judul: "Mengapa Pemisahan Keuangan itu Penting?",
    subJudul:
      "Mungkin sebagian dari kamu bertanya-tanya, 'Mengapa perlu memisahkan keuangan? Bukankah itu merepotkan?' Namun, tanpa pemisahan yang jelas, kamu akan menghadapi banyak kesulitan dalam memahami kondisi finansial bisnismu. Ini bisa mempengaruhi keputusan penting yang kamu ambil terkait usaha, seperti menentukan anggaran, mengelola pengeluaran, atau bahkan memutuskan untuk memperluas bisnis.",
    subBabJudul: "Tiga Langkah Praktis Memisahkan Keuangan Pribadi dan Bisnis:",
    Poin: [
      "Buka Rekening Bisnis Terpisah: Semua pendapatan dan pengeluaran bisnis harus melalui rekening ini. Rekening terpisah akan memudahkanmu melacak arus kas, memahami berapa banyak keuntungan yang sebenarnya dihasilkan, dan melihat area mana yang memerlukan perbaikan.",
      "Catat Setiap Pengeluaran dengan Teliti: Setelah memiliki rekening terpisah, langkah berikutnya adalah mencatat semua transaksi, baik itu pendapatan maupun pengeluaran. Kamu bisa menggunakan aplikasi keuangan sederhana atau buku kas manual untuk mencatat setiap pengeluaran yang terjadi. Dengan pencatatan yang teratur, kamu akan bisa menganalisis pengeluaran apa saja yang sebenarnya bisa dihemat.",
      "Buat Anggaran Bisnis yang Terperinci: Memiliki anggaran khusus untuk bisnis akan membantumu mengelola pengeluaran dengan lebih baik. Buatlah anggaran untuk kebutuhan operasional harian, seperti pembelian bahan baku, biaya transportasi, atau gaji pegawai. Pastikan juga kamu memiliki anggaran darurat untuk menghadapi situasi yang tidak terduga. Anggaran ini bisa membantumu menjaga agar keuangan bisnis tetap sehat dan terencana.",
    ],
  },
  {
    Judul: "Mulai dari Langkah Sederhana",
    Poin: [
      "Mulailah dari hal-hal kecil seperti membuka rekening terpisah dan mencatat pengeluaranmu. Semakin kamu disiplin dalam memisahkan keuangan, semakin stabil keuangan bisnismu. Ini adalah pondasi penting bagi pertumbuhan bisnis kamu di masa depan. Sekarang saatnya mulai memisahkan keuangan pribadi dan bisnismu! Dengan langkah kecil ini, kamu bisa membawa bisnis kamu ke level yang lebih tinggi dan memastikan stabilitas finansial yang lebih baik.",
    ],
  },
  // Tambahkan materi lainnya jika diperlukan
];

const DasarKeuangan = ({ navigation }) => {
  const [currentMateriIndex, setCurrentMateriIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleNext = async () => {
    if (currentMateriIndex === reactMateriKeuangan.length - 1) {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            completedModules: arrayUnion(3),
          });
          console.log("Modul berhasil ditambahkan ke daftar penyelesaian");
        } catch (error) {
          console.error("Gagal memperbarui status modul:", error);
        }
      }
      navigation.navigate("kuisLaporanKeuangan");
    } else {
      // Pindah ke materi berikutnya dan reset scrollProgress ke 0
      setCurrentMateriIndex(currentMateriIndex + 1);
      setScrollProgress(0); // Reset scroll progress saat pindah ke materi berikutnya
    }
  };

  const handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollY = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    const currentProgress =
      (scrollY / (contentHeight - scrollViewHeight)) * 100;
    setScrollProgress(currentProgress);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Bar */}
      <View style={tw`flex-row justify-between w-full h-1.5 mt-4 px-2`}>
        <View style={tw`flex-row w-full h-full`}>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`}>
            <View
              style={tw`absolute left-0 h-full bg-red-600 rounded-full w-full`}
            />
          </View>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`}>
            <View
              style={tw`absolute left-0 h-full bg-red-600 rounded-full w-full`}
            />
          </View>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`}>
            {/* Progress bar dinamis pada view ketiga */}
            <View
              style={[
                tw`absolute left-0 h-full bg-red-600 rounded-full`,
                { width: `${scrollProgress}%` },
              ]}
            />
          </View>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} />
        </View>
      </View>

      {/* Header */}
      <View style={tw`flex-row items-center justify-between mt-4 px-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold ml-2`}>Lesson 3</Text>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={tw`flex-grow p-6 pb-10`}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={tw`text-xl font-extrabold text-[#BB1624] mb-6`}>
          Dasar Keuangan Bisnis
        </Text>

        <Text style={tw`text-lg font-bold mb-4 text-[#333]`}>
          {reactMateriKeuangan[currentMateriIndex].Judul}
        </Text>

        <Text style={tw`text-justify text-gray-600 mb-6`}>
          {reactMateriKeuangan[currentMateriIndex].subJudul}
        </Text>

        <Text style={tw`text-base font-semibold mb-4 text-gray-700`}>
          {reactMateriKeuangan[currentMateriIndex].subBabJudul}
        </Text>

        {reactMateriKeuangan[currentMateriIndex].Poin.map((poin, index) => (
          <View key={index} style={tw`flex-row items-start mb-4`}>
            <View style={tw`h-2 w-2 rounded-full bg-gray-400 mt-2 mr-2`} />
            <Text style={tw`flex-1 text-justify text-gray-600`}>{poin}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={tw`bg-gray-600 p-2 rounded-full items-center mt-6`}
          onPress={handleNext}
        >
          <Text style={tw`text-white text-base`}>
            {currentMateriIndex === reactMateriKeuangan.length - 1
              ? "Finish"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DasarKeuangan;
