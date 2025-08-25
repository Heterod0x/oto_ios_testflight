import { PlatformPressable } from '@react-navigation/elements';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import ProfileIcon from '@/assets/images/profile.svg';
import FolderIcon from '@/assets/images/folder.svg';
import MicIcon from '@/assets/images/mic.svg';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  const { isLoggedIn, isReady } = useAuthStatus();

  // useEffect(() => {
  //   if (isReady && !isLoggedIn) {
  //     router.replace('/login');
  //   }
  // }, [isLoggedIn, isReady, router]);

  // Don't render tabs if not ready or not logged in
  if (!isReady || isLoggedIn === null) {
    return null;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            pressColor="#4f46e533" //For android
            pressOpacity={0.3} //For ios
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 40,
          right: 40,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
          paddingHorizontal: 8,
          marginHorizontal: 24,
          marginBottom: 8,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#666',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          ...Platform.select({
            ios: {
              shadowColor: '#666',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
            },
            android: {
              elevation: 10,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <FolderIcon color={color} width={size} height={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="recording"
        options={{
          href: '/(tabs)/recording?mode=recording', // routing with stale conversationId sticks otherwise
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MicIcon
              color={color}
              width={size}
              height={size}
              style={{ marginTop: 6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="claim"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="attach-money"
              style={{ marginTop: -4 }}
              size={size + 5}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          href: '/(tabs)/logout',
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="logout"
              style={{ marginTop: 3 }}
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
