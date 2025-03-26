import React from "react";
import { View, Text } from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";

const TabBarIcon = ({ iconName, label, focused, additionalStyle = {} }) => {
  let IconComponent;

  if (iconName === "newspaper") {
    IconComponent = FontAwesome5;
  } else if (iconName.includes("account") || iconName.includes("home")) {
    IconComponent = MaterialCommunityIcons;
  } else if (iconName === "leaderboard" || iconName === "edit") {
    // contoh penggunaan MaterialIcons
    IconComponent = MaterialIcons;
  } else {
    IconComponent = FontAwesome6;
  }

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
        ...additionalStyle,
      }}
    >
      <IconComponent
        name={iconName}
        size={24}
        color={focused ? "#BB1624" : "grey"}
      />
      <Text style={{ fontSize: 11, color: focused ? "#BB1624" : "grey" }}>
        {label}
      </Text>
    </View>
  );
};

export default TabBarIcon;
