import AsyncStorage from "@react-native-async-storage/async-storage";

export const getToken = async (key: string) => {
  try {
    const token = await AsyncStorage.getItem(key);
    return token;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};
