import PasswordField from "@/components/ui/PasswordField";
import { useUser } from "@/context/useUser";
import { Tokens } from "@/types";
import api from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

const registerSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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

export default function Register() {
  const router = useRouter();
  const { loginUser } = useUser();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.min(
    screenWidth - styles.scrollContent.paddingHorizontal * 2,
    390,
  );
  const logoHeight = logoWidth / logoAspectRatio;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await api.post("/accounts/", data);
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
            <Text style={styles.welcome}>Create your account</Text>
            <Text style={styles.subtitle}>
              Create your account to start chatting instantly
            </Text>

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
              <PasswordField
                control={control}
                name="password"
                placeholder="Enter your password"
                error={errors.password?.message}
              />

              <Text style={styles.label}>Confirm Password</Text>
              <PasswordField
                control={control}
                name="confirmPassword"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
              />

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
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.registerText}>
              Already have an account?{" "}
              <Link href="/login" style={styles.registerLink}>
                Sign in
              </Link>
            </Text>

            <Link href="/settings" style={styles.settingsLink}>
              settings
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    textAlign: "center",
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

  settingsLink: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: "underline",
  },
});
