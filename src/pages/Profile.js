import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import "./Profile.css"
import { defaultImgs } from "../defaultimgs"
import TweetInFeed from "../components/TweetInFeed"
import { AccountContext } from "../AccountContext"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { config } from "dotenv"
config()
const Profile = () => {
    const { userInfo } = useContext(AccountContext)

    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    return (
        <>
            <div className='pageIdentify'>Profile</div>
            <img
                className='profileBanner'
                src={
                    userInfo && userInfo.backGroundPic && userInfo.backGroundPic != "no pic"
                        ? process.env.REACT_APP_IPFS_GATEWAY + userInfo.backGroundPic
                        : defaultImgs[1]
                }
            ></img>
            <div className='pfpContainner'>
                <img
                    className='profilePFP'
                    src={userInfo && userInfo.image ? userInfo.image : defaultImgs[0]}
                ></img>
                <div className='profileName'>
                    {userInfo && userInfo.name
                        ? userInfo.name
                        : Buffer.from(account).toString("base64").slice(0, 8)}
                </div>
                <div className='profileWallet'>{account}</div>
                <div className='profileBio'>{userInfo?.bio}</div>
                <Link to='/settings'>
                    <div className='profileEdit'>Edit Profile</div>
                </Link>
                <div className='profileTabs'>
                    <div className='profileTab'>Your Tweets</div>
                </div>

                <TweetInFeed profile={true}></TweetInFeed>
            </div>
        </>
    )
}

export default Profile
