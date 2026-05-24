import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'pixelkit_hf_token';

export function useHFToken() {
  const [token, setToken] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(val => {
      if (val) setToken(val);
      setLoaded(true);
    });
  }, []);

  const saveToken = async (t: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken('');
  };

  return {token, saveToken, clearToken, loaded};
}
