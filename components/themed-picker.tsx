import { useThemeColor } from '@/hooks/use-theme-color';
import RNPickerSelect, { PickerSelectProps } from 'react-native-picker-select';
import { StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export function ThemedPicker(props: PickerSelectProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'icon');

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 4,
      color: color,
      paddingRight: 30,
      marginBottom: 10,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: borderColor,
      borderRadius: 8,
      color: color,
      paddingRight: 30,
      marginBottom: 10,
    },
    placeholder: {
      color: placeholderColor,
    },
  });

  return (
    <RNPickerSelect
      {...props}
      style={pickerSelectStyles}
      placeholder={props.placeholder ? { ...props.placeholder, color: placeholderColor } : undefined}
      darkTheme={useThemeColor({}, 'background') === 'dark'}
    />
  );
}
