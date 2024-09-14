import { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { CountDownStorageKey, PersistedCountdownState } from ".";
import { getFromStorage } from "../../utils/storage";
import { format } from "date-fns";
import { theme } from "../../utils/theme";

const fullDateFormat = `LLL d yyyy, h:mm aaa`;

export default function HistoryScreen() {
  const [countdown, setCountdownState] = useState<PersistedCountdownState>();

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(CountDownStorageKey);
      setCountdownState(value)
    }
    init();
  }, [])
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      data={countdown?.completedAtTimestamps}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>No History</Text>
        </View>}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>{format(item, fullDateFormat)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
  list:{
    flex:1,
    backgroundColor:theme.colorWhite
  },
  contentContainer:{
    marginTop:8
  },
  listItem:{
    backgroundColor:theme.lightGray,
    marginHorizontal:8,
    padding:12,
    borderRadius:6,
    marginBottom:8
  },
  listItemText:{
    fontSize:18,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18
  }
});