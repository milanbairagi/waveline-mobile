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
  StyleSheet,
  Text,
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
  const logoWidth = Math.min(
    screenWidth - authStyles.scrollContent.paddingHorizontal * 2,
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
            <Text style={authStyles.welcome}>Welcome back!</Text>
            <Text style={authStyles.subtitle}>Sign in to continue chatting</Text>

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
                  <Text style={authStyles.submitButtonText}>Sign In</Text>
                )}
              </Pressable>
            </View>

            <Text style={authStyles.registerText}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={authStyles.registerLink}>
                Create one now
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

const logoAspectRatio = 933 / 238;

const styles = StyleSheet.create({
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
    color: authColors.primaryDark,
    fontSize: 20,
    fontWeight: "700",
  },
  featureLabel: {
    color: authColors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
