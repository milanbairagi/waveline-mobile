import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { Text, TextInput } from "react-native";
import { authColors, authStyles } from "./authTheme";

type TextFieldProps<FormValues extends FieldValues> = {
  control: Control<FormValues>;
  error?: string;
  name: Path<FormValues>;
  placeholder: string;
  textContentType?: "username" | "emailAddress";
};

export default function TextField<FormValues extends FieldValues>({
  control,
  error,
  name,
  placeholder,
  textContentType,
}: TextFieldProps<FormValues>) {
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[authStyles.input, error && authStyles.errorInput]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={authColors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType={textContentType}
          />
        )}
      />
      {error && <Text style={authStyles.errorText}>{error}</Text>}
    </>
  );
}
