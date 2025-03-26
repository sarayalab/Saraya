import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

import { View, Text } from 'react-native'
import React from 'react'


const FirebaseUtils = () => {

    async function fetchUserData(){
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const userData = [];
        querySnapshot.forEach((doc) => {
          userData.push({ id: doc.id, ... doc.data()});
        });
        return userData;
      }
      
  return (
    <View>
      <Text>FirebaseUtils</Text>
    </View>
  )
}

export default FirebaseUtils
