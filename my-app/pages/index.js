import {Contract, providers, utils } from 'ethers';
import Head from 'next/head';
import React, {useEffect, useState, useRef} from 'react';
import Web3Modal from "web3modal";
import {abi, PRIVATE_MESSAGERIE_CONTRACT_ADDRESS} from "../constants";
import styles from '../styles/Home.module.css';

export default function Home() {
  const [member,setMember] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberMember, setNumberMember] = useState("0");
  const [numberMessages, setNumberMessages] = useState("0");
  const [address, setAddress] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const web3ModalRef = useRef();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewMember = async (address) =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.addNewMember(address);
      setLoading(true);
      await tx.wait();
      await getNumMemb();
      setLoading(false);
      window.alert("You sucessfully send your voice to add a new member");
    }catch(err){
      console.error(err);
    }  
  }

  const sendWarning = async (address) =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.sendWarning(address);
      setLoading(true);
      await tx.wait();
      await getNumMemb();
      setLoading(false);
      window.alert("You sucessfully send a warning to a member");
    }catch(err){
      console.error(err);
    }
  }

  const sendMessage = async (message) =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.sendMessage(message);
      setLoading(true);
      await tx.wait();
      await getNumMessages();
      setLoading(false);
      window.alert("You sucessfully send a message");
    }catch(err){
      console.error(err);
    }
  }

  const fetchMessageById = async (id) =>{
    try{
      const provider = await getProviderOrSigner();
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const message = await listMessages(id);
      const parsedMessage = {
        messageId : id,
        author: message.author.toString(),
        text:message.text.toString(),
        date:new Date(parseInt(message.date.toString())*1000)
      }
      return parsedMessage;
    }catch(err){
      console.error(err);
    }
  } 

  const fetchAllMessages = async () =>{
    try{
      const listMessages = [];
      for(let i=0; i<numberMessages;i++){
        const message = await fetchMessageById(i);
        listMessages.push(message);
      }
      setMessages(listMessages);
      return listMessages;
    }catch(err){
      console.error(err);
    }
  }

  /*const readMessage = async () =>{
    try{
      const provider = await getProviderOrSigner(false);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const message = await messagerieContract.readMessage();
      window.alert("You sucessfully send a message");
    }catch(err){
      console.error(err);
    }
  }*/

  const getNumMemb = async () =>{
    try{
      const provider = await getProviderOrSigner();
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const numberMember = await messagerieContract.numberMember();
      setNumberMember(numberMember.toString());
    }catch(err){
      console.error(err);
    }
  }

  const getNumMessages = async () =>{
    try{
      const provider = await getProviderOrSigner();
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, provider);
      const numberMessages = await messagerieContract.numberMessages();
      setNumberMessages(numberMessages.toString());
    }catch(err){
      console.error(err);
    }
  }

  const changeMemberName = async (text) =>{
    try{
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const tx = await messagerieContract.changeMemberName(text);
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
      const signer = await getProviderOrSigner(true);
      const messagerieContract = new Contract(PRIVATE_MESSAGERIE_CONTRACT_ADDRESS, abi, signer);
      const address = await signer.getAddress();
      const bool = await messagerieContract.checkIfIsMember(address);
      if(bool){
        setMember(true);
      }
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
      connectWallet().then(()=>{
        checkIfIsMember();
        getNumMemb();
        getNumMessages();
        fetchAllMessages();
      });
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

    if(member){
      return(
      <div>
        <div className={styles.description}>
          Welcome back to the family
        </div>
        <div style={{ display: "flex-col" }}>
          <div>
            <input
              type="text"
              placeholder="Address"
              // BigNumber.from converts the `e.target.value` to a BigNumber
              onChange={(e) => setAddress(e.target.value)}
              className={styles.input}
            />
          </div>
          <button
            /*className={styles.button}
            disabled={!(address > 0)}*/
            onClick={() => addNewMember(address)}
          >
            Add New Member
          </button>
          <button
            /*className={styles.button}
            disabled={!(address > 0)}*/
            onClick={() => sendWarning(address)}
          >
            Send a warning to this member
          </button>
        </div>
        

        <div style={{ display: "flex-col" }}>
          <div>
            <input
              type="text"
              placeholder="Write your message"
              // BigNumber.from converts the `e.target.value` to a BigNumber
              onChange={(e) => setText(e.target.value)}
              className={styles.input}
            />
          </div>
          <button
            /*className={styles.button}
            disabled={!(text > 0)}*/
            onClick={() => sendMessage(text)}
          >
            Push your Message
          </button>
        </div>
      </div>
      );
    }
  };

  const rend = () =>{
    if (member && numberMessages === 0){
      return(
        <div className={styles.description}>There are any message yet</div>
      );
    }

    if (member && numberMessages != 0){
      return(
        <div>
            {messages.map((p,index) =>{
              <div key={index}>
                <p>Message ID: {p.messageId.toLocaleString()}</p>
                <p>author: {p.author}</p>
                <p>Text: {p.text}</p>
                <p>Date: {p.date}</p>
              </div>
            })}
          </div>
      );
    }

    if (5){
      return(
        <div className={styles.description}>7</div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>Private Messaging</title>
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
            There are {numberMember.toString()} members on the family at this moment.
            There are {numberMessages.toString()} messages sent by this channel.
          </div>
          {renderButtom()}
          {rend()}
        </div>
        <div>
          <img className={styles.image} src="/ABClogo.jpg" />
        </div>
      </main>

      <footer className={styles.footer}>
        Made with &#10084; by ABC Group L
      </footer>
    </div>
  )
}
