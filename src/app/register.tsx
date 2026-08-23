import MainDropdownMenu from "@/components/DropDown";
import { useUser } from "@/context/useUser";
import { Tokens } from "@/types";
import api from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Stack, useRouter } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as z from "zod";

const registerSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { loginUser } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
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
    try {
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }
      const response = await api.post("/accounts/", data);
      // Use the centralized login function
      await loginUser(response.data as Tokens);
      router.navigate("/");
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <MainDropdownMenu
              trigger={<Text>⋮</Text>}
              items={[
                {
                  label: "Settings",
                  onPress: () => {
                    router.push("/settings");
                  },
                },
              ]}
            />
          ),
        }}
      />
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Register
        </Text>
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
              placeholder="enter your username"
              autoCapitalize="none"
            />
          )}
        />
        {errors.username && (
          <Text style={styles.errorText}>{errors.username.message}</Text>
        )}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="enter your password"
              secureTextEntry
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.errorInput,
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="enter your password"
              secureTextEntry
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}

        <Text style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <Link style={styles.linkText} href="/login">
            Login here.
          </Link>
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Register" onPress={handleSubmit(onSubmit)} />
        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    color: "#000",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 10,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
