import React, { useState, useContext } from "react"
import "./Sidebar.css"
import { Link } from "react-router-dom"
import { Logo, Icon } from "web3uikit"
import ipfsLogo from "../images/ipfs-logo.png"
import { defaultImgs } from "../defaultimgs"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { contractAddresses, Tweet } from "../constants"
// dont export from moralis when using react
import { AccountContext } from "../AccountContext"
import { config } from "dotenv"
import { ethers } from "ethers"
import { Chain, OpenSeaPort, OpenSeaSDK } from "opensea-js"
import axios from "axios"
config()

const Sidebar = () => {
    const { userInfo, setUserInfo } = useContext(AccountContext)
    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tweetAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // console.log(Tweet.abi, chainId, tweetAddress)
    const { runContractFunction: getUser } = useWeb3Contract({
        abi: Tweet.abi,
        contractAddress: tweetAddress,
        functionName: "getUser",
        params: { account: account },
    })

    const [username, setUserName] = useState()
    const [user, setUser] = useState()
    const [userPhoto, setUserPhoto] = useState()

    let modifiedUser
    const getUserFunction = async () => {
        const user = await getUser()
        if (user?.name) {
            setUserName(user.name)
        } else {
            setUserName(Buffer.from(account).toString("base64").slice(0, 8))
            // setUserName(account.toString("base64")).slice(0, 8)
        }

        if (user?.photo && user?.photo != "no photo") {
            // TIMEPieces contract address

            const nftInfo = JSON.parse(user.photo)
            const tokenId = ethers.BigNumber.from(nftInfo.tokenId.tokenId).toString()

            // This example provider won't let you make transactions, only read-only calls:
            const provider = new ethers.providers.WebSocketProvider(
                process.env.REACT_APP_SEPOLIA_RPC_URL_WS,
            )
            const fetchNFT = async () => {
                try {
                    // Initialize OpenSeaPort with the desired network
                    const seaport = new OpenSeaPort(provider, {
                        chain: contractAddresses[chainId][3], // Replace with the desired network (e.g., Network.Main)
                    })
                    // Fetch NFTs owned by the specified address
                    const getNFTResponse = await seaport.api.getNFT(
                        contractAddresses[chainId][3],
                        nftInfo.address,
                        tokenId,
                    )
                    if (getNFTResponse.nft) {
                        setUserPhoto(getNFTResponse.nft.image_url)
                        // user.image = getNFTResponse.nft.image_url
                        if (!Object.isExtensible(user)) {
                            // 创建一个新的可拓展对象
                            const modifiedUser = Object.create(null)
                            // 复制user对象的属性到新对象中
                            Object.assign(modifiedUser, user)
                            modifiedUser.image = getNFTResponse.nft.image_url
                            setUserInfo(modifiedUser)
                        } else {
                            user.image = getNFTResponse.nft.image_url
                        }
                    }
                } catch (error) {
                    console.error("Error fetching NFTs:", error)
                }
            }

            fetchNFT()
        }
        setUserInfo(user)
        // window.localStorage.setItem("user", user)
    }

    React.useEffect(() => {
        if (isWeb3Enabled) {
            getUserFunction()
        }
    }, [isWeb3Enabled])
    // getUserFunction()

    return (
        <>
            <div className='siderContent'>
                <div className='menu'>
                    <div className='details'>
                        <img src={ipfsLogo} className='profilePic'></img>
                        <Icon fill='#000000' size={40} svg='fil' />
                        <Logo theme='icon' color='blue' size='regular' />
                    </div>

                    <Link to={{ pathname: "/", state: { user } }} className='link'>
                        <div className='menuItems'>
                            <Icon fill='#ffffff' size={33} svg='list' />
                            Home
                        </div>
                    </Link>
                    <Link to={{ pathname: "/profile", state: { user } }} className='link'>
                        <div className='menuItems'>
                            <Icon fill='#ffffff' size={33} svg='user' />
                            Profile
                        </div>
                    </Link>

                    <Link to={{ pathname: "/settings" }} className='link'>
                        <div className='menuItems'>
                            <Icon fill='#ffffff' size={33} svg='cog' />
                            Settings
                        </div>
                    </Link>
                </div>

                <div className='details'>
                    <img src={userPhoto ? userPhoto : defaultImgs[0]} className='profilePic'></img>
                    <div className='profile'>
                        <div className='who'>{username}</div>
                        <div className='accWhen'>
                            {account.slice(0, 4)}...
                            {account.slice(account.length - 4)}
                            {/* 0x4c...ea32 */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar
