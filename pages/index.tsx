import React from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { abi } from '../contract-abi';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';
import { parseEther } from 'viem';
import { parse } from 'path';

const contractConfig = {
  address: '0x842c628787e1064b9f27d74a84b10fc59801e312',
  abi,
} as const;

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0n);
  const { isConnected } = useAccount();

  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'safeMint',
    value: parseEther('50')
  });

  const {
    data: mintData,
    write: safeMint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(contractWriteConfig);

  const { data: totalSupplyData } = useContractRead({
    ...contractConfig,
    functionName: 'totalSupply',
    watch: true,
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData);
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ padding: '24px 24px 24px 0' }}>
            <h1>Pepper Heads NFT Mint</h1>
            <p style={{ margin: '12px 0 24px' }}>
              {Number(totalMinted)}/400 minted so far!
            </p>
            <ConnectButton />

            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && !isMinted && (
              <button
                style={{ marginTop: 24 }}
                disabled={!safeMint || isMintLoading || isMintStarted}
                className="button"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={() => safeMint?.()}
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Minting...'}
                {!isMintLoading && !isMintStarted && 'Mint'}
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: '0 0 auto' }}>
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <Image
                layout="responsive"
                src="/nft.jpeg"
                width="500"
                height="500"
                alt="RainbowKit Demo NFT"
              />
              <h1 style={{ marginTop: 24 }}>PepperHeads NFT</h1>
              <ConnectButton />
            </FrontCard>
            <BackCard isCardFlipped={isMinted}>
              <div style={{ padding: 24 }}>
                <Image
                  src="/nft.jpeg"
                  width="80"
                  height="80"
                  alt="PepperHeads NFT"
                  style={{ borderRadius: 8 }}
                />
                <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
                <p style={{ marginBottom: 24 }}>
                  Your NFT will show up in your wallet in the next few minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View tx on{' '}
                  <a href={`https://www.mintscan.io/canto/tx/${mintData?.hash}`}>
                    Mintscan
                  </a>
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{' '}
                  <a href={`https://www.blankrasa.com/${txData?.to}`}>
                    Blank Rasa
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
