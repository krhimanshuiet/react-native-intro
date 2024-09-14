import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingListItemType } from "../app";

export async function getFromStorage(key: string) {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null
    }
}

export async function saveToStorage(key: string, value: any) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));

    } catch (error) {

    }
}