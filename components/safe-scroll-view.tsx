import { Platform, StatusBar, ScrollView } from "react-native";

export default function SafeScrollView({
  children,
  ...props
}: React.ComponentProps<typeof ScrollView>) {
  return (
    <ScrollView
      style={{ flex: 1, height: "100%", width: "100%" }}
      contentContainerStyle={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingBottom: 60,
      }}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
