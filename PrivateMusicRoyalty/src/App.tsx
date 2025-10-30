import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './lib/contract';
import ConnectWallet from './components/ConnectWallet';
import RegisterRightsHolder from './components/RegisterRightsHolder';
import RegisterTrack from './components/RegisterTrack';
import CreateRoyaltyPool from './components/CreateRoyaltyPool';
import ClaimRoyalty from './components/ClaimRoyalty';
import SystemInfo from './components/SystemInfo';
import type { WalletStatus, ContractInfo } from './types';

function App() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    connected: false,
    account: null,
    message: '',
    type: ''
  });
  const [activeTab, setActiveTab] = useState<string>('register');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo>({
    totalTracks: '-',
    totalPools: '-',
    contractAddress: CONTRACT_ADDRESS,
    currentNetwork: '-'
  });

  const handleWalletConnect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const userAccount = accounts[0];

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(web3Contract);

      setWalletStatus({
        connected: true,
        account: userAccount,
        message: `Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`,
        type: 'connected'
      });

      await loadContractInfo(web3Contract, web3Provider);
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setWalletStatus({
        connected: false,
        account: null,
        message: 'Connection failed: ' + error.message,
        type: 'error'
      });
    }
  };

  const loadContractInfo = async (
    contractInstance: ethers.Contract,
    providerInstance: ethers.BrowserProvider
  ) => {
    try {
      const [totalTracks, totalPools] = await contractInstance.getContractInfo();
      const network = await providerInstance.getNetwork();

      setContractInfo({
        totalTracks: totalTracks.toString(),
        totalPools: totalPools.toString(),
        contractAddress: CONTRACT_ADDRESS,
        currentNetwork: network.name
      });
    } catch (error) {
      console.error('Failed to load contract info:', error);
    }
  };

  const showMessage = (message: string, type: 'connected' | 'error') => {
    setWalletStatus(prev => ({
      ...prev,
      message,
      type
    }));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎵 Private Music Royalty Distribution System</h1>
        <p>Privacy-Preserving Music Revenue Distribution Platform Based on Zama FHE</p>
      </div>

      <div className="card">
        <ConnectWallet
          walletStatus={walletStatus}
          onConnect={handleWalletConnect}
        />

        {walletStatus.connected && (
          <div id="mainContent">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                Register Rights Holder
              </button>
              <button
                className={`tab ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Register Track
              </button>
              <button
                className={`tab ${activeTab === 'pool' ? 'active' : ''}`}
                onClick={() => setActiveTab('pool')}
              >
                Create Pool
              </button>
              <button
                className={`tab ${activeTab === 'claim' ? 'active' : ''}`}
                onClick={() => setActiveTab('claim')}
              >
                Claim Royalty
              </button>
              <button
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                System Info
              </button>
            </div>

            <div className={`tab-content ${activeTab === 'register' ? 'active' : ''}`}>
              <RegisterRightsHolder
                contract={contract}
                account={walletStatus.account}
                showMessage={showMessage}
              />
            </div>

            <div className={`tab-content ${activeTab === 'track' ? 'active' : ''}`}>
              <RegisterTrack
                contract={contract}
                showMessage={showMessage}
              />
            </div>

            <div className={`tab-content ${activeTab === 'pool' ? 'active' : ''}`}>
              <CreateRoyaltyPool
                contract={contract}
                showMessage={showMessage}
              />
            </div>

            <div className={`tab-content ${activeTab === 'claim' ? 'active' : ''}`}>
              <ClaimRoyalty
                contract={contract}
                showMessage={showMessage}
              />
            </div>

            <div className={`tab-content ${activeTab === 'info' ? 'active' : ''}`}>
              <SystemInfo contractInfo={contractInfo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
