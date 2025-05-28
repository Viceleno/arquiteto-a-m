
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
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Use setTimeout to avoid deadlocks when we need to fetch additional data
        if (session?.user) {
          setTimeout(() => {
            console.log('Auth state changed:', event);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new Error("Email não confirmado. Por favor, confirme seu email ou desabilite a verificação no painel do Supabase.");
        } else if (error.message === 'Invalid login credentials') {
          throw new Error("Credenciais inválidas. Verifique seu email e senha.");
        } else {
          throw new Error(error.message);
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) {
        if (error.message === 'Email signups are disabled') {
          throw new Error("Cadastros por email estão desabilitados. Ative o cadastro por email no painel do Supabase em Authentication → Providers → Email.");
        } else if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error("Este nome de usuário já está em uso. Escolha outro nome de usuário.");
        } else if (error.message === 'Database error saving new user') {
          throw new Error("Erro ao salvar usuário. Verifique se o nome de usuário já não existe.");
        } else {
          throw new Error(error.message);
        }
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta ou entre diretamente se a confirmação estiver desabilitada.",
      });
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
