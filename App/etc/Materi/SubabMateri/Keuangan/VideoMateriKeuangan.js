import React, { useRef, useState, useEffect } from "react";
import { Text, View, StatusBar, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video } from "expo-av";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from '../../../../../firebase'; // Sesuaikan path jika perlu
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const reactMateriKeuangan = [
  {
    Judul: "Lorem ipsum dolor sit amet",
    subJudul: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    subBabJudul: "Sed ut perspiciatis unde omnis iste natus error:",
    Poin: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
      "sunt in culpa qui officia deserunt mollit anim id est laborum."
    ]
  },
  {
    Judul: "Dolor sit Amet",
    Poin: [
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident",
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
    ]
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
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userDocRef, {
            completedModules: arrayUnion(3)
          });
          console.log("Modul berhasil ditambahkan ke daftar penyelesaian");
        } catch (error) {
          console.error("Gagal memperbarui status modul:", error);
        }
      }
      navigation.navigate('kuisLaporanKeuangan');
    } else {
      // Pindah ke materi berikutnya dan reset scrollProgress ke 0
      setCurrentMateriIndex(currentMateriIndex + 1);
      setScrollProgress(0);  // Reset scroll progress saat pindah ke materi berikutnya
    }
  };

  const handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollY = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    const currentProgress = (scrollY / (contentHeight - scrollViewHeight)) * 100;
    setScrollProgress(currentProgress);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Bar */}
      <View style={tw`flex-row justify-between w-full h-1.5 mt-4 px-2`}>
        <View style={tw`flex-row w-full h-full`}>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} >
            <View style={tw`absolute left-0 h-full bg-red-600 rounded-full w-full`} />
          </View>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} >
            <View style={tw`absolute left-0 h-full bg-red-600 rounded-full w-full`} />
          </View>
          <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} >
            {/* Progress bar dinamis pada view Lesson 1 */}
            <View
              style={[
                tw`absolute left-0 h-full bg-red-600 rounded-full`,
                { width: `${scrollProgress}%` }
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
        <Text style={tw`text-lg font-bold ml-2`}>Lesson 1</Text>
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
          Lorem Ipsum
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
            <Text style={tw`flex-1 text-justify text-gray-600`}>
              {poin}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={tw`bg-gray-600 p-2 rounded-full items-center mt-6`}
          onPress={handleNext}
        >
          <Text style={tw`text-white text-base`}>
            {currentMateriIndex === reactMateriKeuangan.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DasarKeuangan;

//const VideoMateriKeuangan = () => {
//  const videoRef = useRef(null);
//  const [isPlaying, setIsPlaying] = useState(false);
//  const [progress, setProgress] = useState(0);
//  const [currentTime, setCurrentTime] = useState(0);
//  const [duration, setDuration] = useState(0);
//  const screenHeight = Dimensions.get("window").height;
//  const screenWidth = Dimensions.get("window").width;
//  const navigation = useNavigation();
//
//  useEffect(() => {
//    const interval = setInterval(() => {
//      if (videoRef.current) {
//        videoRef.current.getStatusAsync().then((status) => {
//          if (status.isLoaded && status.durationMillis > 0) {
//            setProgress((status.positionMillis / status.durationMillis) * 100);
//            setCurrentTime(status.positionMillis);
//            setDuration(status.durationMillis);
//          }
//        });
//      }
//    }, 500);
//
//    return () => clearInterval(interval);
//  }, []);
//
//  const togglePlayPause = async () => {
//    if (videoRef.current) {
//      const status = await videoRef.current.getStatusAsync();
//      if (status.isPlaying) {
//        await videoRef.current.pauseAsync();
//        setIsPlaying(false);
//      } else {
//        await videoRef.current.playAsync();
//        setIsPlaying(true);
//      }
//    }
//  };
//
//  // Handler ketika video selesai diputar
//  const onPlaybackStatusUpdate = async (status) => {
//    if (status.didJustFinish && !status.isLooping) {
//      // Perbarui data pengguna di Firestore untuk menandai modul 1 sebagai selesai
//      const user = auth.currentUser;
//      if (user) {
//        const userRef = doc(db, 'users', user.uid);
//        try {
//          await updateDoc(userRef, {
//            completedModules: arrayUnion(1), // Asumsikan id modul adalah 1
//          });
//          console.log('Modul 1 telah diselesaikan');
//        } catch (error) {
//          console.error('Error updating user data:', error);
//        }
//      }
//      // Navigasi ke video berikutnya
//      navigation.navigate('roadmap');
//    }
//  };
//
//  // Fungsi format waktu
//  const formatTime = (timeMillis) => {
//    const minutes = Math.floor(timeMillis / 1000 / 60);
//    const seconds = Math.floor((timeMillis / 1000) % 60);
//    return `${minutes.toString().padStart(2, "0")}:${seconds
//      .toString()
//      .padStart(2, "0")}`;
//  };
//
//  const onSeek = async (value) => {
//    const seekPosition = (value / 100) * duration;
//    await videoRef.current.setPositionAsync(seekPosition);
//  };
//
//  return (
//    <SafeAreaView style={tw`flex-1 bg-black`}>
//      <View style={{ height: screenHeight }}>
//        <Video
//          ref={videoRef}
//          source={require("../../../../assets/moduleVideo/module1/video1_module_1.mp4")}
//          style={{ height: screenHeight, width: screenWidth }}
//          resizeMode="cover"
//          onError={(error) => console.error("Video Error:", error)}
//          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//        />
//
//        <View
//          style={tw`absolute flex-row justify-between w-full h-1.5 mt-4 px-2`}
//        >
//          {/* Static background bars */}
//          <View style={tw`flex-row w-full h-full`}>
//            <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} >
//              <View
//                style={[
//                  tw`absolute left-0 h-full bg-red-600 rounded-full`,
//                  { width: `${progress }%`, maxWidth: "100%" },
//                ]}
//              />
//            </View>
//            <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} />
//            <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} />
//            <View style={tw`flex-1 bg-gray-300 mx-1 rounded-full`} />
//          </View>
//          {/* Moving red progress bar */}
//        </View>
//
//        {/* Play/Pause button on top of the video */}
//
//        {/* Slider and time controls under the video */}
//        <View style={tw`absolute bottom-24 left-0 right-0 px-4`}>
//          {/* Time display */}
//          <View style={tw`flex-row justify-between mb-2 `}>
//            <Text style={tw`text-white`}>{formatTime(currentTime)}</Text>
//            <Text style={tw`text-white`}>{formatTime(duration)}</Text>
//          </View>
//
//          {/* Slider */}
//          <Slider
//            minimumValue={0}
//            maximumValue={100}
//            value={progress}
//            onSlidingComplete={onSeek}
//            minimumTrackTintColor="#BB1624"
//            maximumTrackTintColor="#E0E0E0"
//            thumbTintColor="#BB1624"
//            style={tw`w-full`}
//          />
//          <View
//            style={tw`absolute top-0 left-0 right-0 items-start ml-7 mt-12`}
//          >
//            <TouchableOpacity
//              onPress={togglePlayPause}
//              style={tw`flex-row items-center bg-red-600 py-2 px-4 rounded-lg`}
//            >
//              <Ionicons
//                name={isPlaying ? "pause" : "play"}
//                size={16}
//                color="white"
//              />
//              <Text style={tw`text-white text-xs ml-2`}>
//                {isPlaying ? "Pause" : "Play"}
//              </Text>
//            </TouchableOpacity>
//          </View>
//        </View>
//      </View>
//    </SafeAreaView>
//  );
//};
//
//export default VideoMateriKeuangan;

