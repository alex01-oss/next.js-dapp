interface EthereumProvider {
    isMetaMask?: boolean
    request: (args: { method: string; params?: Array<any> }) => Promise<any>
    on?: (event: string, callback: (...args: any[]) => void) => void
  }
  
  interface Window {
    ethereum?: EthereumProvider
  }
  