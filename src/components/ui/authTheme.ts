import { StyleSheet } from "react-native";

export const authColors = {
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
  errorBackground: "#FEE2E2",
  white: "#FFFFFF",
} as const;

export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: authColors.background,
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
    backgroundColor: authColors.primary100,
    top: -110,
    right: -80,
  },
  bottomOrb: {
    width: 170,
    height: 170,
    backgroundColor: authColors.accent100,
    bottom: -80,
    left: -75,
  },
  logo: {
    marginBottom: 22,
  },
  welcome: {
    color: authColors.text,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: 38,
  },
  label: {
    color: authColors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
  },
  input: {
    backgroundColor: authColors.input,
    borderWidth: 0,
    borderRadius: 14,
    color: authColors.text,
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
  errorInput: {
    backgroundColor: authColors.errorBackground,
  },
  errorText: {
    color: authColors.error,
    fontSize: 13,
    marginTop: -4,
    marginBottom: 14,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: authColors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 16,
    shadowColor: authColors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: authColors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: authColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  registerText: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginTop: 28,
    textAlign: "center",
  },
  registerLink: {
    color: authColors.primaryDark,
    fontWeight: "700",
  },
  settingsLink: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: "underline",
  },
});
