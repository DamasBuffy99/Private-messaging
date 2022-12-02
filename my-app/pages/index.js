import {Contract, providers, utils } from 'ethers';
import Head from 'next/head';
import React, {useEffect, useState, useRef} from 'react';
import Web3Modal from "web3modal";
import {abi, PRIVATE_MESSAGERIE_CONTRACT_ADDRESS} from "../constants";
import styles from '../styles/Home.module.css';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [member,setMember] = useState(false);
  const [banned,setBanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numMember, setNumMember] = useState("0");
  const [address, setAddress] = useState("");
  const [text, setText] = useState("");
  const web3ModalRef = useRef();

  const addNewMember = async () =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.addNewMember();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You sucessfully send your voice to add a new member");
      await checkIfIsMember();
    }catch(err){
      console.error(err);
    }  
  }

  const sendWarning = async () =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.sendWarning();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You sucessfully send a warning to a member");
      await checkIfIsMember();
    }catch(err){
      console.error(err);
    }
  }

  const sendMessage = async () =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.sendMessage();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You sucessfully send a message");
    }catch(err){
      console.error(err);
    }
  }

  const readMessage = async () =>{
    try{
      const provider = await getProviderOrSigner(false);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const message = await messagerieContract.readMessage();
      window.alert("You sucessfully send a message");
    }catch(err){
      console.error(err);
    }
  }

  const changeMemberName = async () =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.changeMemberName();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You sucessfully change your name");
    }catch(err){
      console.error(err);
    }
  }

  const checkIfIsMember = async () => {
    try{
      const provider = await getProviderOrSigner(false);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const bool = await messagerieContract.check();
    }catch(err){
      console.error(err);
    }
  }


  const getProviderOrSigner = async (needSigner=false) =>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 5){
      window.alert("Change the network to the tesnet Goerli");
      throw new Error("Change the network to the tesnet Goerli");
    }

    if(needSigner){
      const signer = await web3Provider.getSigner();
      return signer;
    }
    return provider;
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      setWalletConnected();

      const _member = checkIfIsMember();
      //set an interval to get the messages 
      setInterval(async function(){
        await readMessage;
      }, 5*1000);
    }
  },[walletConnected]);

  const renderButtom = () =>{
    if(!walletConnected){
      return(
        <button onClick={setWalletConnected} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
    if(loading){
      return <button className={styles.button}>Loading...</button>
    }
    if(!member){
      return(
        <div className={styles.description}>
          You are not a member of the family
        </div>
      );
    }
    if(banned){
      return(
        <div className={styles.description}>
          Who are you guy! You can't get access to the family. You are banned! What are you do ?
        </div>
      );
    }
    if(member){
      return(
      <div>
        <div className={styles.description}>
          Welcome to the family
        </div>
        <div style={{ display: "flex-col" }}>
          <div>
            <input
              type="number"
              placeholder="Address"
              // BigNumber.from converts the `e.target.value` to a BigNumber
              onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
              className={styles.input}
            />
          </div>
          <button
            className={styles.button}
            disabled={!(tokenAmount > 0)}
            onClick={() => mintCryptoDevToken(tokenAmount)}
          >
            Mint Tokens
          </button>
        </div>
      </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Private Messagerie</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to the family space!</h1>
          <div className={styles.description}>
            It's a space for our family
          </div>
          <div className={styles.description}>
            There are {numMember} members on the family at this moment.
          </div>
          {renderButtom()}
        </div>
        <div>
          <img className={styles.image} src="/ABClogo.jpg" />
        </div>
      </main>

      <footer className={styles.footer}>
        Made with &#10084; by ABC Group 7
      </footer>
    </div>
  )
}
