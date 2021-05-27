import './App.css';
import { TypeRegistry } from '@polkadot/types';
import {Api as ApiPromise} from '@cennznet/api';
import {useEffect, useState} from "react";
import {web3Accounts, web3Enable, web3FromSource} from '@polkadot/extension-dapp';
import {cennznetExtensions} from "./cennznetExtensions";
import {getSpecTypes} from '@polkadot/types-known';
import {defaults as addressDefaults} from '@polkadot/util-crypto/address/defaults';
import { Keyring } from '@polkadot/keyring';
import Modal from "./components/modal/modal";
import logo from './assets/cennznet-logo-light.svg'

const registry = new TypeRegistry();
const url = 'wss://kong2.centrality.me/public/rata/ws';
const collectionName = 'Centrality Team Sheep';
const collectionId = 0;

function NFTCollection(props) {
  const [tokenInfo, setTokenInfo] = useState(undefined);
  const [cardHovered, setCardHovered] = useState(true);
  const [nftAttribute, setNftAttribute] = useState(undefined);
  const [tokenOwner, setTokenOwner] = useState(undefined);
  const [tokenOwnerName, setTokenOwnerName] = useState(undefined);
  const {api, allAccounts, extensionEnabled} = props;
  const toggleHover = () => setCardHovered(!cardHovered);
  const addToken = async() => {
      const account = allAccounts[0];
      const attributes = [
          {'Url': nftAttribute}, {'Text': tokenOwnerName}];

      const tokenExtrinsic = api.tx.nft.mintUnique(collectionId, tokenOwner, attributes, null, null);
      let payload = {};
      if (extensionEnabled) {
          const injector = await web3FromSource(account.meta.source);
          payload = {signer: injector.signer};
      }
      // If extension is enabled use the first account from extension, else use keypair(rata) from Keyring to sign the transaction
      tokenExtrinsic.signAndSend(extensionEnabled ? account.address : account, payload, ({ status }) => {
          if (status.isInBlock) {
              console.log(`Completed at block hash #${status.asInBlock.toString()}`);
          }
      }).catch((error) => {
          console.log(':( transaction failed', error);
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
        {tokenInfo?.map(({tokenId, attributes, owner}) => {
          const {collectionId, seriesId, serialNumber} = tokenId;
          const key = `${collectionId.toString()}_${seriesId.toString()}_${serialNumber.toString()}`;
          attributes = attributes.toJSON();
          owner = owner.toString()
          return (
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div>
                  <img
                      key={key}
                      width="300px"
                      height="300px"
                      src={attributes[0].Url}
                      onMouseEnter={toggleHover}
                      onMouseLeave={toggleHover}
                      alt="Not Found"
                  />
                </div>
              </div>
              <div className="flip-card-back">
                <h3>Token Number: {seriesId.toString()}</h3>
                <h3>Token Name: {attributes[1].Text}</h3>
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
  const filteredSpecTypes = Object.keys(specTypes)
      .filter(key => typeof specTypes[key] !== 'function')
      .reduce((obj, key) => {
          obj[key] = specTypes[key];
          return obj;
          }, {});
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
        types: filteredSpecTypes,
        userExtensions: cennznetExtensions,
      };
  return metadata;
}

function App() {
  const [api, setApi] = useState(undefined);
  const [allAccounts, setAllAccounts] = useState(undefined);
  const [extensionEnabled, setExtensionEnabled] = useState(false);

  useEffect( () => {
      if (!api) {
          const apiInstance = new ApiPromise({provider: url, registry});
          apiInstance.on('ready', async () => {
              const extensions = await web3Enable('my nft dapp');
              let allAccounts;
              let extensionEnabled = false;
              const keyring = new Keyring({type: 'sr25519'});
              const rata = keyring.addFromUri('//Rata');
              if (extensions.length === 0) {
                  // If extension is not installed use keyring to sign
                  allAccounts = [rata];
              } else {
                  const polkadotExtension = extensions.find(ext => ext.name === 'polkadot-js');
                  const metadata = polkadotExtension.metadata;
                  const checkIfMetaUpdated = localStorage.getItem(`EXTENSION_META_UPDATED`);
                  if (!checkIfMetaUpdated) {
                      const metadataDef = await extractMeta(apiInstance);
                      await metadata.provide(metadataDef);
                      localStorage.setItem(`EXTENSION_META_UPDATED`, 'true');
                  }
                  allAccounts = await web3Accounts();
                  if (allAccounts.length === 0) {
                      // If extension is installed but has 0 accounts, use keyring to sign transaction.
                      allAccounts = [rata];
                  } else {
                      extensionEnabled = true;
                  }
              }
              setExtensionEnabled(extensionEnabled);
              setAllAccounts(allAccounts);
              setApi(apiInstance);
          });
      }
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
        <h3 className="neonText">Collection: {collectionName}</h3>
      </div>
      <NFTCollection extensionEnabled={extensionEnabled} api={api} allAccounts={allAccounts}></NFTCollection>
    </div>
  );
}

export default App;
