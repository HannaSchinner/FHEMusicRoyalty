import type { ContractInfo } from '../types';

interface SystemInfoProps {
  contractInfo: ContractInfo;
}

export default function SystemInfo({ contractInfo }: SystemInfoProps) {
  return (
    <div>
      <h3>📊 System Statistics</h3>
      <div className="info-grid">
        <div className="info-card">
          <h3>Total Tracks</h3>
          <div className="value">{contractInfo.totalTracks}</div>
        </div>
        <div className="info-card">
          <h3>Total Pools</h3>
          <div className="value">{contractInfo.totalPools}</div>
        </div>
        <div className="info-card">
          <h3>Contract Address</h3>
          <div className="value" style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>
            {contractInfo.contractAddress}
          </div>
        </div>
        <div className="info-card">
          <h3>Current Network</h3>
          <div className="value">{contractInfo.currentNetwork}</div>
        </div>
      </div>
    </div>
  );
}
