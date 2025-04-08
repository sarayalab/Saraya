import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

function HeadlineList({newsList}) {
    const navigation = useNavigation();
  return (
    <View>
        <FlatList
            data={newsList}
            renderItem={({item})=>(
                <View style={{}}>
                <View style={{height:1, backgroundColor:'lightgrey', marginTop:10}}></View>
                <TouchableOpacity style={{marginTop:15, display:'flex', flexDirection:'row', }} onPress={() => navigation.navigate("readnews", {news:item})}>
                    <Image source={{uri:item.urlToImage}} style={{width:130, height:130, borderRadius:10,}}/>
                    <View style={{marginRight:130, marginLeft:10}}>
                        <Text numberOfLines={3} style={{fontSize:15, fontWeight:'bold'}}>{item.title}</Text>
                        <Text style={{color:'#7d0a0a', marginTop:5}}>{item?.source?.name}</Text>
                    </View>
                </TouchableOpacity>
                </View>
            )}
        />
    </View>
  )
}

export default HeadlineList