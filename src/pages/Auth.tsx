
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Login Form Schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

// Register Form Schema
const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter no mínimo 3 caracteres'),
  full_name: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setLoginError(null);
    setProcessingMessage("Entrando...");
    try {
      await signIn(data.email, data.password);
      setProcessingMessage("Login bem-sucedido! Redirecionando...");
    } catch (error: any) {
      // O erro de email não confirmado já está sendo tratado no AuthContext
      if (error.message !== 'Email not confirmed') {
        setLoginError(error.message);
      } else {
        setProcessingMessage("Tentando confirmar seu email automaticamente...");
        // A tentativa de confirmação automática acontece no AuthContext
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setProcessingMessage("Cadastrando...");
    try {
      const { username, full_name, email, password } = data;
      await signUp(email, password, { username, full_name });
      setRegisterSuccess(true);
      setProcessingMessage("Cadastro realizado! Tentando confirmar seu email automaticamente...");
      setTab("login");
      registerForm.reset();
      
      // Aguardar alguns segundos e então tentar fazer login automático
      setTimeout(() => {
        loginForm.setValue("email", email);
        loginForm.setValue("password", password);
        setProcessingMessage("Tentando fazer login automaticamente...");
        onLoginSubmit({ email, password });
      }, 2500);
    } catch (error: any) {
      setProcessingMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if user is logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Calculadora de Arquitetura</CardTitle>
          <CardDescription className="text-center">Entre ou crie sua conta para salvar seus cálculos</CardDescription>
        </CardHeader>
        <CardContent>
          {processingMessage && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                {processingMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue={tab} value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              {registerSuccess && tab === "login" && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Cadastro realizado com sucesso! Tentando fazer login automaticamente...
                  </AlertDescription>
                </Alert>
              )}
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="seu@email.com" />
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
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="********" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processando..." : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="seunome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Seu Nome Completo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="seu@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="********" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="********" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Cadastrando..." : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Cadastrar
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500">
            Calculadora profissional para arquitetos
          </p>
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-xs">
              Para desenvolvimento: Você pode desabilitar a verificação de email no painel do Supabase para login mais rápido.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
