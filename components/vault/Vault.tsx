import { ethers } from "ethers";
import { useAccount } from "wagmi";
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { VaultSchema } from '../schema/DeployedVaults'

const Vault = () => {
  const { address } = useAccount()

  const test = async () => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const myErc725Contract = new ERC725(VaultSchema, address, "https://rpc.testnet.lukso.network");

    const fetch = await myErc725Contract.fetchData(`VaultsDeployed[]`)

    console.log("DATA FETCHED", fetch)
  }

  const notify = async () => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);

    const vaultFactory = new ethers.ContractFactory(
      LSP9Vault.abi,
      LSP9Vault.bytecode,
    );

    const erc725 = new ERC725(
      VaultSchema,
      address,
      'https://rpc.testnet.lukso.network'
    );

    try {

      console.log("setdata");

      const array = ['0xfB8a1f71669B1171dbc50fac869f02223EcfEA8F', '0x368731AE2E23e72751C432A935A2CF686Bb72AAC']

      const data = erc725.encodeData([
        {
          keyName: 'VaultsDeployed[]',
          value: array,
        }
      ]);

      const setData = await myUniversalProfile.setDataBatch(data.keys, data.values);

      const receipt = await setData.wait()

      console.log("RESULTS ARE IN", receipt);

      /*const deployVault = await vaultFactory.connect(signer).deploy(address);
      
      const receipt = await deployVault.wait();

      console.log("Vault deployed: ", receipt)*/
    } catch (error) {
  
      console.log("ERRPR", error)
    }

  }
  return (
    <div className="flex w-full h-full bg-white shadow rounded-15">
      <div>
        <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={notify}>Test</div>
        <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={test}>EGAgasga</div>
      </div>
    </div>
  );
};  

export default Vault;