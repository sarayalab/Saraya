import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { reactMateriSosmedBranding } from './MateriSosmedBranding';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from "twrnc";

const DasarSosmedBranding = ({navigation}) => {
    const [currentMateriIndex, setCurrentMateriIndex] = useState(0);
    const handleNext = () => {
      if (currentMateriIndex === reactMateriSosmedBranding.length - 1){
          navigation.navigate("sosmed");
      } else {
        setCurrentMateriIndex(currentMateriIndex + 1);
      }
    }
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View>
          <View style={tw`mt-20 p-4`}>
            <Text style={tw`text-xl font-extrabold mb-10`}>
              Dasar Sosial Media Branding
            </Text>
            <Text style={tw`text-lg font-bold mb-4`}>{reactMateriSosmedBranding[currentMateriIndex].Judul}</Text>
            <Text style={tw`mb-4`}>
              {reactMateriSosmedBranding[currentMateriIndex].subJudul}
            </Text>
            {reactMateriSosmedBranding[currentMateriIndex].Poin.map((poin, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listText}>{poin}</Text>
              </View>
            ))}
            <Pressable
              style={tw`bg-purple-500 p-4 rounded-md mt-6`}
              onPress={handleNext}
            >
              <Text style={tw`text-white text-lg text-center`}>
                {currentMateriIndex === reactMateriSosmedBranding.length - 1 ? "Finish" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
};

export default DasarSosmedBranding;

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    flexWrap: 'wrap', // Ensure the text wraps to the next line
  },
  bulletPoint: {
    fontSize: 18,
    lineHeight: 22,
    marginRight: 8,
  },
  listText: {
    flexShrink: 1, // Allow text to wrap to the next line if it's too long
    fontSize: 12,
    lineHeight: 22,
    marginLeft: 6
  },
});
