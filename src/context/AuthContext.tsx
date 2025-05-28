
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erro de login:', error);
        if (error.message === 'Email not confirmed') {
          throw new Error("Seu email ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação, ou peça para o administrador desabilitar a confirmação de email nas configurações do Supabase.");
        } else if (error.message === 'Invalid login credentials') {
          throw new Error("Email ou senha incorretos. Verifique suas credenciais e tente novamente.");
        } else {
          throw new Error(`Erro ao fazer login: ${error.message}`);
        }
      }
      
      console.log('Login realizado com sucesso');
    } catch (error: any) {
      console.error('Erro no processo de login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Tentando cadastrar usuário:', email);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) {
        console.error('Erro de cadastro:', error);
        if (error.message === 'User already registered') {
          throw new Error("Este email já está cadastrado. Tente fazer login ou use outro email.");
        } else if (error.message === 'Signup is disabled') {
          throw new Error("Cadastros estão desabilitados. Entre em contato com o administrador.");
        } else if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error("Este nome de usuário já está em uso. Escolha outro nome de usuário.");
        } else {
          throw new Error(`Erro ao cadastrar: ${error.message}`);
        }
      }
      
      if (data.user && !data.session) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta antes de fazer login.",
        });
      } else if (data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você já está logado e pode usar a aplicação.",
        });
      }
      
      console.log('Cadastro realizado com sucesso');
      
    } catch (error: any) {
      console.error('Erro no processo de cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da aplicação com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
