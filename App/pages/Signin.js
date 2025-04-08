import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import tw from "twrnc";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemembered, setIsRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  // Google Auth Provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "826300876657-lk3bji4sc7sj7i7iptdcs5eqehnmkbg7.apps.googleusercontent.com",
    iosClientId:
      "826300876657-lk3bji4sc7sj7i7iptdcs5eqehnmkbg7.apps.googleusercontent.com", // Jika Anda menggunakan iOS
    expoClientId:
      "826300876657-lk3bji4sc7sj7i7iptdcs5eqehnmkbg7.apps.googleusercontent.com", // Jika menggunakan Expo Go
  });
  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  useEffect(() => {
    setLoading(true);

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        setLoading(false);
      } else {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().hasCompletedSurvey) {
          navigation.replace("MainApp");
        } else {
          navigation.replace("bisnisSurvey");
        }
      }
    });

    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("userEmail");
        const savedPassword = await AsyncStorage.getItem("userPassword");
        if (savedEmail !== null && savedPassword !== null) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setIsRemembered(true);
        }
      } catch (error) {
        console.log("Failed to load credentials", error);
      }
    };

    loadCredentials();

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userPassword", password);
    } catch (error) {
      console.log("Failed to save credentials", error);
    }
  };

  const removeCredentials = async () => {
    try {
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("userPassword");
    } catch (error) {
      console.log("Failed to remove credentials", error);
    }
  };

  const login = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter both email and password.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (isRemembered) {
        saveCredentials(email, password);
      } else {
        removeCredentials();
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Periksa apakah modul "Dasar Keuangan Bisnis" sudah ditambahkan
        if (!userData.coursesJoined || !userData.coursesJoined.includes(1)) {
          await updateDoc(userDocRef, {
            coursesJoined: userData.coursesJoined
              ? [...userData.coursesJoined, 1]
              : [1], // Jika coursesJoined belum ada, buat array baru
          });
          console.log(
            "Modul 'Dasar Keuangan Bisnis' ditambahkan ke akun pengguna."
          );
        }

        if (userData.hasCompletedSurvey) {
          navigation.replace("MainApp");
        } else {
          navigation.replace("bisnisSurvey");
        }
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "Account not found.", [{ text: "OK" }]);
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Wrong password. Please try again.", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Error", error.message, [{ text: "OK" }]);
      }
    }
  };

  const resetPassword = () => {
    if (email === "") {
      Alert.alert("Error", "Please enter your email address.", [
        { text: "OK" },
      ]);
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Success", "Password reset email sent.", [{ text: "OK" }]);
      })
      .catch((error) => {
        Alert.alert("Error", error.message, [{ text: "OK" }]);
      });
  };

  const toggleRememberMe = () => {
    setIsRemembered(!isRemembered);
  };

  // Google Login
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      // Use Firebase signInWithCredential if needed here
    }
  }, [response]);

  const loginWithGoogle = () => {
    promptAsync();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView>
        <StatusBar />
        <TouchableOpacity style={tw`ml-6`} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#787879" />
        </TouchableOpacity>
        <Image
          source={require("./../assets/SignUpPage/Group108.png")}
          style={tw`h-20 w-20 self-center mt-20`}
        />
        <View style={tw`items-center mt-2`}>
          <Text style={tw`text-2xl font-bold text-gray-700 mb-6`}>
            Let's Sign In
          </Text>
          <Text style={tw`text-sm text-gray-700`}>Masuk ke Akun Anda</Text>
        </View>
        <TextInput
          style={tw`mx-12 mt-2 p-2 border border-gray-400 rounded-lg`}
          value={email}
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
        />
        <View
          style={tw`flex-row items-center mx-12 mt-2 p-2 border border-gray-400 rounded-lg`}
        >
          <TextInput
            style={tw`flex-1`}
            value={password}
            placeholder="Password"
            secureTextEntry={secureTextEntry}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={tw`ml-2 justify-center`}
          >
            <Ionicons
              name={secureTextEntry ? "eye-off" : "eye"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between mx-12 mt-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={toggleRememberMe}>
              <Ionicons
                name={isRemembered ? "checkbox" : "checkbox-outline"}
                size={16}
                color="#BB1624"
              />
            </TouchableOpacity>
            <Text style={tw`ml-2 text-xs text-gray-600`}>Ingat Saya</Text>
          </View>
          <TouchableOpacity onPress={resetPassword}>
            <Text style={tw`text-xs text-blue-600`}>Lupa Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={tw`bg-red-700 h-10 mx-12 mt-8 rounded-xl justify-center items-center shadow-lg`}
          onPress={login}
        >
          <Text style={tw`text-white font-bold text-sm`}>Masuk</Text>
        </TouchableOpacity>
        <View style={tw`items-center mt-2`}>
          <Text style={tw`text-gray-600 text-xs`}>atau</Text>
          <Pressable
            style={tw`flex-row items-center justify-center bg-white border border-gray-400 mt-2 p-2 w-70 rounded-lg shadow-lg`}
            onPress={loginWithGoogle}
          >
            <Image
              source={require("./../assets/google-logo.webp")}
              style={tw`w-4 h-4 mr-2`}
            />
            <Text style={tw`text-sm text-gray-700`}>Masuk dengan Google</Text>
          </Pressable>
        </View>
        <View style={tw`flex-row justify-center mt-2`}>
          <Text style={tw`text-xs`}>Belum punya akun? </Text>
          <Text
            style={tw`text-xs text-blue-600`}
            onPress={() => navigation.navigate("signup")}
          >
            Daftar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
