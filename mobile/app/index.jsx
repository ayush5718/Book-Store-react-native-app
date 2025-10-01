import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <View>
      <Text>index</Text>
      <Link href="/(auth)/signup">Signup Page</Link>
      <Link href="/(auth)">Login Page</Link>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
