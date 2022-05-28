import React, {useState, useEffect, useContext} from 'react'
import NavbarCSS from './Navbar.module.css'
import { NavLink, Link, useHistory} from 'react-router-dom'
import NavButton from './NavButton'
import {AuthContext} from "../App"
import rocketLogo from '../rocketLogo.png'
import spaceLaunchTxt from '../spaceLaunchTxt.png'
import lightSpeed from '../lightSpeed.png'
import rocketSmoke from '../rocketSmoke.png'
import rocketStars from '../rocketStars.png'

import axios from 'axios'

const Navbar = ({onClick}) => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)
    
    // instantiate history.
    const history = useHistory();

     // set menu bar state.
     const[state, setState] = useState({menuOpen: false, fade: false});

     // reset state when clicking a link in nav bar.
     const handleOnClick = () =>
     {
         onClick();
         setState( currentState => {
             return { ...currentState, fade: false, menuOpen: false}
             })
     }
 

 
     //toggle menu click state.
     const handleMenuClick = () => {
             setState( currentState => {
             return { ...currentState, fade: true, menuOpen: !currentState.menuOpen}
             })
         };
     // when transition ends, end transition (set fade to false)
     const onTransitionEnd = (e) => {
             
                 setState(currentState => {
                 return {...currentState, fade: false}
                 })
             
             
             }; 

    // handle scrolling for useEffect(). When scrolling and menu is open, close the menu (with faded animation). 
    const handleOnScroll = (e) => { 
        window.onscroll = () => {
            if(state.menuOpen==true)
            {   
                setState( currentState => {
                
                    return { ...currentState, fade: true, menuOpen: false}
                })
            }
            };
    };
    // handle clicking login, enable the hover for login screen.
    const handleLoginOn = () => {
        document.documentElement.style.overflow = "hidden";
        setAuthState( currentAuthState=> {
            return { ...currentAuthState, loginOn: !currentAuthState.loginOn}
        })
    };
    // useEffect for navbar scrolling. Only rerun when opening or closing menu.    
    useEffect(()=> {
        window.addEventListener('scroll', handleOnScroll());
        return () => {
            window.removeEventListener('scroll', handleOnScroll());
            };
    }, [state.menuOpen] )
  
    // for logging out.
    const logout = async () => {
        console.log("hit logout")
        const response = await axios
            .get('/api/users/logout')
            .then( res => {
                setAuthState( currentAuthState =>{ 
                    return {...currentAuthState, username: "", UserId: "", authStatus: false}
                  });
                console.log("updated auth state: " , authState)
                history.push("/")
            })
            .catch( (err) => {
                console.log("logout failed..")
            });
    }
    // for logging in.
    const login = async () => {
        
    }

    const handleSignUp = async () => {
        setAuthState( currentAuthState=> {
            return { ...currentAuthState, signUp: !currentAuthState.signUp}
        })
    }
    return (
        authState.authStatus
        ?
            <div  onTransitionEnd={onTransitionEnd} className={ `${NavbarCSS.containerMain}   ${state.fade ? NavbarCSS.transitionLoggedIn : '' } ` }> 
                <div className={NavbarCSS.navLinkItemsLoggedIn}>
                    <div className={NavbarCSS.navHomeLoggedIn}>
                        <NavLink exact to="/" className={`${NavbarCSS.navHomeAnchorLoggedIn} }`} > 
                            <img className = {NavbarCSS.rocketLogoLoggedIn} src= {rocketStars}/>    
                            <img className = {NavbarCSS.spaceLaunchTxtLoggedIn} src= {spaceLaunchTxt}/>    
                        </NavLink> 
                    </div>                
                </div>
                <div className={NavbarCSS.navMain2LoggedIn}>
                    <div className={`${NavbarCSS.navPostsContainerLoggedIn}`}><NavLink className={`${NavbarCSS.navPostsAnchorLoggedIn} ${NavbarCSS.specialUnderlineClass} `} to="/blog"   > POSTS </NavLink> </div> 
                    <NavButton
                        menuOpen={state.menuOpen}
                        onClick={handleMenuClick}
                        fade={state.fade}
                        onEnd={onTransitionEnd}
                    />
                </div>
                <div className={` ${state.menuOpen ? NavbarCSS.openLoggedIn : NavbarCSS.deactivate } `}>
                    <div className={NavbarCSS.navMainLoggedIn}>
                        <ul className={NavbarCSS.navMainUlLoggedIn}>
                            <li className={NavbarCSS.accountHeader}> {authState.username}  </li>
                            <li className={`${NavbarCSS.navMainLiPostsLoggedIn}`}><NavLink className={`${NavbarCSS.navMainAnchorLoggedIn} ${NavbarCSS.specialUnderlineClass} `} to="/blog"   > POSTS </NavLink> </li>
                            <li className={NavbarCSS.navMainLiLoggedIn}> <Link className={`${NavbarCSS.navMainAnchorLoggedIn} ${NavbarCSS.specialUnderlineClass}`} to ={`/user/${authState.UserId}`}> PROFILE </Link></li>
                            <li className={`${NavbarCSS.navMainLiLoggedIn} `}><div className={`${NavbarCSS.logoutButton} ${NavbarCSS.navMainAnchorLoggedIn}`} onClick={() => logout()} type = "button"> LOGOUT </div> </li>
                        </ul>
                    </div>
                </div>
                
            </div>
        :
            <div  onTransitionEnd={onTransitionEnd} className={ `${NavbarCSS.containerMain}  ${state.menuOpen ? NavbarCSS.open : '' } ${state.fade ? NavbarCSS.transition : '' } ` }> 
                <div className={NavbarCSS.navLinkItems}>
                    <div className={NavbarCSS.navHome}>
                        <NavLink exact to="/" className={`${NavbarCSS.navMainAnchor} }`} > 
                            <img className = {NavbarCSS.rocketLogo} src= {rocketStars}/>    
                            <img className = {NavbarCSS.spaceLaunchTxt} src= {spaceLaunchTxt}/>    
                        </NavLink> 
                    </div>
                    <div className={NavbarCSS.navMain}>
                        <ul className={NavbarCSS.navMainUl}>
                            <li className={`${NavbarCSS.navMainLiPosts}`}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.specialUnderlineClass} `} to="/blog"   > POSTS </NavLink> </li>
                            {!authState.authStatus ? 
                                (<><li className={` ${NavbarCSS.navMainLi}`} onClick={handleLoginOn}>  <div className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.specialUnderlineClass} `}>LOGIN</div>  </li>
                                <li className={NavbarCSS.navMainLi} onClick={handleSignUp}><div className={`${NavbarCSS.signupClass} ${NavbarCSS.specialButtn}`}    >  SIGNUP</div> </li> </>) 
                                : 
                                (<><li className={NavbarCSS.navMainLi}> <Link className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.specialUnderlineClass}`} to ={`/user/${authState.UserId}`}> PROFILE </Link></li>
                                <li className={`${NavbarCSS.navMainLi} `}><div className={`${NavbarCSS.logoutButton} ${NavbarCSS.navMainAnchor}`} onClick={() => logout()} type = "button"> LOGOUT </div> </li></>)}
                        </ul>
                    </div>
                </div>
                <div className={`${NavbarCSS.navPostsContainer}`}><NavLink className={`${NavbarCSS.navPostsAnchor} ${NavbarCSS.specialUnderlineClass} `} to="/blog"   > POSTS </NavLink> </div> 
                <NavButton
                    menuOpen={state.menuOpen}
                    onClick={handleMenuClick}
                    fade={state.fade}
                    onEnd={onTransitionEnd}
                />
            </div>

    )
}

export default Navbar