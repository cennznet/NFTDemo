import './App.css';
import { TypeRegistry } from '@polkadot/types';
import {Api as ApiPromise} from '@cennznet/api';
import {useEffect, useState} from "react";
import * as nft from './nft';
const registry = new TypeRegistry();
const url = 'wss://kong2.centrality.me/public/rata/ws';

function NFTCollection(props) {
  const [tokenInfo, setTokenInfo] = useState(undefined);
  const collectionId = 'centrality_team_1';
  const {api} = props;
  useEffect( () => {
    async function fetch() {
      if (api) {
        const tokenInfos = await api.derive.nft.tokenInfoForCollection(collectionId);
        setTokenInfo(tokenInfos);
      }
    }
    fetch();
  })
  return (
      <div>
      <h1>Collection, {collectionId}</h1>
      <table>
        {tokenInfo?.map(({tokenId, tokenDetails, owner}) => (
            <tr key={tokenId.toString()}>
              <td>
                {tokenId.toString()}
              </td>
              <td >
                {tokenDetails.toString()}
              </td>
              <td>
                {owner.toString()}
              </td>
            </tr>
        ))}
      </table>
      </div>
  );
}

function App() {
  const [api, setApi] = useState(undefined);

  useEffect( () => {
    const derives = {nft};
    const api = new ApiPromise({provider: url, registry, derives});
    api.on('ready', async () => {
      setApi(api);
    });
  });

  if (!api) {
    return null;
  }

  return (
      <NFTCollection api={api}></NFTCollection>
  );
}

export default App;
