import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Start from "../pages/Start";
import Signup from "../pages/Signup";
import Main from "../pages/Main";
import Signin from "../pages/Signin";
import Akun from "../tabbottom/Akun";
import Tugas from "../tabbottom/Tugas";
import News from "../tabbottom/News";
import LaporanKeuangan from "../tabbottom/LaporanKeuangan";
import Question from "../etc/Question";
import Other from "../etc/Other";
import Edu from "../etc/Edu";
import Keuangan from "../etc/Materi/Keuangan";
import SosmedBranding from "../etc/Materi/SosmedBranding";
import Ads from "../etc/Materi/Ads";
import ReadNews from "../etc/ReadNews";
import Settings from "../etc/SetAccount/Settings";
import ChangePassword from "../etc/SetAccount/extra/ChangePassword";
import KuisLaporanKeuangan from "../etc/Kuis/KuisLaporanKeuangan";
import ScoreLaporanKeuangan from "../etc/Kuis/ScoreLaporanKeuangan";
import VideoMateriKeuangan from "../etc/Materi/SubabMateri/Keuangan/VideoMateriKeuangan";
import DasarKeuangan from "../etc/Materi/SubabMateri/Keuangan/DasarKeuangan";
import DasarSosmedBranding from "../etc/Materi/SubabMateri/SosmedBranding/DasarSosmedBranding";
import KuisSosmedBranding from "../etc/Materi/SubabMateri/SosmedBranding/KuisSosmedBranding";
import ScoreSosmedBranding from "../etc/Kuis/ScoreSosmedBranding";
import DasarAds from "../etc/Materi/SubabMateri/AdsIklan/DasarAds";
import VideoAds from "../etc/Materi/SubabMateri/AdsIklan/VideoAds";
import ScoreAdsIklan from "../etc/Kuis/ScoreAdsIklan";
import KuisAds from "../etc/Materi/SubabMateri/AdsIklan/KuisAds";
import AdminPanel from "../pages/AdminPanel";
import DetailMateri from "../etc/DetailMateri";
import ScoreDetail from "../etc/Kuis/ScoreDetail";
import TabBarIcon from "../Components/TabBarIcon";
import ProgramList from "../listCourses/ProgramList";
import KeuanganBisnis from "../listCourses/KeuanganBisnis";
import KonfirmKeuangan from "../listCourses/confirmClass/KonfirmKeuangan";
import BusinessSurvey from "../etc/bisnisSurvey/BusinessSurvey";
import InvestasiUsaha from "../listCourses/InvestasiUsaha";
import ProgramSaya from "../listCourses/myCourses/ProgramSaya";
import VentureCapital from "../listCourses/myCourses/module/VentureCapital";
import VideoMateriKeuanganII from "../etc/Materi/SubabMateri/Keuangan/VideoMateriKeuanganII";
import EditAccount from "../Services/EditAccount";
import ChangeLevel from "../listCourses/myCourses/changeLevel/ChangeLevel";
import AccordionScreen from "../etc/accordionPage/AccordionScreen";
import FondationI from "../etc/Kuis/level1/FondationI";
import TujuanKeuangan from "../etc/Kuis/level1/TujuanKeuangan";
import NilaiUang from "../etc/Kuis/level1/NilaiUang";
import AsetdanLiabilitas from "../etc/Kuis/level1/AsetdanLiabilitas";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import RoadmapScreen from "../features/roadmap/screens/RoadmapScreen";
import LessonScreen from "../features/roadmap/screens/LessonScreen";
import QuizScreen from "../features/roadmap/screens/QuizScreen";
import MyLessonScreen from "../features/roadmap/screens/MyLessonScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{ top: -30, justifyContent: "center", alignItems: "center" }}
    onPress={onPress}
  >
    <View
      style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: "#E3E3E3",
        backgroundColor: "#BB1624",
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

const UserNavigation = () => {
  const MainApp = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          style: {
            ...styles.shadow,
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 0,
            borderRadius: 15,
            height: 90,
          },
        }}
      >
        <Tab.Screen
          name="Main"
          component={Main}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon iconName="home" label="Beranda" focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="leaderboard"
          component={News}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                iconName="leaderboard"
                label="Leadboard"
                focused={focused}
              />
            ),
          }}
        />

        <Tab.Screen
          name="roadmap"
          component={RoadmapScreen}
          options={{
            tabBarIcon: () => (
              <MaterialCommunityIcons
                name="book-education-outline"
                size={34}
                color="#E3E3E3"
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />

        <Tab.Screen
          name="reward"
          component={Tugas}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon iconName="medal" label="Reward" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="akun"
          component={Akun}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                iconName="account-circle"
                label="Account"
                focused={focused}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: true }}
    >
      <Stack.Screen name="start" component={Start} />
      <Stack.Screen name="signup" component={Signup} />
      <Stack.Screen name="MainApp" component={MainApp} />
      <Stack.Screen name="signin" component={Signin} />
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="akun" component={Akun} />
      <Stack.Screen name="tugas" component={Tugas} />
      <Stack.Screen name="notification" component={Question} />
      <Stack.Screen name="other" component={Other} />
      <Stack.Screen name="edu" component={Edu} />
      <Stack.Screen name="news" component={News} />
      <Stack.Screen name="LaporanKeuangan" component={LaporanKeuangan} />
      <Stack.Screen name="Keuangan" component={Keuangan} />
      <Stack.Screen name="sosmed" component={SosmedBranding} />
      <Stack.Screen name="ads" component={Ads} />
      <Stack.Screen name="readnews" component={ReadNews} />
      <Stack.Screen name="settings" component={Settings} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen
        name="kuisLaporanKeuangan"
        component={KuisLaporanKeuangan}
      />
      <Stack.Screen name="kuisAds" component={KuisAds} />
      <Stack.Screen name="kuisSosmedBranding" component={KuisSosmedBranding} />
      <Stack.Screen
        name="scoreLaporanKeuangan"
        component={ScoreLaporanKeuangan}
      />
      <Stack.Screen
        name="scoreSosmedBranding"
        component={ScoreSosmedBranding}
      />
      <Stack.Screen name="scoreAdsIklan" component={ScoreAdsIklan} />
      <Stack.Screen name="videoKeuangan" component={VideoMateriKeuangan} />
      <Stack.Screen name="dasarKeuangan" component={DasarKeuangan} />
      <Stack.Screen name="dasarIklan" component={DasarAds} />
      <Stack.Screen name="dasarSosmed" component={DasarSosmedBranding} />
      <Stack.Screen name="videoAds" component={VideoAds} />
      <Stack.Screen name="adminPanel" component={AdminPanel} />
      <Stack.Screen name="detailMateri" component={DetailMateri} />
      <Stack.Screen name="detailScore" component={ScoreDetail} />
      <Stack.Screen name="programList" component={ProgramList} />
      <Stack.Screen name="keuanganProgram" component={KeuanganBisnis} />
      <Stack.Screen name="confirmkeuanganProgram" component={KonfirmKeuangan} />
      <Stack.Screen name="bisnisSurvey" component={BusinessSurvey} />
      <Stack.Screen name="investasiProgram" component={InvestasiUsaha} />
      <Stack.Screen name="myCourses" component={ProgramSaya} />
      <Stack.Screen name="ventureCapital" component={VentureCapital} />
      <Stack.Screen name="videoKeuanganII" component={VideoMateriKeuanganII} />
      <Stack.Screen name="roadmap" component={RoadmapScreen} />
      <Stack.Screen name="editAccount" component={EditAccount} />
      <Stack.Screen name="changeLevel" component={ChangeLevel} />
      <Stack.Screen name="accordionScreen" component={AccordionScreen} />
      <Stack.Screen name="kuisFondationI" component={FondationI} />
      <Stack.Screen name="kuisTujuanKeuangan" component={TujuanKeuangan} />
      <Stack.Screen name="kuisNilaiUang" component={NilaiUang} />
      <Stack.Screen name="kuisAsetLiabilitas" component={AsetdanLiabilitas} />
      <Stack.Screen name="kebijakanPrivasi" component={PrivacyPolicy} />
      <Stack.Screen name="lessons" component={LessonScreen} />
      <Stack.Screen name="quiz" component={QuizScreen} />
      <Stack.Screen name="myLessons" component={MyLessonScreen} />
    </Stack.Navigator>
  );
};

export default UserNavigation;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#3B4544F0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 13.5,
    elevation: 5,
  },
});
