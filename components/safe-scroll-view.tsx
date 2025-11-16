import { Platform, StatusBar, ScrollView } from "react-native";

export default function SafeScrollView({
  children,
  ...props
}: React.ComponentProps<typeof ScrollView>) {
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
