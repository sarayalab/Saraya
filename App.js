import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import UserNavigation from './App/routes/UserNavigation';


export default function App() {
  return (
    <NavigationContainer>
      <UserNavigation/>
    </NavigationContainer>
  );
}