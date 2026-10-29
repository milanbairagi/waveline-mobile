import { useUser } from "@/context/useUser";
import { Tokens } from "@/types";
import api from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const loginSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { loginUser } = useUser();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [showPassword, setShowPassword] = useState(false);
  const logoWidth = Math.min(
    screenWidth - styles.scrollContent.paddingHorizontal * 2,
    390,
  );
  const logoHeight = logoWidth / logoAspectRatio;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const response = await api.post("/token/", data);
      await loginUser(response.data as Tokens);
      router.navigate("/");
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.backgroundOrb, styles.topOrb]} />
      <View style={[styles.backgroundOrb, styles.bottomOrb]} />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 28,
              paddingBottom: insets.bottom + 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Image
              source={require("@/assets/images/logowithname.png")}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
            <Text style={styles.welcome}>Welcome back!</Text>
            <Text style={styles.subtitle}>Sign in to continue chatting</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.username && styles.errorInput]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your username"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                  />
                )}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}

              <Text style={styles.label}>Password</Text>
              <View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.errorInput,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showPassword}
                      textContentType="password"
                    />
                  )}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  hitSlop={8}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={handleSubmit(onSubmit)}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSubmitting && styles.submitButtonPressed,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Sign In</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={styles.registerLink}>
                Create one now
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Feature({
  accent,
  label,
  symbol,
}: {
  accent: string;
  label: string;
  symbol: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: accent }]}>
        <Text style={styles.featureSymbol}>{symbol}</Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const colors = {
  background: "#F2F3F5",
  input: "#E8E9EB",
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primary100: "#DBEAFE",
  accent100: "#FAE8FF",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  error: "#DC2626",
  white: "#FFFFFF",
};

const logoAspectRatio = 933 / 238;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
  },
  backgroundOrb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.45,
  },
  topOrb: {
    width: 210,
    height: 210,
    backgroundColor: colors.primary100,
    top: -110,
    right: -80,
  },
  bottomOrb: {
    width: 170,
    height: 170,
    backgroundColor: colors.accent100,
    bottom: -80,
    left: -75,
  },
  logo: {
    marginBottom: 22,
  },
  welcome: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: 38,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
  },
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
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 28,
    textAlign: "center",
  },
  registerLink: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  features: {
    borderTopColor: "#DCDDDF",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 34,
    paddingTop: 24,
    width: "100%",
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    marginBottom: 8,
    width: 42,
  },
  featureSymbol: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "700",
  },
  featureLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
