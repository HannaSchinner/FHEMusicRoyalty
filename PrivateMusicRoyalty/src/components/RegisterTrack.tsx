import { useState } from 'react';
import type { RightsHolder } from '../types';

interface RegisterTrackProps {
  contract: any;
  showMessage: (message: string, type: 'connected' | 'error') => void;
}

export default function RegisterTrack({ contract, showMessage }: RegisterTrackProps) {
  const [metadataUri, setMetadataUri] = useState('');
  const [holderAddress, setHolderAddress] = useState('');
  const [holderShare, setHolderShare] = useState('');
  const [rightsHolders, setRightsHolders] = useState<RightsHolder[]>([]);

  const addHolder = () => {
    const share = parseInt(holderShare);

    if (!holderAddress || !share || share < 1 || share > 10000) {
      alert('Please enter valid address and share (1-10000)');
      return;
    }

    setRightsHolders([...rightsHolders, { address: holderAddress, share }]);
    setHolderAddress('');
    setHolderShare('');
  };

  const removeHolder = (index: number) => {
    setRightsHolders(rightsHolders.filter((_, i) => i !== index));
  };

  const getTotalShares = () => {
    return rightsHolders.reduce((sum, holder) => sum + holder.share, 0);
  };

  const handleRegisterTrack = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      if (!metadataUri) {
        throw new Error('Please enter metadata URI');
      }

      if (rightsHolders.length === 0) {
        throw new Error('Please add at least one rights holder');
      }

      const totalShares = getTotalShares();
      if (totalShares !== 10000) {
        throw new Error('Total shares must equal 10000');
      }

      const addresses = rightsHolders.map(h => h.address);
      const shares = rightsHolders.map(h => h.share);

      const tx = await contract.registerTrack(metadataUri, addresses, shares);
      await tx.wait();

      showMessage('Track registered successfully!', 'connected');

      setMetadataUri('');
      setRightsHolders([]);
    } catch (error: any) {
      console.error('Track registration failed:', error);
      showMessage('Registration failed: ' + error.message, 'error');
    }
  };

  const totalShares = getTotalShares();

  return (
    <div>
      <h3>🎼 Register Music Track</h3>
      <div className="form-group">
        <label>Music Metadata URI:</label>
        <input
          type="text"
          value={metadataUri}
          onChange={(e) => setMetadataUri(e.target.value)}
          placeholder="IPFS link or metadata URI"
        />
      </div>
      <div className="form-group">
        <label>Rights Holders List:</label>
        <div className="rights-holder-form">
          <input
            type="text"
            value={holderAddress}
            onChange={(e) => setHolderAddress(e.target.value)}
            placeholder="Rights holder address"
          />
          <input
            type="number"
            value={holderShare}
            onChange={(e) => setHolderShare(e.target.value)}
            placeholder="Share (0-10000)"
            min="1"
            max="10000"
          />
          <button type="button" onClick={addHolder} className="btn btn-secondary">
            Add
          </button>
        </div>
        {rightsHolders.length > 0 && (
          <div className="rights-holder-list">
            <h4>Rights Holders List</h4>
            <div>
              {rightsHolders.map((holder, index) => (
                <div key={index} className="rights-holder-item">
                  <span>{holder.address.substring(0, 10)}... ({holder.share})</span>
                  <button className="remove-btn" onClick={() => removeHolder(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '10px',
                fontWeight: 'bold',
                color: totalShares === 10000 ? 'green' : 'red'
              }}
            >
              Total Shares: {totalShares} / 10000
            </div>
          </div>
        )}
      </div>
      <button onClick={handleRegisterTrack} className="btn btn-success">
        Register Track
      </button>
    </div>
  );
}
