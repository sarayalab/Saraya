import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { Image, ScrollView, Share, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

function ReadNews() {
    const navigation=useNavigation();
    const news = useRoute().params.news;
    const shareNews = () => {
        Share.share({
            message:news.title+"\nRead More"+news.description
        })
    }
    useEffect(()=>{
    },[])
  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView>
      <View style={{ margin: 15 }}>
        <View
          style={{display: "flex",flexDirection: "row",justifyContent: "space-between",alignItems: "center",marginBottom: 10,}}>
          <TouchableOpacity onPress={()=> navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" style={{}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>shareNews()}>
            <Ionicons name="share-outline" size={24} color="black" style={{}} />
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: news.urlToImage }}
          style={{ width: "100%", height: 300, borderRadius: 15 }}
        />
        <Text style={{ marginTop: 10, fontSize: 22, fontWeight: "bold" }}>
          {news.title}
        </Text>
        <Text style={{ color: "#7d0a0a", marginTop: 10, fontSize: 15 }}>
          {news.source.name}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
            color: "#3C3C3C",
            lineHeight: 25,
          }}
        >
          {news.description}
        </Text>
        <TouchableOpacity onPress={()=> WebBrowser.openBrowserAsync(news.url)}>
            <Text
              style={{
                marginTop: 10,
                fontSize: 16,
                color: "#7d0a0a",
                fontWeight: "bold",
              }}
            >
              Read More
            </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ReadNews