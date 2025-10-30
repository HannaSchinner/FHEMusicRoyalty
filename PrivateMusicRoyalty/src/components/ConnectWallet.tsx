import type { WalletStatus } from '../types';

interface ConnectWalletProps {
  walletStatus: WalletStatus;
  onConnect: () => void;
}

export default function ConnectWallet({ walletStatus, onConnect }: ConnectWalletProps) {
  return (
    <div className="connect-wallet">
      <button
        id="connectWallet"
        className="btn"
        onClick={onConnect}
        disabled={walletStatus.connected}
      >
        {walletStatus.connected ? 'Connected' : 'Connect Wallet'}
      </button>
      {walletStatus.message && (
        <div className={`status ${walletStatus.type}`}>
          {walletStatus.message}
        </div>
      )}
    </div>
  );
}
