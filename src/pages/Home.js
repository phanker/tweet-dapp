import React from "react"
import "./Home.css"
import { useState, useRef } from "react"
import { defaultImgs } from "../defaultimgs"
import { TextArea, Icon, Button, Loading, useNotification } from "web3uikit"
import TweetInFeed from "../components/TweetInFeed"
import { contractAddresses, Tweet } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { config } from "dotenv"
import axios from "axios"
import { AccountContext } from "../AccountContext"
import { AlertCircle } from "feather-icons"

config()

const Home = () => {
    const { userInfo } = React.useContext(AccountContext)
    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tweetAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const inputFile = useRef(null)
    const [selectedFile, setSelectedFile] = useState()
    const [theFile, setTheFile] = useState()
    const [tweet, setTweet] = useState()
    const [ipfsHash, setIpfsHash] = useState()
    const [isUploading, setIsUploading] = useState(false)

    const onImageClick = () => {
        inputFile.current.click()
    }

    const changeHandler = (event) => {
        const img = event.target.files[0]
        setTheFile(img)
        setSelectedFile(URL.createObjectURL(img))
        setIsUploading(true)
        sendFileToIPFS(img)
    }

    const {
        runContractFunction: saveTweet,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: Tweet.abi,
        contractAddress: tweetAddress,
        functionName: "tweet",
        msgValue: Moralis.Units.ETH(0.01),
        params: {
            content: tweet,
            picOfTweet: ipfsHash ? ipfsHash : "no pic",
            timeofTweet: new Date().getTime(),
        },
    })

    const dispatch = useNotification()
    const handleNewNotification = () => {}

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
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
                setIpfsHash(resFile.data.IpfsHash)
                setIsUploading(false)
            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            }
        }
    }

    const handleTweetClick = async () => {
        if (!tweet || tweet.trim() === "") {
            dispatch({
                type: "warning",
                message: "Please enter your tweet content.",
                title: "Content Notification",
                position: "topR",
                icon: "bell",
            })
            return
        }
        await saveTweet({
            onSuccess: handleSuccess,
            onError: (error) => console.log(error),
        })
    }

    return (
        <>
            <div className='pageIdentify'>Home</div>
            <div className='mainContent'>
                {isLoading || isFetching ? (
                    <Loading
                        fontSize={15}
                        size={15}
                        spinnerColor='#2E7DAF'
                        spinnerType='wave'
                        text='Loading...'
                    />
                ) : (
                    ""
                )}
                <div className='profileTweet'>
                    <img
                        src={userInfo && userInfo.image ? userInfo.image : defaultImgs[0]}
                        className='profilePic'
                    ></img>
                    <div className='tweetBox'>
                        <TextArea
                            label=''
                            placeholder='Type here field'
                            name='tweetTextArea'
                            onBlur={function noRefCheck() {}}
                            type='text'
                            width='95%'
                            onChange={(e) => setTweet(e.target.value)}
                        ></TextArea>
                        {selectedFile && <img src={selectedFile} className='tweetImg'></img>}

                        <div className='imgOrTweet'>
                            <div className='imgDiv' onClick={onImageClick}>
                                <input
                                    type='file'
                                    name='file'
                                    ref={inputFile}
                                    onChange={changeHandler}
                                    style={{ display: "none" }}
                                />
                                <Icon fill='#1DA1F2' size={20} svg='image'></Icon>
                            </div>

                            <div className='tweetOptions'>
                                <div
                                    className='tweet'
                                    onClick={handleTweetClick}
                                    style={{
                                        pointerEvents:
                                            isUploading || isLoading || isFetching
                                                ? "none"
                                                : "auto",
                                        opacity: isUploading || isLoading || isFetching ? 0.5 : 1,
                                    }}
                                >
                                    Tweet
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <TweetInFeed profile={false} />
            </div>
        </>
    )
}

export default Home
