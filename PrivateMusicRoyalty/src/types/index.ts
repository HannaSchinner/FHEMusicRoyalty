export interface RightsHolder {
  address: string;
  share: number;
}

export interface WalletStatus {
  connected: boolean;
  account: string | null;
  message: string;
  type: 'connected' | 'error' | '';
}

export interface ContractInfo {
  totalTracks: string;
  totalPools: string;
  contractAddress: string;
  currentNetwork: string;
}
