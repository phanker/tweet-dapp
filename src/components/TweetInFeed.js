import React, { useEffect, useState } from "react"
import "./TweetInFeed.css"
import filecoinOrbit from "../images/filecoinOrbit.jpeg"
import canoe from "../images/canoe.jpeg"
import { defaultImgs } from "../defaultimgs"
import pfp4 from "../images/pfp4.png"
import pfp5 from "../images/pfp5.png"
import { Icon } from "web3uikit"
import { contractAddresses, Tweet } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { config } from "dotenv"
import { ethers } from "ethers"
import { Chain, OpenSeaPort } from "opensea-js"
import { AccountContext } from "../AccountContext"
config()
const TweetInFeed = (param1) => {
    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tweetAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // console.log(abi, chainId, tweetAddress)
    // const { runContractFunction: getUser } =
    const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY
    let functionName = "queryAllTweet"
    let params = {}
    if (param1.profile) {
        functionName = "queryTweetByAccount"
        params.account = account
    }

    const { runContractFunction: queryAllTweet } = useWeb3Contract({
        abi: Tweet.abi,
        contractAddress: tweetAddress,
        functionName: functionName,
        params: params,
    })

    const [srcImgs, setSrcImgs] = React.useState()
    const [tweets, setTweets] = React.useState()
    const [imageLoaded, setImageLoaded] = React.useState(false)

    const getTweetFunction = async () => {
        const tweetInfos = await queryAllTweet()
        let simages = {}
        for (let index = 0; index < tweetInfos.length; index++) {
            const element = tweetInfos[index]
            getSrcImg(element, simages, tweetInfos)
        }

        setTweets(tweetInfos)
        setSrcImgs(simages)
        // 判断是否有新的图片链接添加到 simages 中
        const isNewImageAdded = Object.keys(simages).some((account) => !srcImgs[account])
        if (isNewImageAdded) {
            setSrcImgs(simages)
        }
    }

    const getSrcImg = (item, simages, tweetInfos) => {
        if (item?.photo && item?.photo != "no photo") {
            const nftInfo = JSON.parse(item.photo)
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
                        simages[item.account] = getNFTResponse.nft.image_url
                        setSrcImgs(simages)
                    }
                } catch (error) {
                    console.error("Error fetching NFTs:", error)
                }
            }

            fetchNFT()
        } else {
            return pfp5
        }
    }

    const { refreshFeed, setRefreshFeed } = React.useContext(AccountContext)

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    }
    React.useEffect(() => {
        if (isWeb3Enabled || refreshFeed) {
            getTweetFunction()
            setRefreshFeed(false)
            // 检查是否所有图片链接都已经获取到
            // const allImagesLoaded = tweets?.every((tweet) => !!srcImgs && !!srcImgs[tweet.account])
            // console.log(allImagesLoaded)
            // console.log(srcImgs)
            // setImageLoaded(allImagesLoaded) // 设置图片加载状态
        }
    }, [isWeb3Enabled, refreshFeed])

    return (
        <>
            {tweets
                ?.map((item) => (
                    <div className='feedTweet'>
                        <img
                            src={srcImgs && srcImgs[item.account] ? srcImgs[item.account] : pfp5}
                            className='profilePic'
                        ></img>
                        <div className='completeTweet'>
                            <div className='who'>
                                {item.name
                                    ? item.name
                                    : Buffer.from(item.account).toString("base64").slice(0, 8)}
                                <div className='accWhen'>
                                    {new Date(
                                        ethers.BigNumber.from(item.timeofTweet).toNumber(),
                                    ).toLocaleString(options)}
                                </div>
                                {item.account.slice(0, 3) +
                                    "..." +
                                    item.account.slice(account.length - 3)}
                            </div>
                            <div className='tweetContent'>
                                {item.content}
                                {/* Excited about the Filecoin Orbit swag! */}
                                {item.picOfTweet && item.picOfTweet != "no pic" && (
                                    <img
                                        src={IPFS_GATEWAY + item.picOfTweet}
                                        className='tweetImg'
                                    ></img>
                                )}
                            </div>
                            <div className='interactions'>
                                <div className='interactionNums'>
                                    <Icon fill='#3f3f3f' size={20} svg='messageCircle' />
                                </div>
                                <div className='interactionNums'>
                                    <Icon fill='#3f3f3f' size={20} svg='star' />
                                    {/* 12 */}
                                </div>
                                <div className='interactionNums'>
                                    <Icon fill='#3f3f3f' size={20} svg='matic' />
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                .reverse()}

            {/* <div className='feedTweet'>
                <img src={pfp4} className='profilePic'></img>
                <div className='completeTweet'>
                    <div className='who'>
                        IPFS
                        <div className='accWhen'>0x42..314 · 1h</div>
                    </div>
                    <div className='tweetContent'>
                        is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                        has been the industry's standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it to make a type
                        specimen book. It has survived not only five centuries, but also the leap
                        into electronic typesetting, remaining essentially un
                    </div>
                    <div className='interactions'>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='messageCircle' />
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='star' />
                            12
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='matic' />
                        </div>
                    </div>
                </div>
            </div>

            <div className='feedTweet'>
                <img src={pfp5} className='profilePic'></img>
                <div className='completeTweet'>
                    <div className='who'>
                        Filecoin
                        <div className='accWhen'>0x42..314 · 1h</div>
                    </div>
                    <div className='tweetContent'>
                        Thoughts on the new Coca-Cola banana 🥤🍌 flavor?
                    </div>
                    <div className='interactions'>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='messageCircle' />
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='star' />
                            12
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='matic' />
                        </div>
                    </div>
                </div>
            </div>
            <div className='feedTweet'>
                <img src={defaultImgs[0]} className='profilePic'></img>
                <div className='completeTweet'>
                    <div className='who'>
                        Juhizzz
                        <div className='accWhen'>0x42..314 · 1h</div>
                    </div>
                    <div className='tweetContent'>
                        Love spending time on the water 🌊🌅
                        <img src={canoe} className='tweetImg'></img>
                    </div>
                    <div className='interactions'>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='messageCircle' />
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='star' />
                            12
                        </div>
                        <div className='interactionNums'>
                            <Icon fill='#3f3f3f' size={20} svg='matic' />
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    )
}

export default TweetInFeed
