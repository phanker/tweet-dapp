// AccountContext.js
import { createContext, useState } from "react"

export const AccountContext = createContext()

export function AccountProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null)

    return (
        <AccountContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </AccountContext.Provider>
    )
}
