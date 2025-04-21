import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  Pressable 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHandler } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail, getRedirectResult, signInWithCredential } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import tw from 'twrnc';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
  isSuccessResponse
} from "@react-native-google-signin/google-signin";
import { ResponseType } from 'expo-auth-session';

export const addMaterialXP = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const today = new Date().toDateString();
      
      // Update daily XP
      const currentDailyXP = userData.dailyXP?.value || 0;
      const newDailyXP = currentDailyXP + 10;
      
      // Update total XP
      const currentTotalXP = userData.xp || 0;
      const newTotalXP = currentTotalXP + 10;
      
      await updateDoc(userDocRef, {
        xp: newTotalXP,
        dailyXP: {
          date: today,
          value: newDailyXP
        }
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding material XP:", error);
    return false;
  }
};

export const addQuizXP = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const today = new Date().toDateString();
      
      // Update daily XP
      const currentDailyXP = userData.dailyXP?.value || 0;
      const newDailyXP = currentDailyXP + 30;
      
      // Update total XP
      const currentTotalXP = userData.xp || 0;
      const newTotalXP = currentTotalXP + 30;
      
      await updateDoc(userDocRef, {
        xp: newTotalXP,
        dailyXP: {
          date: today,
          value: newDailyXP
        }
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding quiz XP:", error);
    return false;
  }
};

/*TODO */
// CREATE MODULE EXPORT FROM SIGN UP TO USE IT AS A METHOD TO SIGN UP FIRS TIME GOOGLE USER
// CREATE A FUNCTION THAT TAKES GOOGLE SIGN IN CREDENTIALS FROM FIREBASE AND COMPARE IT TO THE EXISTING, IF YES DON'T SIGN UP

export default function Signin() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemembered, setIsRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  // Google sign in const, check if error [De]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [termsCheck, setTermsCheck] = useState(false);
  

  // Google Auth Provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '826074449604-8uch1c7pi1kik3vptf5kq1nqnupimea5.apps.googleusercontent.com',
    // iosClientId: '826300876657-lk3bji4sc7sj7i7iptdcs5eqehnmkbg7.apps.googleusercontent.com', // Jika Anda menggunakan iOS
    expoClientId: '826300876657-lk3bji4sc7sj7i7iptdcs5eqehnmkbg7.apps.googleusercontent.com', // Jika menggunakan Expo Go
  });
  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
      "826074449604-mhj0b3a9ioesmgq8rshf57a7li03hh0c.apps.googleusercontent.com",
      webClientId:
      "826074449604-li4cosq2noi1pa937keonond1f2ssapa.apps.googleusercontent.com",
    });
    setLoading(true);

    const backAction = () => {
      Alert.alert(
        "Keluar Aplikasi",
        "Apakah Anda yakin ingin keluar dari aplikasi?",
        [
          {
            text: "Tidak",
            onPress: () => null,
            style: "cancel"
          },
          { 
            text: "Ya", 
            onPress: () => BackHandler.exitApp() 
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    const checkAutoLogin = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');
        
        if (savedEmail && savedPassword) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
            const user = userCredential.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists() && userDoc.data().hasCompletedSurvey) {
              navigation.replace("MainApp");
            } else {
              navigation.replace("bisnisSurvey");
            }
          } catch (error) {
            console.log('Auto login failed:', error);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log('Error checking auto login:', error);
        setLoading(false);
      }
    };

    checkAutoLogin();

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

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
    } catch (error) {
      console.log('Failed to save credentials', error);
    }
  };

  const removeCredentials = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
    } catch (error) {
      console.log('Failed to remove credentials', error);
    }
  };

  const login = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter both email and password.", [{ text: "OK" }]);
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
  
        // Ensure first module is always in-progress
        if (!userData.currentModule || userData.currentModule.id !== 0) {
          await updateDoc(userDocRef, {
            currentModule: {
              id: 0,
              status: "in-progress"
            },
            moduleStatus: {
              "0": "in-progress"
            },
            coursesJoined: userData.coursesJoined || [1],
            lastAccessedModule: 0
          });
        }
  
        navigation.replace("MainApp");
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "Account not found.", [{ text: "OK" }]);
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Wrong password. Please try again.", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", error.message, [{ text: "OK" }]);
      }
    }
  };

  const resetPassword = () => {
    if (email === "") {
      Alert.alert("Error", "Please enter your email address.", [{ text: "OK" }]);
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

const handlegoogleSignIn = async () => {
  try {
    const auth = getAuth();
    const response = await GoogleSignin.signIn();
    const idToken = response.data.idToken;
    console.log("idToken", idToken);
    const credential = GoogleAuthProvider.credential(idToken);

    signInWithCredential(auth, credential).then(async (userGoogleSigninCredential) => {
      const user = userGoogleSigninCredential.user;
      const userUid = user.uid;
      console.log("userUid", userUid);
      console.log('User sign in success', user.email);

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
          createdAt: new Date().toISOString(),
        });

        console.log("User data saved successfully");
        
        // Navigate to survey for new users
        navigation.replace("bisnisSurvey");
      } else {
        // User exists, check if they've completed the survey
        const userData = userDoc.data();
        if (!userData.hasCompletedSurvey) {
          navigation.replace("bisnisSurvey");
        } else {
          // User exists and has completed survey, go to main app
          navigation.replace("MainApp");
        }
      }
    }).catch((error) => {
      console.error("Error signing in with Google", error);
    });

  } catch (error) {
    console.error(error);
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.ONE_TAP_START_FAILED:
          // Handle rate limiting for Google One Tap
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Handle Google Play Services error
          break;
        default:
          // Handle other errors
          console.log("Something else happened during Google Sign-In");
          break;
      }
    } else {
      console.log("Error not related to Google sign-in occurred", error);
    }
  }
};

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView>
        <StatusBar />
        <Image source={require("./../assets/SignUpPage/Group108.png")} style={tw`h-20 w-20 self-center mt-20`} />
        <View style={tw`items-center mt-2`}>
          <Text style={tw`text-2xl font-bold text-gray-700 mb-6`}>Let's Sign In</Text>
          <Text style={tw`text-sm text-gray-700`}>Masuk ke Akun Anda</Text>
        </View>
        <TextInput
          style={tw`mx-12 mt-2 p-2 border border-gray-400 rounded-lg`}
          value={email}
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
        />
        <View style={tw`flex-row items-center mx-12 mt-2 p-2 border border-gray-400 rounded-lg`}>
          <TextInput
            style={tw`flex-1`}
            value={password}
            placeholder="Password"
            secureTextEntry={secureTextEntry}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={tw`ml-2 justify-center`}>
            <Ionicons name={secureTextEntry ? "eye-off" : "eye"} size={20} color="grey" />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between mx-12 mt-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={toggleRememberMe}>
              <Ionicons name={isRemembered ? "checkbox" : "checkbox-outline"} size={16} color="#BB1624" />
            </TouchableOpacity>
            <Text style={tw`ml-2 text-xs text-gray-600`}>Ingat Saya</Text>
          </View>
          <TouchableOpacity onPress={resetPassword}>
            <Text style={tw`text-xs text-blue-600`}>Lupa Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={tw`bg-red-700 h-10 mx-12 mt-8 rounded-xl justify-center items-center shadow-lg`} onPress={login}>
          <Text style={tw`text-white font-bold text-sm`}>Masuk</Text>
        </TouchableOpacity>
        <View style={tw`items-center mt-2`}>
          <Text style={tw`text-gray-600 text-xs`}>atau</Text>
          <Pressable style={tw`flex-row items-center justify-center bg-white border border-gray-400 mt-2 p-2 w-70 rounded-lg shadow-lg`} onPress={handlegoogleSignIn} disabled={isSubmitting}>
            <Image source={require("./../assets/google-logo.webp")} style={tw`w-4 h-4 mr-2`} />
            <Text style={tw`text-sm text-gray-700`}>Masuk dengan Google</Text>
          </Pressable>
        </View>
        <View style={tw`flex-row justify-center mt-2`}>
          <Text style={tw`text-xs`}>Belum punya akun? </Text>
          <Text style={tw`text-xs text-blue-600`} onPress={() => navigation.navigate("signup")}>Daftar</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

