import { useState } from 'ethers';

interface RegisterRightsHolderProps {
  contract: any;
  account: string | null;
  showMessage: (message: string, type: 'connected' | 'error') => void;
}

export default function RegisterRightsHolder({
  contract,
  account,
  showMessage
}: RegisterRightsHolderProps) {
  const [verifyAddress, setVerifyAddress] = useState('');
  const [rightsHolderInfo, setRightsHolderInfo] = useState<any>(null);

  const handleRegister = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      const tx = await contract.registerRightsHolder();
      await tx.wait();

      showMessage('Rights holder registered successfully!', 'connected');
      await loadRightsHolderInfo();
    } catch (error: any) {
      console.error('Rights holder registration failed:', error);
      showMessage('Registration failed: ' + error.message, 'error');
    }
  };

  const handleVerify = async () => {
    try {
      if (!contract) {
        throw new Error('Please set contract address first');
      }

      if (!verifyAddress) {
        throw new Error('Please enter address');
      }

      const tx = await contract.verifyRightsHolder(verifyAddress);
      await tx.wait();

      showMessage('Rights holder verified successfully!', 'connected');
    } catch (error: any) {
      console.error('Rights holder verification failed:', error);
      showMessage('Verification failed: ' + error.message, 'error');
    }
  };

  const loadRightsHolderInfo = async () => {
    try {
      if (!contract || !account) return;

      const [verified, registeredAt, trackIds] = await contract.getRightsHolderInfo(account);

      setRightsHolderInfo({
        verified,
        registeredAt: new Date(Number(registeredAt) * 1000).toLocaleString(),
        trackCount: trackIds.length
      });
    } catch (error) {
      console.error('Failed to load rights holder info:', error);
    }
  };

  return (
    <div>
      <h3>🎯 Register as Rights Holder</h3>
      <div className="form-group">
        <button onClick={handleRegister} className="btn">
          Register Rights Holder
        </button>
      </div>
      <div className="form-group">
        <label>Verify Rights Holder Address:</label>
        <input
          type="text"
          value={verifyAddress}
          onChange={(e) => setVerifyAddress(e.target.value)}
          placeholder="Enter address to verify"
        />
        <button onClick={handleVerify} className="btn btn-secondary">
          Verify Rights Holder
        </button>
      </div>
      {rightsHolderInfo && (
        <div className="info-card">
          <h4>Rights Holder Status</h4>
          <p><strong>Verification Status:</strong> {rightsHolderInfo.verified ? 'Verified' : 'Not Verified'}</p>
          <p><strong>Registration Time:</strong> {rightsHolderInfo.registeredAt}</p>
          <p><strong>Number of Tracks:</strong> {rightsHolderInfo.trackCount}</p>
        </div>
      )}
    </div>
  );
}
