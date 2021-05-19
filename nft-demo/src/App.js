import './App.css';
import { TypeRegistry } from '@polkadot/types';
import {Api as ApiPromise} from '@cennznet/api';
import {useEffect, useState} from "react";
import * as nft from './nft';
const registry = new TypeRegistry();
const url = 'wss://kong2.centrality.me/public/rata/ws';

function App() {
  const [tokenInfo, setTokenInfo] = useState(undefined);

  useEffect(() => {
    const derives = { nft };
    const api = new ApiPromise({provider: url, registry, derives});
    api.on('ready', async () => {
      console.log('API:::',api);
      const collectionId = 'kenya_1';
      const tokenInfos = await api.derive.nft.tokenInfoForCollection(collectionId);
      tokenInfos.map(({tokenId, tokenDetails, owner}) => {
        console.log('tokenId:',tokenId.toString());
        console.log('tokenDetails:', tokenDetails.toString());
        console.log('Owner:', owner.toString());
        return tokenId;
      });
      setTokenInfo(tokenInfo);
    });
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={"https://www.financemagnates.com/wp-content/uploads/2021/03/nft-01.png"} alt="logo" />
        <p>
          NFT DEMO
        </p>
        <a
          className="App-link"
          href="https://www.financemagnates.com/wp-content/uploads/2021/03/nft-01.png"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
