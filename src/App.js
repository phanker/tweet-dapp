import React, { useEffect, useContext } from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import "./App.css"
import Sidebar from "./components/Sidebar"
import Rightbar from "./components/Rightbar"
import { useMoralis } from "react-moralis"
import { Icon, Button, ConnectButton } from "web3uikit"
import { ethers } from "ethers"
import { AccountProvider } from "./AccountContext"
import { contractAddresses, Tweet } from "./constants"
const App = () => {
    const {
        isInitialized,
        enableWeb3,
        isWeb3Enabled,
        isWeb3EnableLoading,
        account,
        Moralis,
        deactivateWeb3,
        chainId: chainIdHex,
    } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((newAccount) => {
            console.log(`Account changed to ${newAccount}`)
            if (newAccount == null) {
                window.localStorage.removeItem("user")
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null Account found")
            }
            window.localStorage.removeItem("user")
            window.location.reload()
        })
    }, [])

    async function logout() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        await signer.provider.send("wallet_requestPermissions", [
            {
                eth_accounts: {},
            },
        ])
    }

    return (
        <>
            {raffleAddress ? (
                account ? (
                    <AccountProvider>
                        <div className='page'>
                            <div className='sideBar'>
                                <Sidebar />
                                <div
                                    className='logout'
                                    onClick={async () => {
                                        // logout()
                                        await window.ethereum.request({
                                            method: "eth_requestAccounts",
                                            params: [{ eth_accounts: {} }],
                                        })
                                        window.localStorage.removeItem("user")
                                        window.localStorage.removeItem("connected")
                                        deactivateWeb3()
                                    }}
                                >
                                    Logout
                                </div>
                            </div>
                            <div className='mainWindow'>
                                <Routes>
                                    <Route path='/' element={<Home />} />
                                    <Route path='/profile' element={<Profile />} />
                                    <Route path='/settings' element={<Settings />} />
                                </Routes>
                            </div>
                            <div className='rightBar'>
                                <Rightbar />
                            </div>
                        </div>
                    </AccountProvider>
                ) : (
                    <div className='loginPage'>
                        <Icon fill='#ffffff' size='40' svg='twitter' />
                        {/* <ConnectButton moralisAuth={false} /> */}
                        <Button
                            text='Connect Wallet'
                            size='regular'
                            disabled={isWeb3EnableLoading}
                            onClick={async () => {
                                // await walletModal.connect()
                                const ret = await enableWeb3()
                                if (typeof ret !== "undefined") {
                                    // depends on what button they picked
                                    if (typeof window !== "undefined") {
                                        window.localStorage.setItem("connected", "injected")
                                        // window.localStorage.setItem("connected", "walletconnect")
                                    }
                                }
                            }}
                        />
                    </div>
                )
            ) : (
                <div className='loginPage'>
                    <h1>Please connect to a supported chain</h1>
                </div>
            )}
        </>
    )
}

export default App
