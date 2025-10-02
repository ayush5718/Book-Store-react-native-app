import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { File } from "expo-file-system";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Create() {
  // states for title, caption, rating, image, imageBase64, loading
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); // to display instantly what imagw we selected
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token, user } = useAuthStore();
  // const pickImage = async () => {
  //   try {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== "granted") {
  //         Alert.alert(
  //           "Permission denied",
  //           "We need camera roll persmissions to upload an image"
  //         );
  //         return;
  //       }
  //     }

  //     // launch image library
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: "images",
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 0.5, // lower quality for smaller base64
  //       base64: true,
  //     });

  //     if (!result.canceled) {
  //       setImage(result.assets[0].uri);

  //       // if base64 is provided, use it

  //       if (result.assets[0].base64) {
  //         setImageBase64(result.assets[0].base64);
  //       } else {
  //         // otherwise, convert to base64
  //         const base64 = await FileSystem.readAsStringAsync(
  //           result.assets[0].uri,
  //           {
  //             encoding: FileSystem.EncodingType.Base64,
  //           }
  //         );

  //         setImageBase64(base64);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error picking image:", error);
  //     Alert.alert("Error", "There was a problem selecting your image");
  //   }
  // };

  const pickImage = async () => {
    try {
      // Ask permission on native (skip for web)
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "We need camera roll permissions to upload an image"
          );
          return;
        }
      }

      // Open image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // enum per docs
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true, // ask picker to include base64 if available
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Show preview
        setImage(asset.uri);

        // Use provided base64 if present; otherwise read with modern File API
        if (asset.base64) {
          setImageBase64(asset.base64);
        } else {
          const base64 = await new File(asset.uri).base64();
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      Alert.alert("Success", "Your book recommendation has been posted!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Error creating book:", error);
      Alert.alert("Error", "There was a problem creating your book");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* form for creating book with button */}
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/*HEADER FOR CREATE*/}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>
              Share your favorite reads with others
            </Text>
          </View>

          {/*FORM FOR CREATE BOOK */}
          <View style={styles.form}>
            {/*TITLE INPUT*/}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/*RATING INPUT */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating</Text>
              {renderRatingPicker()}
            </View>

            {/*BOOK IMAGE INPUT */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>

              {/*button to reset or remove the image into default selected image */}
              <View style={{ alignItems: "flex-end" }}>
                {image && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setImage(null)}>
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Select Image</Text>
                  </View>
                )}

                {/*button to reset or remove the image into default selected image */}
              </TouchableOpacity>
            </View>

            {/*CAPTION INPUT */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>

              <TextInput
                style={styles.textArea}
                placeholder="Write your review or thoughts about this book"
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            {/*SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
