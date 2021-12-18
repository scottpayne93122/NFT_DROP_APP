import contract from "../contract/contract.json";
import Web3 from "web3";
import { useState, useEffect } from "react";
import {useForm} from 'react-hook-form';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import "../styles/styles.css";

const initialInfo = {
  connected: false,
  status: null,
  account: null,
  contract: null
};

const initialDropsState = {
  loading: false,
  list: [],
}

const DropList = () => {
  const [info, setInfo] = useState(initialInfo);
  const [drops, setDrops] = useState(initialDropsState);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  

  const init = async () => {
    if(window.ethereum?.isMetaMask) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      if(networkId == 4) { 
        let web3 = new Web3(window.ethereum);
        setInfo({
        ...initialInfo,
        connected: true,
        account: accounts[0],
        contract: new web3.eth.Contract(contract.abi, contract.address),
        });
      } else {
        setInfo({ 
        ...initialInfo, 
        status: "You need to be on the ethereum test network." 
        });
      }
    } else {
      setInfo({ ...initialInfo, status: "You need MetaMask." });
    }
  };
  
  const initOnChanged = () => {
    if(window.ethereum){
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      
    }
  };

  const getDrops = async () => {
    setDrops((prevState) => ({
      ...prevState,
      loading: true,
    }));
    info.contract.methods
    .getDrops()
    .call()
    .then((res) => {
      console.log(res);
      setDrops({ 
        loading: false,
        list: res,
      });
    })
    .catch((err) => {
      console.log(err);
      setDrops(initialDropsState);
    });
  };

  const onSubmit = data => {
    let newData = {
      name: data.name,
      imageUri: data.imageUri,
      description: data.description,
      socialHandle: data.socialHandle,
      websiteUri: data.websiteUri,
      price: data.price,
      supply: Number(data.supply),
      presale: Number(data.presale),
      onSale: Number(data.onSale),
      chain: Number(data.chain),
      approved: false,
    };
  
    info.contract.methods
      .addDrop(Object.values(newData))
      .send({ from: info.account })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    init();
    initOnChanged();
  }, []);

  return(
    <div>
    <div className={"header"}>
      <h3>Drop City</h3>
    </div>
    <div className={"content"}>
      <Tabs>
      <TabList>
        <Tab>Upcoming Drops</Tab>
        <Tab>List Your Drop</Tab>
      </TabList>
      <div className="introText">
        <p>Drop city is an NFT drop listing app. Users can upload their own NFT projects and once approved by an admin they can be listed below. All listings are blockchain transactions. 
          
          Sorry for the poor styling. This project is about learning functionality. You must use the rinkeby test net for this app to function currently. </p>
      </div>
      <TabPanel>
        <button className = "button" onClick={() => getDrops()}>Get Drops</button>
        {drops.loading ? <p>Loading</p> : null}
        <div style={{height: 50}}></div>       
        {drops.list.map((item) => {
          return (
            <div className={"dropContainer"}>
                <div>
                  <div className={"dropText"}>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div style={{height: 20}}></div> 
                  <img 
                  className={"dropImage"}
                    alt={"drop image"}  
                    src={item.imageUri} 
                  />

                </div>
              
                <div className={"dropText"}>
                  <p>Twitter: {item.socialHandle}</p>
                  <p>Website: {item.websiteUri}</p>
                </div>
                <div className={"dropText"}>
                  <p>Total Supply: {item.supply}</p>
                  <p>Price: {item.price}</p>
                  <p>Presale Date: {item.presale}</p>
                  <p>Sale Date: {item.onSale}</p>
                </div>
              
            </div>
          );
        })}
      </TabPanel>
      <TabPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-box">
            <h5 className = "form-step"> List Your Drop </h5>
              
              <input placeholder="Name" {...register("name")} />
              <br />
              
              <input placeholder="Image Uri"{...register("imageUri")} />
              <br />
              
              <input placeholder="Description"{...register("description")} />
              <br />
              
              <input placeholder="Social Handle"{...register("socialHandle")} />
              <br />

              <input placeholder="Website Uri"{...register("websiteUri")} />
              <br />
              
              <input placeholder="Price (ETH)"{...register("price")} />
              <br />
              
              <input placeholder="Supply"{...register("supply")} />
              <br /> 
              
              <input placeholder="Presale"{...register("presale")} />
              <br />
              
              <input placeholder="On Sale"{...register("onSale")} />
              <br />
              
              <input placeholder="Chain Id # (use 4)"{...register("chain")} />
              <br />
              
            </div>
            <button className={"button"} input type="submit">Submit</button>
          </form>
        
      
      </TabPanel>
    </Tabs>
  </div> 
  </div>

  );
  
};

export default DropList;



