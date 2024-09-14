import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, LayoutAnimation } from "react-native";
import * as Haptics from "expo-haptics"
import ShoppingListItem from "../components/shopping-list-item";
import TextInputComponent from "../components/text-input";
import { getFromStorage, saveToStorage } from "../utils/storage";


function orderShoppingList(shoppingList: Array<ShoppingListItemType>) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimeStamp && item2.completedAtTimeStamp) {
      return item2.completedAtTimeStamp - item1.completedAtTimeStamp;
    }
    if (item1.completedAtTimeStamp && !item2.completedAtTimeStamp) {
      return 1
    }
    if (!item1.completedAtTimeStamp && item2.completedAtTimeStamp) {
      return -1
    }
    if (!item1.completedAtTimeStamp && !item2.completedAtTimeStamp) {
      return item2.lastUpdatedTimeStamp - item1.lastUpdatedTimeStamp;
    }
    return 0;
  })
}

export type ShoppingListItemType = {
  id: string,
  name: string,
  isCompleted?: boolean,
  completedAtTimeStamp?: number,
  lastUpdatedTimeStamp: number
}

const initialList: ShoppingListItemType[] = [
]

export default function App() {
  const [shoppingList, setShoppingList] = useState<Array<ShoppingListItemType>>(initialList)
  useEffect(() => {
    getFromStorage("shoppingList").then((shoppingList: Array<ShoppingListItemType> | null) => {
      if (shoppingList !== null) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setShoppingList(shoppingList)
      }

    })
  }, [])

  const handleToggleComplete = async (id: string) => {
    const newShoppingList = [...shoppingList].map((item) => {
      if (item.id === id) {
        if (item.completedAtTimeStamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return item;
        }
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
        item.isCompleted = true
        item.completedAtTimeStamp = item.completedAtTimeStamp ? undefined : Date.now();
        item.lastUpdatedTimeStamp = Date.now();
      }
      return item;
    })
    await saveToStorage("shoppingList", newShoppingList)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setShoppingList(newShoppingList)
  }
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={orderShoppingList(shoppingList)}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your Shopping List is Empty</Text>
        </View>}
      ListHeaderComponent={
        <TextInputComponent shoppingList={shoppingList} setShoppingList={setShoppingList} />
      }
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item: { id, name, isCompleted } }) =>
        <ShoppingListItem
          onToggleComplete={() => handleToggleComplete(id)}
          shoppingList={shoppingList}
          setShoppingList={setShoppingList}
          id={id}
          key={id}
          name={name}
          isCompleted={isCompleted} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18
  }
});
