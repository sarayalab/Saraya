import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { ProgressBar } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const VentureCapital = () => {
  const [progress, setProgress] = useState(0);
  const [modules, setModules] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const storedModules = await AsyncStorage.getItem("modules");
      if (storedModules !== null) {
        setModules(JSON.parse(storedModules));
        setProgress(calculateProgress(JSON.parse(storedModules)));
      } else {
        setModules([
          {
            id: 1,
            moduleTitle: "Fundamentals for Startup Success",
            moduleDuration: "30 minutes",
            lessons: [
              {
                id: 1,
                title: "Lesson 1 - Identifying the Need: Market Research Essentials",
                type: "Video",
                completed: true,
              },
              {
                id: 2,
                title: "Lesson 2 - Building a Solid Business Model Canvas",
                type: "Video",
                completed: true,
              },
              { id: 3, title: "Lesson 3", type: "Materi", completed: false },
              { id: 4, title: "Lesson 4", type: "Quiz", completed: false },
            ],
          },
          {
            id: 2,
            moduleTitle: "Crafting the Perfect Investor Pitch Guide",
            moduleDuration: "40 minutes",
            lessons: [
              {
                id: 1,
                title: "Lesson 1 - Perfecting Your Business Pitch",
                type: "Video",
                completed: true,
              },
              {
                id: 2,
                title: "Lesson 2 - Building Investor Relations",
                type: "Video",
                completed: true,
              },
              { id: 3, title: "Lesson 3", type: "Materi", completed: false },
              { id: 4, title: "Lesson 4", type: "Quiz", completed: false },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveModules = async (updatedModules) => {
    try {
      await AsyncStorage.setItem("modules", JSON.stringify(updatedModules));
    } catch (error) {
      console.error("Failed to save modules:", error);
    }
  };

  const calculateProgress = (updatedModules) => {
    const totalLessons = updatedModules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );
    const completedLessons = updatedModules.reduce(
      (sum, module) =>
        sum + module.lessons.filter((lesson) => lesson.completed).length,
      0
    );
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const toggleLessonCompletion = (moduleId, lessonId) => {
    const updatedModules = modules.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, completed: !lesson.completed }
              : lesson
          ),
        };
      }
      return module;
    });

    setModules(updatedModules);
    setProgress(calculateProgress(updatedModules));
    saveModules(updatedModules); 
  };

  const navigationMap = {
    1: { 
      1: 'videoKeuangan', 
      2: 'videoKeuanganII', 
      3: 'dasarKeuangan', 
      4: 'kuisLaporanKeuangan', 
    },
    2: { // Module 2
      1: 'PitchLesson', // Lesson 1
      2: 'InvestorRelationsLesson', // Lesson 2
      3: 'AttachmentLesson', // Lesson 3
      4: 'PitchQuizLesson', // Lesson 4
    },
    // Add more modules and lessons if necessary
  };

  const handleLessonPress = (moduleId, lessonId) => {
    const targetPage = navigationMap[moduleId]?.[lessonId];
    if (targetPage) {
      navigation.navigate(targetPage, { lesson: modules[moduleId - 1].lessons[lessonId - 1] });
    } else {
      console.error('Target page not found for this module and lesson.');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      <View style={tw`relative mb-5`}>
        <Image
          source={require("../../../assets/AkunPage/Promotion2.png")}
          style={tw`w-full h-65`}
          resizeMode="stretch"
        />
        <View style={tw`absolute bottom-0 left-0 right-0 p-5`}>
          <View style={tw`flex-row items-center mt-5 mb-2`}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={tw`flex-row items-center justify-between px-5 `}>
            <Image
              source={require("../../../assets/coursesPage/undraw_online_learning.png")}
              style={tw`w-35 h-35`} 
              resizeMode="contain"
            />
            <View style={tw`flex-1 ml-4`}>
              <Text style={tw`text-xl text-white`}>
                Introduction of Venture Capital
              </Text>
              <Text style={tw`text-white text-xs mt-2`}>
                4 Modules
              </Text>
              <View style={tw`mt-2`}>
                <Text style={tw`text-white text-base`}>
                  Complete {progress}%
                </Text>
                <ProgressBar
                  progress={progress / 100}
                  color="#BB1624"
                  style={tw`h-2 mt-2`} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`p-5`}>
        {modules.map((module, moduleIndex) => (
          <View
            key={module.id}
            style={tw`bg-white rounded-xl p-4 shadow-lg mb-5`}
          >
            <View style={tw`flex-row justify-between mb-4`}>
              <View>
                <Text style={tw`text-base font-bold`}>{`Module ${
                  moduleIndex + 1
                }`}</Text>
                <Text
                  style={tw`text-sm font-bold`}
                >{`${module.moduleTitle}`}</Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {module.moduleDuration}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#BB1624" />
            </View>

            {module.lessons.map((lesson, lessonIndex) => (
              <View key={lesson.id} style={tw`flex-row items-start mb-4`}>
                <View style={tw`items-center`}>
                  <View
                    style={tw`w-4 h-4 rounded-full ${
                      lesson.completed ? "bg-[#BB1624]" : "bg-gray-300"
                    } mb-2`}
                  />
                  {lessonIndex < module.lessons.length - 1 && (
                    <View style={tw`w-0.5 flex-1 bg-gray-300`} />
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleLessonPress(module.id, lesson.id)}
                  style={tw`ml-4 flex-1`}
                >
                  <Text style={tw`font-bold text-xs`}>{lesson.title}</Text>
                  <Text style={tw`text-gray-500 text-xs`}>{lesson.type}</Text>
                </TouchableOpacity>

                <Ionicons
                  name={
                    lesson.completed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={24}
                  color={lesson.completed ? "#BB1624" : "gray"}
                  onPress={() => toggleLessonCompletion(module.id, lesson.id)}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VentureCapital;
