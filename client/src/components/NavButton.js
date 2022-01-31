import React, {useState} from 'react'
import NavButtonCSS from "./NavButton.module.css"

const NavButton = ({menuOpen, onClick, fade, onEnd}) => {

    return (
        <div className= {NavButtonCSS.navContainer}>
            <div className= {`${NavButtonCSS.menuButtnContainer}  `} onClick={onClick}  >
                <div className={NavButtonCSS.menuButtn}>
                    <div className= {`${NavButtonCSS.menuButtnTop} ${menuOpen ? NavButtonCSS.menuButtnTopActive : '' } `}> </div> 
                    <div className= {`${NavButtonCSS.menuButtnBottom}  ${menuOpen ? NavButtonCSS.menuButtnBottomActive : '' } `}> </div> 
                </div>
            </div>
        </div>
    )
}

export default NavButton
