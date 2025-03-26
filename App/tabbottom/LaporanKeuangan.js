import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { BarChart } from "react-native-chart-kit";

const LaporanKeuangan = ({ uid }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("Modal");
  const [user, setUser] = useState(null); // Mengelola pengguna
  const [userUID, setUserUID] = useState(""); // Tambahkan state untuk user UID
  const [fullname, setFullname] = useState("");
  const [isShowingTransactions, setIsShowingTransactions] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [businessField, setBusinessField] = useState("");
  const [businessChallenge, setBusinessChallenge] = useState("");
  const [profileImage, setProfileImage] = useState(""); // Mengelola gambar profil
  const [educationTopics, setEducationTopics] = useState([]); // Mengelola topik edukasi
  const [financialSkill, setFinancialSkill] = useState(""); // Mengelola kemampuan finansial
  const [hasSurvey, setHasSurvey] = useState(false); // Mengelola status survei
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // Memperbarui pengguna yang login
        setUserUID(user.uid); // Simpan UID pengguna
        fetchUserData(user.uid); // Panggil fungsi untuk mendapatkan data pengguna
        fetchUserTransactions(user.uid); // Panggil fungsi untuk mendapatkan transaksi pengguna
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFullname(userData.fullname); // Set fullname dari user data
        setProfileImage(userData.profileImage);
        setHasSurvey(!!userData.businessName);
        if (userData.businessName) {
          setBusinessName(userData.businessName);
          setBusinessField(userData.businessField);
          setBusinessChallenge(userData.businessChallenge);
          setEducationTopics(userData.educationTopics || []);
          setFinancialSkill(userData.financialSkill || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchUserTransactions = async (uid) => {
    try {
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("uid", "==", uid)
      );
      const querySnapshot = await getDocs(transactionsQuery);
      const fetchedTransactions = [];
      querySnapshot.forEach((doc) => {
        fetchedTransactions.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const addTransaction = async () => {
    if (amount && parseFloat(amount) !== 0) {
      const newTransaction = {
        uid: user.uid,
        type: selectedType,
        amount: parseFloat(amount),
        description: description,
        date: new Date(),
      };

      try {
        const docRef = await addDoc(
          collection(db, "transactions"),
          newTransaction
        );
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          { id: docRef.id, ...newTransaction },
        ]);
      } catch (error) {
        console.error("Failed to add transaction:", error);
      }

      setAmount("");
      setDescription("");
    }
  };

  const removeTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== id)
      );
    } catch (error) {
      console.error("Failed to remove transaction:", error);
    }
  };

  const formatDate = (date) => {
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  // Fungsi untuk memformat angka besar (jutaan, miliaran, dll.)
  const formatCurrency = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`; // Triliun
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`; // Miliar
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`; // Juta
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`; // Ribu
    return num.toLocaleString("id-ID"); // Jika di bawah 1000, tetap tampilkan angka penuh
  };

  const calculateBalance = () => {
    const totalIncome = transactions
      .filter((transaction) =>
        ["Pemasukan", "Modal"].includes(transaction.type)
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) =>
        ["Pengeluaran", "Operasional", "HPP"].includes(transaction.type)
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    return totalIncome - totalExpense;
  };

  const calculateMarginPercentage = () => {
    const totalIncome = transactions
      .filter((transaction) =>
        ["Pemasukan", "Modal"].includes(transaction.type)
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalOutcome = transactions
      .filter((transaction) =>
        ["Pengeluaran", "Operasional", "HPP"].includes(transaction.type)
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    if (totalIncome === 0) {
      return -100; // Jika total income 0, margin dianggap -100%
    }

    return ((totalIncome - totalOutcome) / totalIncome) * 100;
  };

  const totalIncome = transactions
    .filter((transaction) => ["Pemasukan", "Modal"].includes(transaction.type))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalOutcome = transactions
    .filter((transaction) =>
      ["Pengeluaran", "Operasional", "HPP"].includes(transaction.type)
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const marginPercentage = calculateMarginPercentage().toFixed(2);

  // Data untuk grafik
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], // Label sumbu X
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43], // Data untuk grafik
      },
    ],
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#BB1624] p-4`}>
      <StatusBar />
      <View style={tw`bg-[#BB1624] p-4 rounded-lg`}>
        <Text style={tw`text-white text-lg text-center mb-10`}>
          Keuangan Toko
        </Text>
        <Text style={tw`text-white text-lg font-bold`}>
          {fullname ? fullname : "Loading..."}{" "}
          {/* Tampilkan fullname atau 'Loading...' */}
        </Text>
        <Text style={tw`text-white`}>
          {businessName ? businessName : "Belum ada nama bisnis"}{" "}
          {/* Tampilkan businessName atau pesan default */}
        </Text>

        <View style={tw`flex-row justify-between mt-4`}>
          <TextInput
            style={tw`bg-white p-2 rounded-lg flex-1 mr-2 border border-gray-300 text-left`}
            placeholder="Rp"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text)}
          />
          <View
            style={tw`bg-white rounded-lg border border-gray-300 flex-1 justify-center`}
          >
            <Picker
              selectedValue={selectedType}
              style={tw`flex-1`}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              <Picker.Item label="Modal" value="Modal" />
              <Picker.Item label="Operasional" value="Operasional" />
              <Picker.Item label="HPP" value="HPP" />
              <Picker.Item label="Pemasukan" value="Pemasukan" />
              <Picker.Item label="Pengeluaran" value="Pengeluaran" />
            </Picker>
          </View>
        </View>
        <TextInput
          style={tw`bg-white p-2 rounded-lg border border-gray-300 mt-2`}
          placeholder="Deskripsi"
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        <TouchableOpacity
          onPress={addTransaction}
          style={tw`bg-blue-500 p-2 rounded-lg mt-2`}
        >
          <Text style={tw`text-white text-center`}>Submit</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 p-4 bg-white rounded-t-lg`}>
        <View style={tw`flex-row justify-between mt-4 bg-gray-200 rounded-lg`}>
          <TouchableOpacity
            style={tw`flex-1 p-2 bg-${
              isShowingTransactions ? "[#BB1624]" : "gray-200"
            } rounded-lg`}
            onPress={() => setIsShowingTransactions(true)}
          >
            <Text
              style={tw`text-center ${
                !isShowingTransactions ? "text-gray-800" : "text-white"
              }`}
            >
              Transaksi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 p-2 bg-${
              !isShowingTransactions ? "[#BB1624]" : "gray-200"
            } rounded-lg`}
            onPress={() => setIsShowingTransactions(false)}
          >
            <Text
              style={tw`text-center ${
                !isShowingTransactions ? "text-white" : "text-gray-800"
              }`}
            >
              Laporan
            </Text>
          </TouchableOpacity>
        </View>

        {isShowingTransactions ? (
          <View style={tw`bg-white p-2 mt-4`}>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={tw`flex-row justify-between mb-2`}>
                  <View>
                    <Text style={tw`font-bold`}>{item.type}</Text>
                    <Text style={tw`text-gray-500`}>{item.description}</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`text-right`}>
                      <Text
                        style={tw`text-${
                          ["Modal", "Pemasukan"].includes(item.type)
                            ? "green-600"
                            : "black"
                        }`}
                      >
                        Rp {item.amount.toLocaleString("id-ID")}
                      </Text>
                      <Text style={tw`text-gray-400 text-xs`}>
                        {formatDate(new Date(item.date.seconds * 1000))}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeTransaction(item.id)}
                      style={tw`ml-4`}
                    >
                      <FontAwesome name="trash-o" size={20} color="#BB1624" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        ) : (
          <ScrollView>
            <View>
              <Text style={tw`font-bold text-lg mb-5 mt-5 text-center`}>
                Laporan Keuangan
              </Text>
              <View style={{ alignItems: "center", padding: 20 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
                >
                  Grafik Pendapatan
                </Text>
                <BarChart
                  data={data}
                  width={screenWidth - 40} // Lebar grafik
                  height={120} // Tinggi grafik
                  fromZero={true} // Memastikan grafik mulai dari 0
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0, // Jumlah desimal
                    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Warna grafik
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Warna label
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726",
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </View>
              <View style={tw`flex-row justify-between mb-4`}>
                {/* Outcome */}
                <View
                  style={tw`bg-[#BB1624] p-4 rounded-lg flex-1 items-center`}
                >
                  <Text style={tw`text-white text-sm mb-2`}>Outcome</Text>
                  <View style={tw`bg-white p-2 rounded-lg`}>
                    <Text style={tw`text-black text-xs`}>
                      Rp {formatCurrency(totalOutcome)}
                    </Text>
                  </View>
                </View>

                {/* Income */}
                <View
                  style={tw`bg-[#BB1624] p-4 rounded-lg flex-1 ml-2 items-center`}
                >
                  <Text style={tw`text-white text-sm mb-2`}>Income</Text>
                  <View style={tw`bg-white p-2 rounded-lg`}>
                    <Text style={tw`text-black text-xs`}>
                      Rp {formatCurrency(totalIncome)}
                    </Text>
                  </View>
                </View>

                {/* Margin */}
                <View
                  style={tw`bg-[#BB1624] p-4 rounded-lg flex-1 ml-2 items-center`}
                >
                  <Text style={tw`text-white text-sm mb-2`}>Margin</Text>
                  <View style={tw`bg-white p-2 rounded-lg`}>
                    <Text style={tw`text-black text-xs`}>
                      {marginPercentage}%
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={addTransaction}
                style={tw`bg-[#00A91B] p-3 rounded-lg mt-4`}
              >
                <Text style={tw`text-white text-center text-base`}>
                  Unduh Laporan
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LaporanKeuangan;
