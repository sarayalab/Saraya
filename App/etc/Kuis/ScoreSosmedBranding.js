import React from 'react';
import { View, Text, StyleSheet, Button, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from "twrnc";

const ScoreSosmedBranding = ({ route, navigation }) => {
    const { score } = route.params;

    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require("../../assets/Success.png")}
          style={tw.style(tw`h-3/6`, { aspectRatio: 1 })}
        />
        <Text>Congratulations Buddies!! </Text>
        <Text style={tw`font-bold text-xl mt-5`}>Your Scored {score}</Text>
        <Pressable
          style={tw`bg-red-500 p-2 rounded-md mt-4`}
          onPress={() => navigation.navigate("MainApp")}
        >
          <Text style={tw`text-white font-medium`}>Go to Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

export default ScoreSosmedBranding

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 20,
    marginVertical: 10,
  },
});