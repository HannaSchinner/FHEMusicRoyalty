import { useState } from 'react';

interface ClaimRoyaltyProps {
  contract: any;
  showMessage: (message: string, type: 'connected' | 'error') => void;
}

export default function ClaimRoyalty({ contract, showMessage }: ClaimRoyaltyProps) {
  const [poolId, setPoolId] = useState('');

  const handleDistribute = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      if (!poolId) {
        throw new Error('Please enter pool ID');
      }

      const tx = await contract.distributeRoyalties(poolId);
      await tx.wait();

      showMessage('Royalties distributed successfully!', 'connected');
    } catch (error: any) {
      console.error('Distribution failed:', error);
      showMessage('Distribution failed: ' + error.message, 'error');
    }
  };

  const handleClaim = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      if (!poolId) {
        throw new Error('Please enter pool ID');
      }

      const tx = await contract.claimRoyalty(poolId);
      await tx.wait();

      showMessage('Royalty claimed successfully!', 'connected');
    } catch (error: any) {
      console.error('Claim failed:', error);
      showMessage('Claim failed: ' + error.message, 'error');
    }
  };

  return (
    <div>
      <h3>🎁 Claim Royalty Revenue</h3>
      <div className="form-group">
        <label>Pool ID:</label>
        <input
          type="number"
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
          placeholder="Pool ID"
          min="1"
        />
      </div>
      <button onClick={handleDistribute} className="btn btn-secondary">
        Distribute Royalties
      </button>
      <button onClick={handleClaim} className="btn btn-success" style={{ marginLeft: '10px' }}>
        Claim My Royalty
      </button>
    </div>
  );
}
