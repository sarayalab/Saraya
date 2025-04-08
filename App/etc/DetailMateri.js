import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetailMateri({ route }) {
  const { material } = route.params;

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{material.title}</Text>
          <Text style={styles.subTitle}>{material.subTitle}</Text>
          <Text style={styles.content}>{material.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card:{
    padding: 70,
    // paddingBottom: 120,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 1,
    marginLeft: -50,
    marginTop: -30,
    color: "#7D0A0A"
  },
  subTitle: {
    fontSize: 14,
    marginLeft: -48,
    marginTop: 5,
    fontWeight: '500',
  },
  content: {
    fontSize: 12,
    lineHeight: 24,
    marginTop:30,
    fontWeight:'400',
    marginLeft: -48
  },
});
