// AccountContext.js
import { createContext, useState } from "react"

export const AccountContext = createContext()

export function AccountProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null)
    const [refreshFeed, setRefreshFeed] = useState(false)
    const [refreshUserInfo, setRefreshUserInfo] = useState(false)

    return (
        <AccountContext.Provider
            value={{
                userInfo,
                setUserInfo,
                refreshFeed,
                setRefreshFeed,
                refreshUserInfo,
                setRefreshUserInfo,
            }}
        >
            {children}
        </AccountContext.Provider>
    )
}
