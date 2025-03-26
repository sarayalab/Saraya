import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

export default function SosmedBranding() {
  const navigation = useNavigation();
  const [isChecked, setChecked] = useState({
    1: false,
    2: false,
    3: false,
  });

  const handleCheckboxPress = (id) => {
    setChecked((prevState) => ({
      ...prevState,
      [id]:!prevState[id],
    }));
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <StatusBar />
        <View>
          <View style={styles.card}>
            <Text style={styles.text}>Tentang Kelas</Text>
            <Text style={styles.paragraph}>
              Kelas ini mempelajari dan memahami konsep dasar sosial media branding untuk
              dapat menjadi pondasi penting dalam perkembangan usaha/UMKM. Bagi
              Kamu calon pengusaha sukses wajib memahami konsep dasar sosial media branding.
              Dengan pemahaman sosial media branding yang baik, Kamu dapat mempelajari
              pemasaran digital dengan lebih mudah.
            </Text>
          </View>
          <View style={styles.cardMateri}>
            <Text onPress={() => navigation.navigate("dasarSosmed")}>
              Dasar Sosial Media Branding
            </Text>
            <View>
              <TouchableOpacity onPress={ () => handleCheckboxPress(1)}>
                <View style={styles.checkbox}>
                  <AntDesign
                    name={isChecked[1] && "checksquare"}
                    size={22}
                    color="#7d0a0a"
                    style={{ marginTop: -1 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardMateri}>
            <Text onPress={() => navigation.navigate("Keuangan")}>
              Penjelasan Sosial Media Branding
            </Text>
            <View>
              <TouchableOpacity onPress={() =>handleCheckboxPress(2)}>
                <View style={styles.checkbox}>
                  <AntDesign
                    name={isChecked[2] && "checksquare" }
                    size={22}
                    color="#7d0a0a"
                    style={{ marginTop: -1 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardMateri}>
            <Text onPress={() => navigation.navigate("kuisSosmedBranding")}>
              Kuis Sosial Media Branding
            </Text>
            <View>
              <TouchableOpacity onPress={() =>handleCheckboxPress(3)}>
                <View style={styles.checkbox}>
                  <AntDesign
                    name={isChecked[3] && "checksquare" }
                    size={22}
                    color="#7d0a0a"
                    style={{ marginTop: -1 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  text: {
    marginLeft: -50,
    color: "#7D0A0A",
    marginTop: -50,
    fontWeight: "500",
    fontSize: 20,
  },
  paragraph: {
    marginLeft: -50,
    marginTop: 5,
    marginRight: -45,
    marginBottom: -140,
  },
  card: {
    padding: 70,
    paddingBottom: 140,
    margin: 20,
    backgroundColor: "#ffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 111,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardAnswer: {
    padding: 20,
    margin: 20,
    marginBottom: 5,
    backgroundColor: "#ffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 111,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardMateri: {
    padding: 10,
    backgroundColor: "white",
    margin: 20,
    marginTop: -10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "grey",
  },
  checkbox:{
    height: 24,
    width: 24,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: "#7d0a0a",
    alignItems: "center",
    justifyContent: "center",
    marginTop:-20,
    marginHorizontal:335
  }
});