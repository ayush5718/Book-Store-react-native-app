import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuthStore } from "../store/authStore";
const Index = () => {
  const { user } = useAuthStore();

  return (
    <View>
      <Text>{user?.email}</Text>
      <Image source={user.profileImage} style={{ width: 200, height: 200 }} />
      <Link href="/(auth)/signup">Signup Page</Link>
      <Link href="/(auth)">Login Page</Link>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({});
