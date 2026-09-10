import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Chat" }} />
      <Tabs.Screen name="echoes" options={{ title: "Echoes" }} />
      <Tabs.Screen name="glasses" options={{ title: "Glasses" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
