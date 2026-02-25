import { signUp } from "@/lib/auth-client";
import { RegisterActionData } from "@/lib/schemas/auth";

export async function signUpAction(registerData: RegisterActionData) {
  const { email, password, firstName, name } = registerData;

  const { data, error } = await signUp.email(
    {
      email,
      password,
      name: `${firstName} ${name}`,
      callbackURL: "/dashboard",
    },
    {
      onRequest: (ctx) => {
        console.log("Requesting...", ctx);
      },
      onSuccess: (ctx) => {
        console.log("Success...", ctx);
        console.log("data", data);
        console.log("error", error);
      },
      onError: (ctx) => {
        console.log("Error...", ctx);
        console.log("data", data);
        console.log("error", error);
      },
    }
  );
}
