// import { View, Text } from 'react-native'
// import React from 'react'
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';

const Edu = () => {
  
  return (
    <SafeAreaView>
      <StatusBar />
      <View>
        <View>
          <Image
            source={require("./../assets/Logo.png")}
            style={{ height: 30, width: 30, margin: 20 }}
          />
        </View>
        <Text style={styles.text}>Materi Edukasi</Text>
        <View style={styles.card}>
          <Text
            style={{
              marginLeft: -90,
              marginTop: -80,
              marginRight: -90,
              marginBottom: -70,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              Didalam materi edukasi ini
            </Text>{" "}
            akan berisi beberapa materi yang sangat berguna dilapangan. materi yang ada sudah dikurasi dengan cermat sehingga mendapatkan poin-poin utama dalam menjalankan sebuah bisnis berskali kecil hingga menengah. Pada materi edukasi terdapat materi dan latihan soal yang berguna untuk menambah wawasan dan pengetahuan mulai dari mengelola laporan keuangan, hingga menggunakan ads/iklan di sosial media
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Edu;
const styles = StyleSheet.create({
  text:{
    marginLeft:20,
    color:'#7D0A0A',
    marginTop:-15,
    fontWeight:'500',
    fontSize:20
  },
  card:{
    padding:100,
    margin:20,
    backgroundColor:'#ffff',
    borderRadius:10,
    borderWidth:1,
    borderColor:'grey',
    shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 111,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
  }
});