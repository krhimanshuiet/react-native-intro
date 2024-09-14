import { useState } from "react"
import { LayoutAnimation, StyleSheet, TextInput } from "react-native";
import { theme } from "../utils/theme"
import { ShoppingListItemType } from "../app";
import { saveToStorage } from "../utils/storage";

const TextInputComponent: React.FC<{
    shoppingList: Array<ShoppingListItemType>,
    setShoppingList: React.Dispatch<React.SetStateAction<Array<ShoppingListItemType>>>,
}> = ({ shoppingList, setShoppingList }): React.ReactElement => {
    const [value, setValue] = useState<string>("")
    return (
        <TextInput
            value={value}
            onChangeText={(value: string) => setValue(value)}
            style={styles.textInput}
            placeholder="Eg. Coffee"
            returnKeyType="done"
            onSubmitEditing={async () => {
                const newShoppingList = [...shoppingList, { id: new Date().toTimeString(), name: value, isCompleted: false, lastUpdatedTimeStamp: Date.now() }];
                saveToStorage("shoppingList", newShoppingList)  
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setShoppingList(newShoppingList);
                setValue("")
            }}
        />
    )
}

const styles = StyleSheet.create({
    textInput: {
        borderColor: theme.lightGray,
        borderWidth: 2,
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        fontSize: 18,
        borderRadius: 15,
        backgroundColor: theme.colorWhite
    }
});


export default TextInputComponent;