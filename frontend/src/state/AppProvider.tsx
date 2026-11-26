import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { loginRequest, logoutRequest } from '../services/auth';
import {
  createContract,
  getContractHistory,
  getContracts,
  updateContract,
} from '../services/contracts';
import type {
  AuditRecord,
  Contract,
  ContractDraft,
  Session,
} from '../types/contract';
import { parseDate } from '../utils/contractForm';
import { parseAmount } from '../utils/contracts';
import { getUsers, type ResponsibleUser } from '../services/users';

type AppState = {
  session: Session | null;
  contracts: Contract[];
  users: ResponsibleUser[];
  audit: AuditRecord[];
  toast: string;
  loading: boolean;
  login: (email: string, password: string, sector: string) => Promise<void>;
  logout: () => void;
  save: (draft: ContractDraft, id?: string) => Promise<string>;
  refreshContracts: () => Promise<void>;
};

type ContractHistoryResponse = {
  id: string;
  contractId: string;
  timestamp: string;
  field: string;
  previousValue: string | null;
  currentValue: string | null;
  name: string;
  email?: string;
};

const AppContext = createContext<AppState | null>(null);

function getInitials(name: string) {
  return (
      name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0] ?? '')
          .join('')
          .toUpperCase() || 'US'
  );
}

function mapHistoryRecord(record: ContractHistoryResponse): AuditRecord {
  const name = record.name || 'Usuário não identificado';
  const field = record.field || 'Informação do contrato';

  return {
    id: record.id,
    contractId: record.contractId,
    initials: getInitials(name),
    name,
    action:
        field.toLowerCase() === 'cadastro'
            ? 'criou este contrato'
            : `alterou ${field.toLowerCase()}`,
    detail:
        field.toLowerCase() === 'cadastro'
            ? 'Registro inicial incluído no sistema.'
            : `${field} atualizado.`,
    field,
    previousValue: record.previousValue ?? 'Não existente',
    currentValue: record.currentValue ?? '—',
    source: 'Registro do banco de dados',
    date: new Date(record.timestamp).toLocaleString('pt-BR'),
    tone: field.toLowerCase() === 'cadastro' ? 'gray' : 'blue',
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<ResponsibleUser[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function refreshContracts() {
    const [contractsData, usersData] = await Promise.all([getContracts(), getUsers()]);
    setUsers(usersData);

    // O backend disponibiliza o histórico por contrato, não em /api/audit.
    const histories = await Promise.all(
        contractsData.map((contract) =>
            getContractHistory(contract.id) as Promise<ContractHistoryResponse[]>
        )
    );

    const auditRecords = histories
        .flat()
        .sort(
            (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .map(mapHistoryRecord);

    setContracts(contractsData);
    setAudit(auditRecords);
  }

  async function login(
      email: string,
      password: string,
      sector: string
  ): Promise<void> {
    setLoading(true);

    try {
      const { session: authenticatedSession } = await loginRequest(
          email.trim(),
          password,
          sector
      );

      setSession(authenticatedSession);
      await refreshContracts();
      setToast('Login realizado com sucesso');
    } catch (error) {
      logoutRequest();
      setSession(null);
      setContracts([]);
      setUsers([]);
      setAudit([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutRequest();
    setSession(null);
    setContracts([]);
    setUsers([]);
    setAudit([]);
    setToast('');
  }

  async function save(draft: ContractDraft, id?: string): Promise<string> {
    const payload = {
      title: draft.title.trim(),
      process: draft.process.trim(),
      modality: draft.modality,
      description: draft.description.trim(),
      startsAt: parseDate(draft.startsAt),
      endsAt: parseDate(draft.endsAt),
      amount: parseAmount(draft.amount),
      unit: draft.unit,
      managerId: draft.managerId,
      inspectorId: draft.inspectorId,
    };

    if (!payload.startsAt || !payload.endsAt) {
      throw new Error('Informe datas válidas para o contrato.');
    }

    if (payload.amount === null) {
      throw new Error('Informe um valor válido para o contrato.');
    }

    setLoading(true);

    try {
      const saved = id
          ? await updateContract(id, payload)
          : await createContract(payload);

      await refreshContracts();

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
            users,
            audit,
            toast,
            loading,
            login,
            logout,
            save,
            refreshContracts,
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
