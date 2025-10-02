import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
export default function Index() {
  const { token } = useAuthStore();

  //states for books, loading,refreshing,page, hasMore
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum == 1) setLoading(true);

      const response = await fetch(
        `${API_URL}/api/books?page=${pageNum}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.json();
      setBooks((prevBooks) => [...prevBooks, ...data]);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching books", error);
    } finally {
      if (refresh) setRefreshing(false);
      else setLoading(false);
    }
  };
  useEffect(() => {
    fetchBooks();
  }, []);

  const renderItem = ({ item }) => (
    <View styles={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />

          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image
          source={item.image}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>
    </View>
  );
  const handleLoadMore = async () => {};
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        key={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
