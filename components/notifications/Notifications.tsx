import { ethers } from "ethers";
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import LSP1UniversalReceiverDelegate from '@erc725/erc725.js/schemas/LSP1UniversalReceiverDelegate.json'
import { useAccount } from "wagmi";
import { LSPFactory } from '@lukso/lsp-factory.js';

const Notifications = () => {
  const { address } = useAccount()

  const provider = new ethers.providers.Web3Provider(window.lukso);

  const notify = async () => {
    const myErc725Contract = new ERC725(LSP1UniversalReceiverDelegate as ERC725JSONSchema[], address, 'https://rpc.testnet.lukso.network');

    console.log(myErc725Contract.options.schemas)

    const test = await myErc725Contract.fetchData(['LSP1UniversalReceiverDelegate']);
    console.log("test", test)

    const decode = myErc725Contract.decodeData([
      {
        keyName: "LSP1UniversalReceiverDelegate",
        value:
        "0x0000000000F49F9818D746b4b999A9E449F675bb"
      },
    ]);

    console.log("decode", decode)

    const lspFactory = new LSPFactory(provider, {
      chainId: 4201,
    });

  }
  return (
    <div className="flex w-full h-full bg-white shadow rounded-15">
      <div>
        <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={notify}>Test</div>
      </div>
    </div>
  );
};

export default Notifications;