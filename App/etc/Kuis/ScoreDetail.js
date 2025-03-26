import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './../../../firebase';
import tw from 'twrnc';

const ScoreDetail = () => {
  const [scores, setScores] = useState(null);
  const [timeSpent, setTimeSpent] = useState(null); 
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchScores = async () => {
      if (user) {
        const userUID = user.uid;
        const userDocRef = doc(db, 'users', userUID);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userScores = userData.scores ? userData.scores : null;
          const userTimeSpent = userData.timeSpent ? userData.timeSpent : null;
          setScores(userScores);
          setTimeSpent(userTimeSpent);
        } else {
          console.log('No such document!');
        }
      } else {
        console.log('No user authenticated');
      }
      setLoading(false);
    };

    fetchScores();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView>
        <View style={tw`mt-6 p-4`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View style={tw`mt-6 p-4`}>
        <Text style={tw`text-2xl mb-4`}>Score Details</Text>
        {scores ? (
          Object.keys(scores).map((quizId) => (
            <View key={quizId} style={tw`mb-4`}>
              <Text style={tw`text-lg`}>
                {quizId}: {scores[quizId]} 
              </Text>
              {timeSpent && timeSpent[quizId] && ( 
                <Text style={tw`text-sm`}>
                  Time Spent: {Math.floor(timeSpent[quizId] / 60)} minutes {timeSpent[quizId] % 60} seconds
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={tw`text-lg`}>No scores available.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ScoreDetail;
