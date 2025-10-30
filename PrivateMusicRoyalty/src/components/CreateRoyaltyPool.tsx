import { useState } from 'react';
import { ethers } from 'ethers';

interface CreateRoyaltyPoolProps {
  contract: any;
  showMessage: (message: string, type: 'connected' | 'error') => void;
}

export default function CreateRoyaltyPool({ contract, showMessage }: CreateRoyaltyPoolProps) {
  const [trackId, setTrackId] = useState('');
  const [amount, setAmount] = useState('');

  const handleCreatePool = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      if (!trackId || !amount) {
        throw new Error('Please enter track ID and amount');
      }

      const value = ethers.parseEther(amount);
      const tx = await contract.createRoyaltyPool(trackId, { value });
      await tx.wait();

      showMessage('Royalty pool created successfully!', 'connected');

      setTrackId('');
      setAmount('');
    } catch (error: any) {
      console.error('Pool creation failed:', error);
      showMessage('Creation failed: ' + error.message, 'error');
    }
  };

  return (
    <div>
      <h3>💰 Create Royalty Pool</h3>
      <div className="form-group">
        <label>Select Track ID:</label>
        <input
          type="number"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="Track ID"
          min="1"
        />
      </div>
      <div className="form-group">
        <label>Pool Amount (ETH):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          step="0.001"
          min="0.001"
        />
      </div>
      <button onClick={handleCreatePool} className="btn btn-success">
        Create Pool
      </button>
    </div>
  );
}
