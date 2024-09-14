import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Dispatch, FC, ReactNode, SetStateAction } from "react";
import { Alert, LayoutAnimation, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics"
import { ShoppingListItemType } from "../app";
import { theme } from "../utils/theme";
import { saveToStorage } from '../utils/storage';

type ShoppingListItemProps = {
    id: string,
    name: string,
    isCompleted?: boolean,
    shoppingList: Array<ShoppingListItemType>,
    setShoppingList: Dispatch<SetStateAction<Array<ShoppingListItemType>>>,
    onToggleComplete: () => void,
}

const ShoppingListItem: FC<ShoppingListItemProps> = ({ id, name, isCompleted, shoppingList, setShoppingList, onToggleComplete }): ReactNode => {
    const handleDelete = () => {
        Alert.alert("Delete Item", `Are you sure you want to delete ${name}`,
            [
                { text: "Cancel", style: "cancel", onPress: () => console.log("Item cancelled") },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        const newShoppingList = shoppingList.filter((shoppingListItem: ShoppingListItemType) => shoppingListItem.id !== id);
                        saveToStorage("shoppingList", newShoppingList)
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        setShoppingList(newShoppingList)
                    }
                }
            ]);
    }
    return (
        <Pressable onPress={onToggleComplete} style={[styles.itemContainer, isCompleted ? styles.completedContainer : undefined]}>
            <View style={styles.textContainer}>
                {
                    isCompleted ?
                        <AntDesign name="checkcircle" size={24} color="green" /> :
                        <MaterialIcons name="radio-button-unchecked" size={24} color="black" />
                }
                <Text numberOfLines={1} style={[styles.itemText, isCompleted ? styles.completedText : undefined]}>{name}</Text>
            </View>
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}>
                <AntDesign name="closecircle" size={24} color={isCompleted ? theme.colorGray : theme.colorRed} />
            </TouchableOpacity>
        </Pressable>

    )
}

const styles = StyleSheet.create({
    itemContainer: {
        borderBottomWidth: 1,
        borderBlockStartColor: theme.colorCerulean,
        paddingHorizontal: 18,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    completedContainer: {
        backgroundColor: theme.lightGray,
        borderBottomColor: theme.lightGray,
        color: theme.colorGray

    },
    textContainer: {
        flexDirection: "row",
        gap: 8,
        flex: 1
    },
    itemText: {
        fontSize: 18,
        fontWeight: "200",
        flex: 1,
    },
    completedText: {
        textDecorationLine: "line-through",
        textDecorationColor: theme.colorGray
    },
    button: {
        backgroundColor: theme.colorBlack,
        padding: 8,
        borderRadius: 6
    },
    completedButton: {
        backgroundColor: theme.colorGray

    },
    buttonText: {
        color: theme.colorWhite,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
    }
});

export default ShoppingListItem;