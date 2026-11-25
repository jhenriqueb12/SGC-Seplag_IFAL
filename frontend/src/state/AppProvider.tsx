
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuditRecord,
  Contract,
  ContractDraft,
  Session,
} from '../types/contract';

type AppState = {
  session: Session | null;
  contracts: Contract[];
  audit: AuditRecord[];
  toast: string;
  loading: boolean;
  login: (email: string, password: string, sector: string) => Promise<void>;
  logout: () => void;
  save: (draft: ContractDraft, id?: string) => Promise<string>;
  refresh: () => Promise<void>;
};

type LoginResponse = {
  token: string;
  user: {
    email: string;
    sector: string;
  };
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        'URL da API não configurada. Defina EXPO_PUBLIC_API_URL.'
      );
    }

    return API_URL.replace(/\/$/, '');
  }

  async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken: string | null = token
  ): Promise<T> {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Erro na API: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async function refresh(authToken: string | null = token) {
    if (!authToken) return;

    setLoading(true);

    try {
      const [contractsData, auditData] = await Promise.all([
        request<Contract[]>('/api/contracts', {}, authToken),
        request<AuditRecord[]>('/api/audit', {}, authToken),
      ]);

      setContracts(contractsData);
      setAudit(auditData);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    email: string,
    password: string,
    sector: string
  ) {
    setLoading(true);

    try {
      const response = await request<LoginResponse>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, sector }),
        },
        null
      );

      if (!response.token || !response.user) {
        throw new Error('Resposta de autenticação inválida.');
      }

      setToken(response.token);
      setSession({
        email: response.user.email,
        sector: response.user.sector,
      });

      await refresh(response.token);
      setToast('Login realizado com sucesso');
    } catch (error) {
      setToken(null);
      setSession(null);
      setContracts([]);
      setAudit([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
    setToken(null);
    setContracts([]);
    setAudit([]);
    setToast('');
  }

  async function save(draft: ContractDraft, id?: string): Promise<string> {
    if (!token) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    setLoading(true);

    try {
      const saved = await request<Contract>(
        id ? `/api/contracts/${id}` : '/api/contracts',
        {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(draft),
        }
      );

      // O backend é a fonte oficial dos dados e da auditoria.
      await refresh(token);

      setToast(
        id
          ? 'Contrato atualizado com sucesso'
          : 'Contrato cadastrado com sucesso'
      );

      return saved.id;
    } catch (error) {
      setToast('Não foi possível salvar o contrato');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppContext.Provider
      value={{
        session,
        contracts,
        audit,
        toast,
        loading,
        login,
        logout,
        save,
        refresh: () => refresh(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const state = useContext(AppContext);

  if (!state) {
    throw new Error('AppProvider ausente');
  }

  return state;
}



