import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "react-native-vector-icons";
import tw from "twrnc";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const register = async () => {
    if (
      fullname === "" ||
      email === "" ||
      password === "" ||
      phoneNumber === ""
    ) {
      Alert.alert("Invalid Details", "Please fill all the details");
    } else {
      if (password.length < 6) {
        Alert.alert(
          "Invalid Password",
          "Password should be at least 6 characters long"
        );
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;
          const myUserUid = user.uid;
          // Menyimpan data pengguna baru ke Firestore dengan status survei dan modul awal
          await setDoc(doc(db, "users", myUserUid), {
            fullname: fullname,
            email: email,
            phoneNumber: phoneNumber,
            scores: {},
            role: "user",
            hasCompletedSurvey: false, // Tambahkan status survei bisnis
            coursesJoined: [1], // Otomatis tambahkan modul "Dasar Keuangan Bisnis" (ID = 1)
            createdAt: new Date().toISOString(),
          });

          console.log("User data saved successfully");

          // Periksa apakah pengguna sudah menyelesaikan survei bisnis
          const userDocRef = doc(db, "users", myUserUid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().hasCompletedSurvey === false) {
            // Jika belum, arahkan ke halaman survei bisnis
            navigation.replace("bisnisSurvey");
          } else {
            // Jika sudah, arahkan ke halaman utama aplikasi
            navigation.replace("MainApp");
          }
        } catch (error) {
          Alert.alert("Registration Failed", error.message);
        }
      }
    }
  };

  const signInWithGoogle = async () => {};

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <StatusBar />
        <TouchableOpacity style={tw`ml-6`} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#787879" />
        </TouchableOpacity>

        <KeyboardAvoidingView style={tw`flex-1`}>
          <View style={tw`absolute top-0 left-0 right-0`}></View>
          <View style={tw`mt-40`}>
            <Image
              source={require("./../assets/SignUpPage/Group108.png")}
              style={tw`h-20 w-20 self-center -mt-16`}
            />
            <View>
              <Text style={tw`text-center text-2xl text-gray-700 mb-6`}>
                Sign Up
              </Text>
            </View>

            <Text style={tw`text-sm text-gray-700 ml-12 mb-2`}>
              Daftar akun Anda
            </Text>

            <TextInput
              style={tw`mx-12 mt-1 mb-2 p-2 border border-gray-400 rounded-lg`}
              placeholder="Nama Lengkap"
              onChangeText={(text) => setFullname(text)}
              autoFocus
            />

            <TextInput
              style={tw`mx-12 mt-1 mb-2 p-2 border border-gray-400 rounded-lg`}
              placeholder="Alamat Email"
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
            />

            <TextInput
              style={tw`mx-12 mt-1 mb-2 p-2 border border-gray-400 rounded-lg`}
              placeholder="Nomor Handphone"
              onChangeText={(text) => setPhoneNumber(text)}
              keyboardType="phone-pad"
              KeyboardAvoidingView
            />

            <View
              style={tw`flex-row mx-12 mt-1 mb-2 p-2 border border-gray-400 rounded-lg`}
            >
              <TextInput
                style={tw`flex-1`}
                placeholder="Password"
                secureTextEntry={secureTextEntry}
                onChangeText={(text) => setPassword(text)}
                KeyboardAvoidingView
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={tw`self-center`}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={20}
                  color="darkgrey"
                />
              </TouchableOpacity>
            </View>

            <Pressable
              style={tw`bg-red-700 p-3 mx-12 my-2 rounded-full shadow-lg`}
              onPress={register}
            >
              <Text style={tw`text-white text-center text-sm`}>Daftar</Text>
            </Pressable>

            <View style={tw`flex-col flex items-center justify-center`}>
              <Text style={tw`text-center text-gray-600 my-2 text-xs`}>
                atau
              </Text>
              <Pressable
                style={tw`flex-row items-center justify-center bg-white border border-gray-400 mt-2 p-2 w-70 rounded-lg shadow-lg`}
                onPress={signInWithGoogle}
              >
                <Image
                  source={require("./../assets/google-logo.webp")}
                  style={tw`w-4 h-4 mr-2`}
                />
                <Text style={tw`text-sm text-gray-700`}>
                  Daftar dengan Google
                </Text>
              </Pressable>
              <Pressable
                style={tw`flex-row items-center justify-center bg-white border border-gray-400 mt-2 p-2 w-70 rounded-lg shadow-lg`}
                onPress={signInWithGoogle}
              >
                <Image
                  source={require("./../assets/LoginPage/fb.png")}
                  style={tw`w-4 h-4 mr-2`}
                />
                <Text style={tw`text-sm text-gray-700`}>
                  Masuk dengan Facebook
                </Text>
              </Pressable>
            </View>

            <View style={tw`flex-row justify-center my-4`}>
              <Text style={tw`text-xs`}>Sudah punya akun?</Text>
              <Text
                style={tw`text-blue-700 ml-1 text-xs`}
                onPress={() => navigation.navigate("signin")}
              >
                Masuk
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
