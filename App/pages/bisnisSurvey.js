const handleSubmit = async () => {
    if (!businessName || !businessType || !businessScale || !businessAge) {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          businessName,
          businessType,
          businessScale,
          businessAge,
          hasCompletedSurvey: true, // Set survey status to completed
          updatedAt: new Date().toISOString(),
        });

        Alert.alert(
          'Sukses',
          'Data bisnis Anda berhasil disimpan',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('MainApp'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error updating business data:', error);
      Alert.alert('Error', 'Gagal menyimpan data bisnis');
    }
  }; 