import './App.css';
import { UseCennznet } from '@cennznet/api/hooks/useCennznet';
import { useEffect, useState } from "react";
import { web3FromSource } from '@polkadot/extension-dapp';
import Modal from "./components/modal/modal";
import logo from './assets/cennznet-logo-light.svg'

const collectionId = 'Centrality Team Sheep';

function NFTCollection(props) {
  const [tokenInfo, setTokenInfo] = useState(undefined);
  const [cardHovered, setCardHovered] = useState(true);
  const [nftAttribute, setNftAttribute] = useState(undefined);
  const [tokenOwner, setTokenOwner] = useState(undefined);
  const [tokenOwnerName, setTokenOwnerName] = useState(undefined);
  const {api, allAccounts} = props;
  const toggleHover = () => setCardHovered(!cardHovered);
  const addToken = async() => {
      const account = allAccounts[0];
      const attributes = [
          {'Url': nftAttribute}, {'Text': tokenOwnerName}];
      const tokenExtrinsic = api.tx.nft.createToken(collectionId, tokenOwner, attributes, null);
      const injector = await web3FromSource(account.meta.source);
      tokenExtrinsic.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
          if (status.isInBlock) {
              console.log(`Completed at block hash #${status.asInBlock.toString()}`);
              alert(`Completed at block hash #${status.asInBlock.toString()}`)
          }
      }).catch((error) => {
          console.log(':( transaction failed', error);
          alert(':( transaction failed ' + error)
      });
  }

  useEffect( () => {
    async function fetch() {
        const tokenInfos = await api.derive.nft.tokenInfoForCollection(collectionId);
        setTokenInfo(tokenInfos);
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
                      alt="Not Found"
                  />
                </div>
              </div>
              <div className="flip-card-back">
                <h3>Token Number: {tokenId}</h3>
                <h3>Token Name: {tokenDetails[1].Text}</h3>
                <h3>Token Owner:</h3>
                <p>{owner}</p>
              </div>
            </div>
          </div>
          )
        })}
          <Modal
              title={"Add To Collection"}
              btnId={"createNFT"}
              nftAttributeHandler={setNftAttribute}
              tokenOwnerHandler={setTokenOwner}
              tokenOwnerNameHandler={setTokenOwnerName}
              addTokenHandler={addToken}
          />
      </div>
  );
}

function App() {
  const [api, setApi] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);

  useEffect( () => {
      async function initializeAPIExtension() {
          const {api, accounts} = await UseCennznet('my nft dapp', {network: 'rata'})
          setApi(api);
          setAccounts(accounts);
      }
      initializeAPIExtension()
  },[]);

  if (!api) {
    return null;
  }

  return (
    <div className="App">
      <div>
          <div className="navbar">
          <img src={logo} className="logo" width="60px" height="60px" alt={"Not Found"}/>
            <h1 className="neonText neonTitle">NFT DEMO</h1>
            <button id="createNFT" className="neon-button">Create</button>
          </div>
        <h3 className="neonText">Collection: {collectionId}</h3>
      </div>
      <NFTCollection api={api} allAccounts={accounts}></NFTCollection>
    </div>
  );
}

export default App;
