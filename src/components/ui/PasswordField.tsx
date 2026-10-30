import { Lucide } from "@react-native-vector-icons/lucide";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function PasswordField({
  control,
  error,
  name,
  placeholder,
}: {
  control: any;
  error?: string;
  name: "password" | "confirmPassword";
  placeholder: string;
}) {
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
                styles.input,
                styles.passwordInput,
                error && styles.errorInput,
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={placeholder}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!visible}
              textContentType={name === "password" ? "newPassword" : "password"}
            />
          )}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          onPress={() => setVisible(!visible)}
          style={styles.passwordToggle}
        >
          {/* <Text style={styles.passwordToggleText}>
            {visible ? "Hide" : "Show"}
          </Text> */}
          {visible ? (
            <Lucide name="eye-off" size={24} color={colors.primaryDark} />
          ) : (
            <Lucide name="eye" size={24} color={colors.primaryDark} />
          )}
        </Pressable>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}

const colors = {
  input: "#E8E9EB",
  text: "#111827",
  primaryDark: "#576f90",
  error: "#DC2626",
  textTertiary: "#9CA3AF",
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.input,
    borderWidth: 0,
    borderRadius: 14,
    color: colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  passwordInput: {
    paddingRight: 70,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  passwordToggleText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "600",
  },
  errorInput: {
    backgroundColor: "#FEE2E2",
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: -4,
    marginBottom: 14,
  },
});
