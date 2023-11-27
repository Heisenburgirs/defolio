const TransactionModal = ({ successMsg, message1, message2, message3, onBackButtonClick, transactionStep, setTransactionStep } : { successMsg: string, message1: string, message2: string, message3: string, onBackButtonClick: () => void, transactionStep: number, setTransactionStep: (step: number) => void }) => {
  //"Waiting for Confirmation", "Transaction Submitted", "Transaction Successful"
  
  const stepText = [message1, message2, message3, "Transaction Failed"];
  const stepImages = [
    <div key="loading" className="loading opacity-75 w-full flex justify-center items-center p-16">
      <span className="loading__dot"></span>
      <span className="loading__dot"></span>
      <span className="loading__dot"></span>
    </div>,
    
    <div key="success" className="success-animation"></div>,
  
    <div key="error" className="error-animation"></div>
  ];  

  return (
    <div className={`flex w-full h-full flex-col justify-center items-center mt-[-100px] ${(transactionStep === 3 || transactionStep === 4) && "gap-8"}`}>
      {
        (transactionStep === 1 || transactionStep === 2) &&

        stepImages[0]
      }
      {
        transactionStep === 3 &&
        
        stepImages[1]
      }
      {
        transactionStep === 4 &&
        
        stepImages[2]
      }

      <div onClick={() => {setTransactionStep(4)}} className={`text-purple text-medium font-bold`}>
        {transactionStep === 1 && stepText[0]}
        {transactionStep === 2 && stepText[1]}
        {transactionStep === 3 && successMsg }
        {transactionStep === 4 && stepText[3]}
      </div>

      {(transactionStep === 3 || transactionStep === 4) && <button className="bg-lightPurple rounded-15 py-3 px-16 text-white" onClick={onBackButtonClick}>Back</button>}
    </div>
  )
}

export default TransactionModal