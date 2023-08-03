import React, { useEffect, useContext } from "react"
import "./Settings.css"
import { Input, useNotification } from "web3uikit"
import { defaultImgs } from "../defaultimgs"
import { useState, useRef } from "react"
import pfp1 from "../images/pfp1.png"
import pfp2 from "../images/pfp2.png"
import pfp3 from "../images/pfp3.png"
import pfp4 from "../images/pfp4.png"
import pfp5 from "../images/pfp5.png"
import { contractAddresses, Tweet } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { AccountContext } from "../AccountContext"
import { config } from "dotenv"
import axios from "axios"
import { ethers } from "ethers"
import { Chain, OpenSeaPort } from "opensea-js"
config()
const Settings = () => {
    const { userInfo } = useContext(AccountContext)

    const [currentUser, setCurrentUser] = useState()
    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex, web3 } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tweetAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [username, setUsername] = useState()
    const [selectedPFP, setSelectedPFP] = useState()
    const [selectedFile, setSelectedFile] = useState(defaultImgs[1])

    const [theFile, setTheFile] = useState()
    const inputFile = useRef(null)

    const [bio, setBio] = useState()
    // const pfps = [pfp1, pfp2, pfp3, pfp4, pfp5]
    const [pfps, setPfps] = useState()

    const [identifier, setIdentifier] = useState()

    const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY
    // console.log(`IPFS_GATEWAY=${process.env.REACT_APP_PINATA_API_URL}`)
    // console.log(`IPFS_GATEWAY=${process.env.REACT_APP_PINATA_API_KEY}`)
    // console.log(`IPFS_GATEWAY=${process.env.REACT_APP_PINATA_API_SECRET}`)
    const {
        runContractFunction: saveEdits,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: Tweet.abi,
        contractAddress: tweetAddress,
        functionName: "modifyUserInfo",
        params: {
            name: username,
            photo: identifier ? identifier : "no photo",
            backGroundPic: selectedFile,
            bio: bio,
        },
    })

    // 使用 useEffect 钩子监听 account 的变化
    useEffect(() => {
        // 在获取到 account 后更新 displayAccount 的值
        if (userInfo) {
            setUsername(userInfo?.name)
            if (!userInfo || !userInfo.backGroundPic || "no pic" == userInfo.backGroundPic) {
                // && "no pic" != selectedFile
                //                     ? IPFS_GATEWAY + selectedFile
                //                     : defaultImgs[1]
                // console.log("userInfo.backGroundPic=", userInfo.backGroundPic)
                setSelectedFile(defaultImgs[1])
            } else {
                setSelectedFile(userInfo.backGroundPic)
            }

            setBio(userInfo?.bio)
        }

        // Wallet address
        // const address = "elanhalpern.eth"

        // Alchemy URL
        const baseURL = process.env.REACT_APP_ALCHEMY_BASE_URL
        const url = `${baseURL}/getNFTs/?owner=${account}`

        const config = {
            method: "get",
            url: url,
        }

        // Make the request and print the formatted response:
        axios(config)
            .then((response) => {
                // console.log(response["data"])
                const resData = response["data"]
                if (resData) {
                    const nfts = resData.ownedNfts
                    setPfps(nfts)
                    if (userInfo?.photo && userInfo?.photo != "no photo") {
                        const nftInfo = JSON.parse(userInfo.photo)
                        const tokenId = nftInfo?.tokenId.tokenId

                        let choosedNFT = {}
                        choosedNFT.contract = { address: nftInfo.address }
                        choosedNFT.id = { tokenId: tokenId }
                        setSelectedPFP(choosedNFT)
                        setIdentifier(userInfo.photo)
                    }
                    //

                    // console.log(nfts)
                }
            })
            .catch((error) => console.log("error", error))
    }, [userInfo, account])

    const onBannerClick = () => {
        inputFile.current.click()
    }

    const changeHandler = (event) => {
        const img = event.target.files[0]
        setTheFile(img)
        // setSelectedFile(URL.createObjectURL(img))
        sendFileToIPFS(img)
        // console.log(process.env.REACT_APP_PINATA_API_KEY)
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            window.location.reload()
            // updateUIValues()
            // handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }
    const dispatch = useNotification()
    function showDispath(msg) {
        dispatch({
            type: "error",
            message: msg,
            title: "Content Notification",
            position: "topR",
            icon: "bell",
        })
    }
    const handleModifyClick = async () => {
        if (!username || username.trim() === "") {
            showDispath("Please enter your name.")
            return
        }
        if (!bio || bio.trim() === "") {
            showDispath("Please enter your bio.")
            return
        }
        await saveEdits({
            onSuccess: handleSuccess,
            onError: (error) => console.log(error),
        })
    }

    const sendFileToIPFS = async (fileImg) => {
        if (fileImg) {
            try {
                const formData = new FormData()
                formData.append("file", fileImg)

                const resFile = await axios({
                    method: "post",
                    url: process.env.REACT_APP_PINATA_API_URL,
                    data: formData,
                    headers: {
                        pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
                        pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET,
                        "Content-Type": "multipart/form-data",
                    },
                })

                setSelectedFile(resFile.data.IpfsHash)
                // IPFS_GATEWAY+resFile.data.IpfsHash

                //Take a look at your Pinata Pinned section, you will see a new file added to you list.
            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            }
        }
    }

    function changeImg(ImgIndex, nft) {
        setSelectedPFP(pfps[ImgIndex])
        console.log("nft,", nft.contract.address, nft.id)
        let nftJson = {}
        nftJson.address = nft.contract.address
        nftJson.tokenId = nft.id
        console.log("nft,", nft.contract.address, nft.id)
        // const yourChoise = nfts[ImgIndex]
        console.log(JSON.stringify(nftJson))
        setIdentifier(JSON.stringify(nftJson))
    }

    return (
        <>
            <div className='pageIdentify'>Settings</div>

            <div className='settingsPage'>
                <Input
                    label='Name'
                    name='NameChange'
                    width='100%'
                    labelBgColor='#141d26'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <Input
                    label='Bio'
                    name='bioChange'
                    width='100%'
                    labelBgColor='#141d26'
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <div className='pfp'>
                    Profile Image (Your NFTs)
                    <div className='pfpOptions'>
                        {pfps?.map((e, i) => {
                            return (
                                <>
                                    <img
                                        src={e.metadata.image}
                                        className={
                                            selectedPFP?.contract.address === e.contract.address &&
                                            selectedPFP?.id?.tokenId == e?.id?.tokenId
                                                ? "pfpOptionSelected"
                                                : "pfpOption"
                                        }
                                        onClick={() => changeImg(i, e)}
                                    ></img>
                                </>
                            )
                        })}
                    </div>
                </div>

                <div className='pfp'>
                    Profile Banner
                    <div className='pfpOptions'>
                        <img
                            src={
                                defaultImgs[1] == selectedFile
                                    ? defaultImgs[1]
                                    : IPFS_GATEWAY + selectedFile
                            }
                            onClick={onBannerClick}
                            className='banner'
                        ></img>
                        <input
                            type='file'
                            name='file'
                            ref={inputFile}
                            onChange={changeHandler}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {isLoading || isFetching ? (
                    <div className=' spinner h-8 w-8 border-b-2 rounded-full'></div>
                ) : (
                    <div className='save' onClick={handleModifyClick}>
                        Save
                    </div>
                )}
            </div>
        </>
    )
}

export default Settings
