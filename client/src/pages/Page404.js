import React from 'react'
import Page404CSS from "./Page404.module.css"

const Page404 = () => {
    return (
        <div className={Page404CSS.page404Container}>
            <div className={Page404CSS.textStyle}> Not found, sorry!</div>
        </div>
    )
}

export default Page404
