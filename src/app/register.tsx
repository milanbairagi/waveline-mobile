import PasswordField from "@/components/ui/PasswordField";
import TextField from "@/components/ui/TextField";
import { authColors, authStyles } from "@/components/ui/authTheme";
import { useUser } from "@/context/useUser";
import { Tokens } from "@/types";
import api from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
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

const logoAspectRatio = 933 / 238;

export default function Register() {
  const router = useRouter();
  const { loginUser } = useUser();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.min(
    screenWidth - authStyles.scrollContent.paddingHorizontal * 2,
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
    <View style={authStyles.screen}>
      <StatusBar style="dark" />
      <View style={[authStyles.backgroundOrb, authStyles.topOrb]} />
      <View style={[authStyles.backgroundOrb, authStyles.bottomOrb]} />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            authStyles.scrollContent,
            {
              paddingTop: insets.top + 28,
              paddingBottom: insets.bottom + 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.content}>
            <Image
              source={require("@/assets/images/logowithname.png")}
              style={[authStyles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
            <Text style={authStyles.welcome}>Create your account</Text>
            <Text style={authStyles.subtitle}>
              Create your account to start chatting instantly
            </Text>

            <View style={authStyles.form}>
              <Text style={authStyles.label}>Username</Text>
              <TextField
                control={control}
                name="username"
                placeholder="Enter your username"
                error={errors.username?.message}
              />

              <Text style={authStyles.label}>Password</Text>
              <PasswordField
                control={control}
                name="password"
                placeholder="Enter your password"
                error={errors.password?.message}
              />

              <Text style={authStyles.label}>Confirm Password</Text>
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
                  authStyles.submitButton,
                  pressed && !isSubmitting && authStyles.submitButtonPressed,
                  isSubmitting && authStyles.submitButtonDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={authColors.white} />
                ) : (
                  <Text style={authStyles.submitButtonText}>Create Account</Text>
                )}
              </Pressable>
            </View>

            <Text style={authStyles.registerText}>
              Already have an account?{" "}
              <Link href="/login" style={authStyles.registerLink}>
                Sign in
              </Link>
            </Text>

            <Link href="/settings" style={authStyles.settingsLink}>
              settings
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
