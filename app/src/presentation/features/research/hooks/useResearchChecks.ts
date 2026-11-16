import { settings } from '../../../../core/configs/settings';
import { EMPTY_CHECKS_TEXT } from './constants';

type ResearchCheck = {
  id: string;
  title: string;
};

type ResearchChecks = {
  checks: readonly ResearchCheck[];
  emptyText: string | null;
  serverUrl: string;
};

export function useResearchChecks(): ResearchChecks {
  const checks: readonly ResearchCheck[] = [];
  return {
    checks,
    emptyText: checks.length === 0 ? EMPTY_CHECKS_TEXT : null,
    serverUrl: settings.serverUrl,
  };
}
