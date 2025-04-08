import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import Collapsible from "react-native-collapsible";
import tw from "twrnc";
import { AntDesign } from "@expo/vector-icons"; // Import ikon dari AntDesign
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const FAQItem = ({ question, answer }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <View style={tw`mb-4 border border-red-500 `}>
      <TouchableOpacity
        style={tw`flex-row justify-between items-center p-4 bg-white`}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <Text style={tw`text-black font-semibold text-sm`}>{question}</Text>
        {isCollapsed ? (
          <AntDesign name="plus" size={20} color="#BB1624" />
        ) : (
          <AntDesign name="minus" size={20} color="#BB1624" />
        )}
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed}>
        <View style={tw`p-4 bg-gray-50 `}>
          <Text style={tw`text-gray-700 text-sm `}>{answer}</Text>
        </View>
      </Collapsible>
    </View>
  );
};

const FAQScreen = () => {
  const navigation = useNavigation();

  const faqData = [
    {
      question: "Apa itu Saraya?",
      answer:
        "Saraya adalah platform pendidikan keuangan yang dirancang khusus untuk pengusaha wanita di Indonesia. Kami menawarkan pengalaman belajar yang terintegrasi dengan gamifikasi untuk meningkatkan literasi keuangan dan keterampilan bisnis Anda.",
    },
    {
      question: "Bagaimana Saraya bisa membantu saya meningkatkan pendapatan?",
      answer:
        "Saraya membantu Anda menguasai keterampilan keuangan dasar seperti penganggaran, menabung, dan berinvestasi, yang dapat membantu Anda mengelola uang dengan lebih baik dan meningkatkan pendapatan bisnis Anda. Selain itu, kami juga menyediakan tips dan strategi untuk mempromosikan produk Anda secara efektif.",
    },
    {
      question:
        "Apakah saya perlu memiliki latar belakang bisnis untuk menggunakan Saraya?",
      answer:
        "Tidak, Saraya dirancang untuk semua tingkat keahlian, baik Anda baru memulai maupun sudah berpengalaman. Materi kami mudah dipahami dan interaktif, sehingga Anda bisa belajar dengan nyaman dan efektif.",
    },
    {
      question: "Bagaimana cara kerja gamifikasi di Saraya App?",
      answer:
        "Saraya menggunakan elemen gamifikasi seperti poin, lencana, dan tantangan untuk membuat proses belajar menjadi lebih menyenangkan dan memotivasi. Setiap pencapaian Anda akan diberikan penghargaan yang dapat memotivasi Anda untuk terus belajar.",
    },
    {
      question: "Apakah Saraya hanya untuk UMKM wanita?",
      answer:
        "Saraya dirancang khusus untuk memberdayakan UMKM perempuan, tetapi saraya juga dapat digunakan oleh siapapun dari berbagai latar belakang.",
    },
    {
      question: "Bagaimana Saraya mempersonalisasi pengalaman belajar saya?",
      answer:
        "Saraya menggunakan teknologi AI untuk menganalisis kemajuan dan preferensi belajar Anda. Berdasarkan data ini, kami menawarkan rekomendasi kursus dan materi yang sesuai dengan kebutuhan dan tujuan Anda.",
    },
    {
      question: "Apa yang membedakan Saraya dari platform edukasi lainnya?",
      answer:
        "Saraya khusus dirancang untuk pengusaha wanita di Indonesia, dengan fokus pada gamifikasi dan personalisasi untuk membuat proses belajar lebih menyenangkan dan efektif. Kami juga menyediakan komunitas pendukung yang kuat untuk membantu Anda tumbuh dan berkembang.",
    },
    {
      question: "Apakah ada uji coba gratis untuk paket premium?",
      answer:
        "Kami menawarkan uji coba gratis untuk paket premium untuk pelanggan baru. Periksa situs web kami secara berkala untuk mengetahui promosi terbaru.",
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <LinearGradient colors={["#BB1624", "#FCFCFCFF"]} style={tw`flex-1`}>
        <ScrollView style={tw`p-4 mb-12`}>
          <TouchableOpacity
            style={tw`mb-3`}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-2xl font-bold text-gray-200 mb-2`}>
            Frequently Asked Questions
          </Text>
          <Text style={tw`text-gray-300 text-sm mb-4`}>
            Pertanyaan yang sering diajukan tentang produk dan layanan kami.
          </Text>
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FAQScreen;
