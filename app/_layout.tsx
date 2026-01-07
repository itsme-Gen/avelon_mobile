import Page from "../screens/pages/landingscreens";
import SignUp from "../screens/auth/signup";
import SignIn from "../screens/auth/signin";
import ForgotPassword from "@/screens/forgotpassword/email";
import OTP from "@/screens/forgotpassword/otp";
import ResetPassword from "@/screens/forgotpassword/resetpassword";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "../global.css";


export type RootStackParamList = {
  Home: undefined;
  Signup: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  OTP: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Page} options={{headerShown:false}} />
      <Stack.Screen name="Signup" component={SignUp} options={{headerShown:false}} />
      <Stack.Screen name="SignIn" component={SignIn} options={{headerShown:false}} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{headerShown:false}} />
      <Stack.Screen name="OTP" component={OTP} options={{headerShown:false}} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{headerShown:false}} />
    </Stack.Navigator>
  )
}