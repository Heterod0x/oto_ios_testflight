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
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          height: 88,
          paddingBottom: 20,
          paddingTop: 0,
          borderTopWidth: 0,
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
              style={{ marginTop: 8 }}
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
              style={{ marginTop: -2 }}
              size={size + 5}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} width={size} height={size} />
          ),
        }}
      />
    </Tabs>
  );
}
