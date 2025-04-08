import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import UserNavigation from '../routes/UserNavigation'
import { useNavigation } from '@react-navigation/native';


function TopHeadlineSlieder({newsList}) {
  const navigation = useNavigation();

  return (
    <View style={{ marginTop: 20 }}>
      <FlatList
        data={newsList}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              width: Dimensions.get("screen").width * 0.88,
              marginRight: 15,
            }}
            onPress={() => navigation.navigate("readnews", {news:item})}
          >
            <Image
              source={{ uri: item.urlToImage }}
              style={{
                height: Dimensions.get("screen").width * 0.77,
                borderRadius: 10,
              }}
            />
            <Text
              numberOfLines={3}
              style={{ marginTop: 10, fontSize: 22, fontWeight: "bold" }}
            >
              {item.title}
            </Text>
            <Text style={{ marginTop: 5, color: "#7d0a0a" }}>
              {item?.source?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default TopHeadlineSlieder