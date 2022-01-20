import React from 'react'
import FooterCSS from "./Footer.module.css"

const Footer = () => {
    return (
        <div className={FooterCSS.footerContainer}>
            <div className={FooterCSS.textStyle}> Designed and Developed by Steven Rivadeneira </div>
        </div>
    )
}

export default Footer
