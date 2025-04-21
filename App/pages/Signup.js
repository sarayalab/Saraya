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
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  getAuth
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "react-native-vector-icons";
import tw from "twrnc";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        "826074449604-mhj0b3a9ioesmgq8rshf57a7li03hh0c.apps.googleusercontent.com",
      webClientId:
        "826074449604-li4cosq2noi1pa937keonond1f2ssapa.apps.googleusercontent.com",
    });
  }, []);

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
            hasCompletedSurvey: false,
            coursesJoined: [1],
            completedModules: [],
            currentModule: {
              id: 0,
              status: "in-progress"
            },
            moduleStatus: {
              "0": "in-progress"  // Ensure first module is unlocked
            },
            lastAccessedModule: 0,
            xp: 0,
            coins: 0,
            dailyXP: 0,
            dailyXPDate: new Date().toDateString(),
            dailyChallengeClaimedDate: null,
            dailyChallenges: {
              quizCompleted: false,
              xpEarned: false,
              streak: 0,
            },
            createdAt: new Date().toISOString(),
          });

          console.log("User data saved successfully");
          
          // Navigate to survey page
          navigation.replace("bisnisSurvey");
        } catch (error) {
          Alert.alert("Registration Failed", error.message);
        }
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsSubmitting(true);
      const response = await GoogleSignin.signIn();
      const idToken = response.data.idToken;
      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential).then(async (userGoogleSigninCredential) => {
        const user = userGoogleSigninCredential.user;
        const userUid = user.uid;

        // Check if the user already exists in Firestore
        const userDocRef = doc(db, "users", userUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // User doesn't exist, create new user in Firestore
          await setDoc(doc(db, "users", userUid), {
            fullname: user.displayName || "Google User",
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            scores: {},
            role: "user",
            hasCompletedSurvey: false,
            coursesJoined: [1],
            completedModules: [],
            currentModule: {
              id: 0,
              status: "in-progress"
            },
            moduleStatus: {
              "0": "in-progress"  // Ensure first module is unlocked
            },
            lastAccessedModule: 0,
            xp: 0,
            coins: 0,
            dailyXP: 0,
            dailyXPDate: new Date().toDateString(),
            dailyChallengeClaimedDate: null,
            dailyChallenges: {
              quizCompleted: false,
              xpEarned: false,
              streak: 0,
            },
            createdAt: new Date().toISOString(),
          });

          console.log("User data saved successfully");
          
          // Navigate to survey page
          navigation.replace("bisnisSurvey");
        } else {
          // User already exists, check if they've completed the survey
          const userData = userDoc.data();
          if (userData.hasCompletedSurvey) {
            navigation.replace("MainApp");
          } else {
            navigation.replace("bisnisSurvey");
          }
        }
      }).catch((error) => {
        console.error("Error signing in with Google", error);
        Alert.alert("Error", "Failed to sign in with Google");
      });

    } catch (error) {
      console.error(error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.ONE_TAP_START_FAILED:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
            console.log("Something else happened during Google Sign-In");
            break;
        }
      } else {
        console.log("Error not related to Google sign-in occurred", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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