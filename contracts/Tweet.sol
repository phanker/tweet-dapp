// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Not_Enough_ETHs();

contract Tweet {
    struct TweetInfo {
        string content;
        address tweeter;
        string picOfTweet;
        uint timeofTweet;
    }

    struct UserInfo {
        address account;
        string name;
        string photo;
        string bio;
        string backGroundPic;
    }

    struct TweetDetail {
        address account;
        string photo;
        string name;
        string content;
        uint timeofTweet;
        string picOfTweet;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    address payable private immutable owner;

    TweetInfo[] private allOfTweets;

    mapping(address => uint[]) private teetersOfUser;

    mapping(address => UserInfo) private allOfUser;

    function getUser(address account) public view returns (UserInfo memory) {
        return allOfUser[account];
    }

    function modifyUserInfo(
        string memory name,
        string memory photo,
        string memory backGroundPic,
        string memory bio
    ) public {
        UserInfo storage currentUser = allOfUser[msg.sender];
        currentUser.name = name;
        currentUser.photo = photo;
        currentUser.backGroundPic = backGroundPic;
        currentUser.bio = bio;
    }

    function tweet(
        string memory content,
        string memory picOfTweet,
        uint timeofTweet
    ) public payable {
        if (msg.value < 0.01 ether) {
            revert Not_Enough_ETHs();
        }
        TweetInfo memory tweetInfo = TweetInfo({
            content: content,
            picOfTweet: picOfTweet,
            tweeter: msg.sender,
            timeofTweet: timeofTweet
        });

        uint[] storage tweets = teetersOfUser[msg.sender];
        tweets.push(allOfTweets.length);
        allOfTweets.push(tweetInfo);
        owner.transfer(msg.value);
    }

    function queryTweetByAccount(
        address account
    ) public view returns (TweetDetail[] memory) {
        uint[] memory tweetIndexs = teetersOfUser[account];
        TweetDetail[] memory tweetDetails = new TweetDetail[](
            tweetIndexs.length
        );
        UserInfo memory user = allOfUser[account];
        for (uint i = 0; i < tweetIndexs.length; i++) {
            TweetInfo memory userTweet = allOfTweets[tweetIndexs[i]];
            tweetDetails[i] = TweetDetail({
                account: account,
                name: user.name,
                photo: user.photo,
                content: userTweet.content,
                timeofTweet: userTweet.timeofTweet,
                picOfTweet: userTweet.picOfTweet
            });
        }
        return tweetDetails;
    }

    function queryAllTweet() public view returns (TweetDetail[] memory) {
        TweetDetail[] memory tweetDetails = new TweetDetail[](
            allOfTweets.length
        );
        for (uint i = 0; i < allOfTweets.length; i++) {
            TweetInfo memory userTweet = allOfTweets[i];
            UserInfo memory user = allOfUser[userTweet.tweeter];
            tweetDetails[i] = TweetDetail({
                account: userTweet.tweeter,
                name: user.name,
                photo: user.photo,
                content: userTweet.content,
                timeofTweet: userTweet.timeofTweet,
                picOfTweet: userTweet.picOfTweet
            });
        }
        return tweetDetails;
    }
}
