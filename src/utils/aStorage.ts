import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    return { error: "Error saving data", details: e };
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    return { error: "Error retrieving data", details: e };
  }
};
