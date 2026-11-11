"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWeb3 } from "@/components/web3-provider"
import { Button } from "@/components/ui/button"
import { Menu, X, Wallet, LogOut, ChevronDown, ExternalLink, Copy, Check, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CoinVaultLogo } from "@/components/CoinVault-logo"

const fmt = (balance: string | null) =>
  balance !== null ? Number.parseFloat(balance).toFixed(4) : "..."

function BalanceRow({
  label,
  balance,
  available,
  loading,
}: {
  label: string
  balance: string | null
  available: boolean
  loading: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-lightblue-600 w-10">{label}</span>
      <span className="text-sm font-mono font-medium tabular-nums">
        {!available ? (
          <span>—</span>
        ) : loading && balance === null ? (
          <span className="text-lightblue-400">...</span>
        ) : (
          fmt(balance)
        )}
      </span>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const {
    account,
    connectWallet,
    disconnectWallet,
    isConnected,
    refreshBalances,
    ethBalance,
    dETHBalance,
    sETHBalance,
    dETHAvailable,
    sETHAvailable,
    balancesLoading,
  } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Deposit", href: "/deposit" },
    { name: "Stake", href: "/stake" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Governance", href: "/governance" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalances()
    setIsRefreshing(false)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-[#67c4ff]/90 backdrop-blur-md shadow-md" : "bg-[#67c4ff]"}`}
      >
        <div className="container mx-auto px-4 py-3">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <Link href="/" className="flex items-center gap-2">
                <CoinVaultLogo size="sm" textColor="text-white" />
              </Link>

              <div className="flex items-center space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-1 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors relative group ${
                      pathname === item.href
                        ? "text-white font-semibold"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                    {pathname === item.href && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isConnected ? (
                <>
                  <div className="hidden wide:flex items-center gap-3 bg-lightblue-50 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lightblue-500 font-medium">ETH</span>
                        <span className="font-mono font-semibold text-lightblue-900 tabular-nums">
                          {balancesLoading && ethBalance === null ? (
                            <span className="text-lightblue-400">...</span>
                          ) : (
                            fmt(ethBalance)
                          )}
                        </span>
                      </div>
                      <span className="text-lightblue-200">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lightblue-500 font-medium">dETH</span>
                        <span className="font-mono font-semibold text-lightblue-900 tabular-nums">
                          {!dETHAvailable ? (
                            <span>—</span>
                          ) : balancesLoading && dETHBalance === null ? (
                            <span className="text-lightblue-400">...</span>
                          ) : (
                            fmt(dETHBalance)
                          )}
                        </span>
                      </div>
                      <span className="text-lightblue-200">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lightblue-500 font-medium">sETH</span>
                        <span className="font-mono font-semibold text-lightblue-900 tabular-nums">
                          {!sETHAvailable ? (
                            <span>—</span>
                          ) : balancesLoading && sETHBalance === null ? (
                            <span className="text-lightblue-400">...</span>
                          ) : (
                            fmt(sETHBalance)
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-lightblue-500 hover:text-lightblue-700"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </div>

                  {/* Account dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-lightblue-200 bg-white hover:bg-lightblue-50">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          <span className="font-medium">
                            {account
                              ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                              : ""}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 text-lightblue-500" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Connected Wallet</span>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          Connected
                        </Badge>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Address */}
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-lightblue-700">Address</span>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-lightblue-500 hover:text-lightblue-700"
                              onClick={copyAddress}
                            >
                              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${account}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-6 w-6 flex items-center justify-center text-lightblue-500 hover:text-lightblue-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                        <div className="bg-lightblue-50 p-2 rounded-md text-sm font-mono mb-3">
                          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                        </div>
                      </div>

                      <DropdownMenuSeparator />

                      {/* Balances */}
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-lightblue-500 uppercase tracking-wide">
                            Balances
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-lightblue-400 hover:text-lightblue-600"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                          >
                            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                          </Button>
                        </div>
                        <BalanceRow label="ETH" balance={ethBalance} available={true} loading={balancesLoading} />
                        <BalanceRow label="dETH" balance={dETHBalance} available={dETHAvailable} loading={balancesLoading} />
                        <BalanceRow label="sETH" balance={sETHBalance} available={sETHAvailable} loading={balancesLoading} />
                      </div>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={disconnectWallet}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect Wallet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={connectWallet} className="bg-white hover:bg-white/90 text-[#67c4ff]">
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <CoinVaultLogo size="sm" showText={true} className="flex" textColor="text-white" />
            </Link>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white text-lightblue-700 border-lightblue-200">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                      <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500 text-xs">
                        •
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Balances</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-lightblue-400 hover:text-lightblue-600"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-1">
                      <BalanceRow label="ETH" balance={ethBalance} available={true} />
                      <BalanceRow label="dETH" balance={dETHBalance} available={dETHAvailable} />
                      <BalanceRow label="sETH" balance={sETHBalance} available={sETHAvailable} />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-1 pb-2">
                      <div className="text-xs text-lightblue-500 font-mono truncate">
                        {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={connectWallet} size="sm" className="bg-white text-[#67c4ff] hover:bg-white/90">
                  Connect Wallet
                </Button>
              )}

              <button className="navbar-mobile-trigger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu animate-fade-in bg-[#67c4ff]/95">
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
          <div className="mobile-menu-links">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-white hover:text-lightblue-100 ${pathname === item.href ? "font-bold" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!isConnected && (
              <Button
                onClick={() => {
                  connectWallet()
                  setMobileMenuOpen(false)
                }}
                className="mt-4 bg-white text-lightblue-700 hover:bg-lightblue-50"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14" />
    </>
  )
}
