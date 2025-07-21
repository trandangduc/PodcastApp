import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'podcast_history';

export const saveToHistory = async (episode: any) => {
  try {
    const existing = await AsyncStorage.getItem(HISTORY_KEY);
    let history = existing ? JSON.parse(existing) : [];

    // Xoá nếu đã tồn tại (để tránh trùng)
    history = history.filter((item: any) => item.id !== episode.id);

    // Thêm vào đầu danh sách
    history.unshift({ ...episode, listenedAt: new Date().toISOString() });

    // Giới hạn lịch sử (ví dụ 50 mục)
    if (history.length > 50) history = history.slice(0, 50);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history', error);
  }
};

export const getHistory = async () => {
  try {
    const existing = await AsyncStorage.getItem(HISTORY_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting history', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history', error);
  }
};
