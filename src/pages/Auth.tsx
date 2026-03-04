import { useState } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Mail, Lock, User, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { forgotPassword, resetPassword } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState<"idle" | "email" | "otp" | "done">("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  // If already logged in, redirect away
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/scholarships";

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast({ title: "Login successful", description: "Welcome back!" });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await register(values.fullName, values.email, values.password);
      toast({ title: "Account created", description: "Welcome to ScholarHub!" });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSendOtp = async () => {
    if (!resetEmail) return;
    setIsLoading(true);
    try {
      const res = await forgotPassword(resetEmail);
      toast({ title: "OTP sent", description: res.message });
      // Dev mode: if OTP is returned, auto-fill it
      if (res._dev_otp) setResetOtp(res._dev_otp);
      setForgotMode("otp");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetOtp || !newPassword) return;
    setIsLoading(true);
    try {
      await resetPassword(resetEmail, resetOtp, newPassword);
      toast({ title: "Password reset successful!", description: "You can now log in." });
      setForgotMode("idle");
      setResetEmail("");
      setResetOtp("");
      setNewPassword("");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password UI
  if (forgotMode !== "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {forgotMode === "email" ? "Enter your email to receive an OTP" : "Enter the OTP and your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {forgotMode === "email" && (
              <>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleForgotSendOtp} disabled={isLoading || !resetEmail}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                </Button>
              </>
            )}
            {forgotMode === "otp" && (
              <>
                <div>
                  <label className="text-sm font-medium">OTP Code</label>
                  <Input placeholder="Enter 6-digit OTP" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} maxLength={6} />
                </div>
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleResetPassword} disabled={isLoading || !resetOtp || newPassword.length < 6}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
                </Button>
              </>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setForgotMode("idle")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="relative w-full max-w-md">
        <CardHeader className="text-center">
          <Button variant="ghost" size="sm" className="absolute left-4 top-4" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </Button>

          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>

          <CardTitle className="font-display text-2xl">
            Welcome to ScholarHub
          </CardTitle>
          <CardDescription>
            Discover scholarships tailored for you
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="mt-4 space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">

                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="you@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setForgotMode("email")}
                  >
                    Forgot Password?
                  </Button>

                </form>
              </Form>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="mt-4 space-y-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">

                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="John Doe" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="you@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>

                </form>
              </Form>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;