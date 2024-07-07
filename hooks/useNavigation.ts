import { RootStackParamList } from '@/layouts/types/navigationTypes';
import { useNavigation as useNativeNavigation, NavigationProp } from '@react-navigation/native';

export const useNavigation = () => useNativeNavigation<NavigationProp<RootStackParamList>>();
