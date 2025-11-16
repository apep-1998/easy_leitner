import { TextInput } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextInputProps = React.ComponentProps<typeof TextInput> & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "textInputBackground",
  );

  return (
    <TextInput
      style={[
        {
          color,
          backgroundColor,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          fontSize: 16,
        },
        style,
      ]}
      placeholderTextColor={color + "99"}
      {...rest}
    />
  );
}
