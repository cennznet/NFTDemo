import './App.css';
import { TypeRegistry } from '@polkadot/types';
import {Api as ApiPromise} from '@cennznet/api';
import {useEffect, useState} from "react";
import * as nft from './nft';
const registry = new TypeRegistry();

const url = 'wss://kong2.centrality.me/public/rata/ws';
const collectionId = 'centrality_team_1';

function NFTCollection(props) {
  const [tokenInfo, setTokenInfo] = useState(undefined);
  const [cardHovered, setCardHovered] = useState(true);

  const toggleHover = () => setCardHovered(!cardHovered);

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
      <div className='nft_container'>
        {tokenInfo?.map(({tokenId, tokenDetails, owner}) => {
          tokenId = tokenId.toString()
          tokenDetails = JSON.parse(tokenDetails.toString())
          owner = owner.toString()
          return (
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div>
                  <img
                      key={tokenId}
                      width="300px"
                      height="300px"
                      src={tokenDetails[0].Url}
                      onMouseEnter={toggleHover}
                      onMouseLeave={toggleHover}
                      alt="Image Not Found"
                  />
                </div>
              </div>
              <div className="flip-card-back">
                <h3>Token Number {tokenId}</h3>
                <h3>Token Owner</h3>
                <p>{owner}</p>
              </div>
            </div>
          </div>
          )
        })}
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
    <div className="App">
      <div>
        <h1 className="neonText"> NFT DEMO</h1>
        <h3 className="neonText">Collection: {collectionId}</h3>
      </div>
      <NFTCollection api={api}></NFTCollection>
    </div>
  );
}

export default App;
