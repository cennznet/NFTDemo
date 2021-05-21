import './App.css';
import { TypeRegistry } from '@polkadot/types';
import {Api as ApiPromise} from '@cennznet/api';
import {useEffect, useState} from "react";
import * as nft from './nft';
import {web3Accounts, web3Enable, web3FromSource} from '@polkadot/extension-dapp';
import {cennznetExtensions} from "./cennznetExtensions";
import {getSpecTypes} from '@polkadot/types-known';
import {defaults as addressDefaults} from '@polkadot/util-crypto/address/defaults';
import Modal from "./components/modal/modal";
import logo from './assets/cennznet-logo-light.svg'

const registry = new TypeRegistry();
const url = 'wss://kong2.centrality.me/public/rata/ws';
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

async function extractMeta(api) {
  const systemChain = await api.rpc.system.chain();
  const specTypes = getSpecTypes(
      api.registry,
      systemChain,
      api.runtimeVersion.specName,
      api.runtimeVersion.specVersion
  );
  if (specTypes.ExtrinsicSignatureV4) {
    delete specTypes.ExtrinsicSignatureV4;
  }
  if (specTypes.SignerPayload) {
    delete specTypes.SignerPayload;
  }
  if (specTypes.ExtrinsicPayloadV4) {
    delete specTypes.ExtrinsicPayloadV4;
  }
  const DEFAULT_SS58 = api.registry.createType('u32', addressDefaults.prefix);
  const DEFAULT_DECIMALS = api.registry.createType('u32', 4);
  const metadata = {
        chain: systemChain,
        color: '#191a2e',
        genesisHash: api.genesisHash.toHex(),
        icon: 'CENNZnet',
        metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString('base64'),
        specVersion: api.runtimeVersion.specVersion.toNumber(),
        ss58Format: DEFAULT_SS58.toNumber(),
        tokenDecimals: DEFAULT_DECIMALS.toNumber(),
        tokenSymbol: 'CENNZ',
        types: specTypes,
        userExtensions: cennznetExtensions,
      };
  return metadata;
}

function App() {
  const [api, setApi] = useState(undefined);
  const [allAccounts, setAllAccounts] = useState(undefined);

  useEffect( () => {
    const derives = {nft};
    const api = new ApiPromise({provider: url, registry, derives});
    api.on('ready', async () => {
      const extensions = await web3Enable('my nft dapp');
      const polkadotExtension = extensions.find(ext => ext.name === 'polkadot-js');
      const metadata = polkadotExtension.metadata;
      const checkIfMetaUpdated =  localStorage.getItem(`EXTENSION_META_UPDATED`);
      if (!checkIfMetaUpdated) {
          const metadataDef = await extractMeta(api);
          await metadata.provide(metadataDef);
          localStorage.setItem(`EXTENSION_META_UPDATED`, 'true');
      }
      if (extensions.length === 0) {
        alert('Please install CENNZnet extension');
      }
      const allAccounts = await web3Accounts();
      setAllAccounts(allAccounts);
      setApi(api);
    });
  });

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
      <NFTCollection api={api} allAccounts={allAccounts}></NFTCollection>
    </div>
  );
}

export default App;
