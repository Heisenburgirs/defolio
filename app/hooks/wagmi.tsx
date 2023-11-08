import * as React from 'react'
import { useSignMessage } from 'wagmi'
import { recoverMessageAddress } from 'viem'
import { useState } from 'react'

export function SignMessage() {
  const recoveredAddress = React.useRef<string>()
  const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()
  const [address, setRecoveredAddress] = useState<string>()

  React.useEffect(() => {
    ;(async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        })
        setRecoveredAddress(recoveredAddress)
      }
    })()
  }, [signMessageData, variables?.message])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const message = formData.get('message')
        signMessage({ message })
      }}
    >
      <label htmlFor="message">Enter a message to sign</label>
      <textarea
        id="message"
        name="message"
        placeholder="The quick brown fox…"
      />
      <button disabled={isLoading}>
        {isLoading ? 'Check Wallet' : 'Sign Message'}
      </button>

      {signMessageData && (
        <div>
          <div>Recovered Address: {recoveredAddress.current}</div>
          <div>Signature: {signMessageData}</div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  )
}
