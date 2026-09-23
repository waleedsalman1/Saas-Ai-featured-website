"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onsubmit = async () => {
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onError: (ctx) => {
          window.alert(ctx.error.message || "Warning: Failed to create user");
        },
        onSuccess: () => {
          window.alert("User created successfully!");
        },
      }
    );
  };

  const onlogin = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx) => {
          window.alert(ctx.error.message || "Warning: Login failed");
        },
        onSuccess: () => {
          window.alert("Logged in successfully!");
        },
      }
    );
  };

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-muted/30 p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome back, {session.user?.name}!</CardTitle>
            <CardDescription>You are successfully logged in.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => authClient.signOut()}
              variant="destructive"
              className="w-full"
            >
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onlogin} className="w-full">
                Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create a new account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <Input
                  id="register-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onsubmit} className="w-full">
                Create account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
