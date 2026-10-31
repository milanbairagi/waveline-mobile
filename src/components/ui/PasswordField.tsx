import { Lucide } from "@react-native-vector-icons/lucide";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { authColors, authStyles } from "./authTheme";

type PasswordFieldProps<FormValues extends FieldValues> = {
  control: Control<FormValues>;
  error?: string;
  name: Path<FormValues>;
  placeholder: string;
};

export default function PasswordField<FormValues extends FieldValues>({
  control,
  error,
  name,
  placeholder,
}: PasswordFieldProps<FormValues>) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                authStyles.input,
                authStyles.passwordInput,
                error && authStyles.errorInput,
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={placeholder}
              placeholderTextColor={authColors.textTertiary}
              secureTextEntry={!visible}
              textContentType={
                String(name) === "password" ? "newPassword" : "password"
              }
            />
          )}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          onPress={() => setVisible(!visible)}
          style={authStyles.passwordToggle}
        >
          {visible ? (
            <Lucide name="eye-off" size={24} color={authColors.primaryDark} />
          ) : (
            <Lucide name="eye" size={24} color={authColors.primaryDark} />
          )}
        </Pressable>
      </View>
      {error && <Text style={authStyles.errorText}>{error}</Text>}
    </>
  );
}
