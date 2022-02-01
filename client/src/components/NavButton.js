import React, {useState, useContext} from 'react'
import NavButtonCSS from "./NavButton.module.css"
import {AuthContext} from "../App"

const NavButton = ({menuOpen, onClick, fade, onEnd}) => {
    const {authState, setAuthState} = useContext(AuthContext)

    return (
        <div className= {`${NavButtonCSS.navContainer}  ${authState.authStatus ? NavButtonCSS.navContainerActivated: ""}`}>
            <div className= {`${NavButtonCSS.menuButtnContainer}  ${authState.authStatus ? NavButtonCSS.menuButtnContainerActivated: ""}`} onClick={onClick}  >
                <div className={NavButtonCSS.menuButtn}>
                    <div className= {`${NavButtonCSS.menuButtnTop} ${menuOpen ? NavButtonCSS.menuButtnTopActive : '' } `}> </div> 
                    <div className= {`${NavButtonCSS.menuButtnBottom}  ${menuOpen ? NavButtonCSS.menuButtnBottomActive : '' } `}> </div> 
                </div>
            </div>
        </div>
    )
}

export default NavButton
