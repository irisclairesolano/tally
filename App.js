import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AddTransactionScreen from './src/screens/AddTransactionScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

const Tab       = createBottomTabNavigator();
const ListNav   = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function ListStack() {
  const { colors } = useTheme();
  return (
    <ListNav.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: '600' },
    }}>
      <ListNav.Screen name="ListMain" component={ListScreen}    options={{ title: 'Transactions' }} />
      <ListNav.Screen name="Details"  component={DetailsScreen} options={{ title: 'Transaction details' }} />
    </ListNav.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { 
        borderTopColor: colors.border, 
        height: 64, 
        paddingTop: 6, 
        paddingBottom: 8,
        backgroundColor: colors.surface,
      },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home-outline',
          List: 'list-outline',
          Profile: 'people-outline',
          Settings: 'settings-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home"     component={HomeScreen}    options={{ tabBarLabel: 'Home', headerShown: false, title: '' }} />
      <Tab.Screen name="List"     component={ListStack}     options={{ tabBarLabel: 'List', headerShown: false, title: '' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen} options={{ tabBarLabel: 'About', headerShown: false, title: '' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', headerShown: false, title: '' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDarkMode } = useTheme();
  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={MainTabs} />
          <RootStack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{ presentation: 'modal' }} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
