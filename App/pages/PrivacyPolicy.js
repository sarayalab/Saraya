import React from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { AntDesign } from "@expo/vector-icons";

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`mx-4 mt-4`}>
        <View style={tw`flex-row items-center justify-between`}>
          <AntDesign name="arrowleft" size={24} color="black" onPress={() => navigation.goBack()} />
          <Text style={tw`text-xl font-bold mb-4`}>Kebijakan Privasi</Text>
        </View>
      </View>

      <ScrollView style={tw`mx-4 mb-6`}>
        <Text style={tw`text-lg font-bold mt-4`}>1. Pengumpulan dan Penggunaan Informasi</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Aplikasi Saraya mengumpulkan informasi pribadi untuk menyediakan dan meningkatkan layanan:
        </Text>
        <Text style={tw`text-sm text-gray-700 mt-2`}>- Nama: Untuk personalisasi pengalaman pengguna.</Text>
        <Text style={tw`text-sm text-gray-700`}>- Alamat Email: Untuk pembuatan akun dan komunikasi.</Text>
        <Text style={tw`text-sm text-gray-700`}>- Nomor Telepon: Untuk verifikasi dan keperluan kontak.</Text>
        <Text style={tw`text-sm text-gray-700`}>- Foto: Untuk profil pengguna atau fitur unggahan.</Text>

        <Text style={tw`text-lg font-bold mt-4`}>2. Penyimpanan dan Akses</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Data disimpan secara aman di Firebase untuk autentikasi dan pengelolaan informasi pengguna.
          Kami menerapkan kontrol akses yang ketat guna melindungi data dari akses tidak sah.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>3. Berbagi Informasi</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Kami tidak membagikan informasi pribadi Anda kecuali dengan izin eksplisit atau untuk memenuhi kewajiban hukum.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>4. Kontrol atas Data Anda</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Pengguna dapat mengakses, memperbarui, atau menghapus informasi mereka kapan saja melalui pengaturan Aplikasi
          atau dengan menghubungi sarayanusantara@gmail.com.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>5. Keamanan Informasi</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Kami menggunakan langkah-langkah keamanan fisik, elektronik, dan prosedural untuk melindungi informasi Anda.
          Namun, tidak ada metode transmisi atau penyimpanan yang sepenuhnya aman.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>6. Perubahan Kebijakan Privasi</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Kebijakan ini dapat diperbarui sewaktu-waktu. Kami akan memberi tahu Anda tentang perubahan melalui pembaruan halaman ini.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>7. Persetujuan Anda</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify`}>
          Dengan menggunakan Aplikasi, Anda menyetujui pemrosesan informasi sesuai dengan Kebijakan Privasi ini.
        </Text>

        <Text style={tw`text-lg font-bold mt-4`}>8. Hubungi Kami</Text>
        <Text style={tw`text-sm text-gray-700 mt-2 text-justify mb-8`}>
          Jika ada pertanyaan tentang kebijakan privasi, hubungi kami di sarayanusantara@gmail.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
