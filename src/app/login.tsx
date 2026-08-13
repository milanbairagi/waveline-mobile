import { useUser } from "@/context/useUser";
import { Tokens } from "@/types";
import api from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as z from "zod";

const loginSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { loginUser } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
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
      // Use the centralized login function
      await loginUser(response.data as Tokens);
      router.navigate("/");
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
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
});
