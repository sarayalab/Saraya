import { View, Text } from 'react-native'
import React from 'react'

export default function Other() {
  return (
    <View>
    <View style={tw`absolute w-full border-b-2 border-gray-400 my-25`} />
            <View style={tw`absolute justify-center items-center w-full my-27`}>
              <Image source={require('./../assets/homePage/inpest.png')} style={tw`w-10 h-10`} />
              <Text style={tw` text-white text-base`}>Foundation Level </Text>
              <Text style={tw`text-white text-xs underline p-1 bg-[#2220]`} onPress={() => navigation.navigate('myCourses')}>Ubah Level</Text>
            </View>
      <Text>Other</Text>
    </View>
  )
}