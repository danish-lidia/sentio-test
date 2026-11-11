"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

import dETHAbi from "@/lib/abis/dETH.json"
import sETHAbi from "@/lib/abis/sETH.json"
import governanceAbi from "@/lib/abis/governance.json"
import stakingDashboardAbi from "@/lib/abis/stakingDashboard.json"

const DETH_ADDRESS = process.env.NEXT_PUBLIC_DETH_ADDRESS || ""
const SETH_ADDRESS = process.env.NEXT_PUBLIC_SETH_ADDRESS || ""
const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS || ""
const STAKING_DASHBOARD_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DASHBOARD_ADDRESS || ""

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
const EXPLORER_URL = "https://sepolia.etherscan.io"

type Web3ContextType = {
  account: string | null
  provider: ethers.JsonRpcProvider | null
  signer: ethers.JsonRpcSigner | null
  dETHContract: ethers.Contract | null
  sETHContract: ethers.Contract | null
  governanceContract: ethers.Contract | null
  stakingDashboardContract: ethers.Contract | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
  chainId: number | null
  refreshBalances: () => Promise<void>
  networkName: string
  ethBalance: string | null
  dETHBalance: string | null
  sETHBalance: string | null
  dETHAvailable: boolean
  sETHAvailable: boolean
  balancesLoading: boolean
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  dETHContract: null,
  sETHContract: null,
  governanceContract: null,
  stakingDashboardContract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  chainId: null,
  refreshBalances: async () => {},
  networkName: "",
  ethBalance: null,
  dETHBalance: null,
  sETHBalance: null,
  dETHAvailable: Boolean(DETH_ADDRESS),
  sETHAvailable: Boolean(SETH_ADDRESS),
  balancesLoading: false,
})

export const useWeb3 = () => useContext(Web3Context)

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [dETHContract, setDETHContract] = useState<ethers.Contract | null>(null)
  const [sETHContract, setSETHContract] = useState<ethers.Contract | null>(null)
  const [governanceContract, setGovernanceContract] = useState<ethers.Contract | null>(null)
  const [stakingDashboardContract, setStakingDashboardContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState("")
  const [hasShownConnectToast, setHasShownConnectToast] = useState(false)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [dETHBalance, setDETHBalance] = useState<string | null>(null)
  const [sETHBalance, setSETHBalance] = useState<string | null>(null)
  const [balancesLoading, setBalancesLoading] = useState(false)

  const { toast } = useToast()

  const fetchBalances = async (address: string) => {
    try {
      setBalancesLoading(true)
      const rpcProvider = new ethers.JsonRpcProvider(RPC_URL)

      const bal = await rpcProvider.getBalance(address)
      setEthBalance(ethers.formatEther(bal))

      if (DETH_ADDRESS) {
        try {
          const dETH = new ethers.Contract(DETH_ADDRESS, dETHAbi, rpcProvider)
          const dETHBal = await dETH.balanceOf(address)
          setDETHBalance(ethers.formatEther(dETHBal))
        } catch (error) {
          console.error("Error fetching dETH balance:", error)
          setDETHBalance(null)
        }
      }

      if (SETH_ADDRESS) {
        try {
          const sETH = new ethers.Contract(SETH_ADDRESS, sETHAbi, rpcProvider)
          const sETHBal = await sETH.balanceOf(address)
          setSETHBalance(ethers.formatEther(sETHBal))
        } catch (error) {
          console.error("Error fetching sETH balance:", error)
          setSETHBalance(null)
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error)
    } finally {
      setBalancesLoading(false)
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const userAddress = accounts[0]

        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        const currentChainId = Number.parseInt(chainIdHex, 16)

        if (currentChainId !== CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${CHAIN_ID.toString(16)}`,
                    chainName: "Sepolia",
                    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                    rpcUrls: [RPC_URL],
                    blockExplorerUrls: [EXPLORER_URL],
                  },
                ],
              })
            } else {
              throw switchError
            }
          }
        }

        const directProvider = new ethers.JsonRpcProvider(RPC_URL)
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await browserProvider.getSigner()
        const network = await directProvider.getNetwork()

        setNetworkName("Connected")
        setAccount(userAddress)
        setProvider(directProvider)
        setSigner(web3Signer)
        setIsConnected(true)
        setChainId(Number(network.chainId))

        try {
          if (DETH_ADDRESS) {
            setDETHContract(new ethers.Contract(DETH_ADDRESS, dETHAbi, web3Signer))
          }
          if (SETH_ADDRESS) {
            setSETHContract(new ethers.Contract(SETH_ADDRESS, sETHAbi, web3Signer))
          }
          if (GOVERNANCE_ADDRESS) {
            setGovernanceContract(new ethers.Contract(GOVERNANCE_ADDRESS, governanceAbi, web3Signer))
          }
          if (STAKING_DASHBOARD_ADDRESS) {
            setStakingDashboardContract(new ethers.Contract(STAKING_DASHBOARD_ADDRESS, stakingDashboardAbi, web3Signer))
          }
        } catch (contractError) {
          console.error("Error initializing contracts:", contractError)
          toast({
            title: "Contract Initialization Error",
            description: "There was an error initializing the smart contracts.",
            variant: "destructive",
          })
        }

        await fetchBalances(userAddress)

        if (!hasShownConnectToast) {
          toast({
            title: "Wallet Connected",
            description: `Connected to ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`,
          })
          setHasShownConnectToast(true)
        }
      } catch (error) {
        console.error("Error connecting wallet:", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Metamask Not Found",
        description: "Please install Metamask to use this application",
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setSigner(null)
    setIsConnected(false)
    setHasShownConnectToast(false)
    setEthBalance(null)
    setDETHBalance(null)
    setSETHBalance(null)

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  const refreshBalances = async () => {
    if (account) {
      await fetchBalances(account)
    }
  }

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await fetchBalances(accounts[0])
        } else {
          setAccount(null)
          setIsConnected(false)
          setHasShownConnectToast(false)
          setEthBalance(null)
          setDETHBalance(null)
          setSETHBalance(null)
        }
      })

      window.ethereum.on("chainChanged", async (chainId: string) => {
        const newChainId = Number.parseInt(chainId, 16)
        setChainId(newChainId)

        if (newChainId !== CHAIN_ID) {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia",
            variant: "destructive",
          })
          setIsConnected(false)
          setNetworkName("")
          setHasShownConnectToast(false)
          setEthBalance(null)
          setDETHBalance(null)
          setSETHBalance(null)
        } else {
          setNetworkName("Connected")
          if (account) {
            await fetchBalances(account)
          }
        }
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [account])

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            connectWallet()
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }
    checkConnection()
  }, [])

  // Refresh balances every 15 seconds when connected
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isConnected && account) {
      intervalId = setInterval(() => {
        refreshBalances()
      }, 15000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isConnected, account])

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        dETHContract,
        sETHContract,
        governanceContract,
        stakingDashboardContract,
        connectWallet,
        disconnectWallet,
        isConnected,
        chainId,
        refreshBalances,
        networkName,
        ethBalance,
        dETHBalance,
        sETHBalance,
        dETHAvailable: Boolean(DETH_ADDRESS),
        sETHAvailable: Boolean(SETH_ADDRESS),
        balancesLoading,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
