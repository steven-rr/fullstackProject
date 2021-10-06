import React, {useState, useEffect, useContext} from 'react'
import NavbarCSS from './Navbar.module.css'
import { NavLink, Link, useHistory} from 'react-router-dom'
import {AuthContext} from "../App"
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
    return (
        <div className={ `${NavbarCSS.containerMain}` }> 
            <div className={NavbarCSS.navLinkItems}>
                <div className={NavbarCSS.navHome}>
                    <NavLink exact to="/" className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} activeClassName={NavbarCSS.active}> HOME</NavLink> 
                </div>

                <div className={NavbarCSS.navMain}>
                    <ul className={NavbarCSS.navMainUl}>
                        <li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="/blog"   activeClassName={NavbarCSS.active}> POSTS </NavLink> </li>
                        {!authState.authStatus ? 
                            (<><li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="/form"   activeClassName={NavbarCSS.active}>  SIGNUP</NavLink> </li>
                            <li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="/login"  activeClassName={NavbarCSS.active}>   LOGIN </NavLink> </li> </>) 
                            : 
                            (<><li className={NavbarCSS.navMainLi}> <Link to ={`/user/${authState.UserId}`}>{authState.username} </Link></li>
                            <li className={NavbarCSS.navMainLi}><button onClick={() => logout()} type = "button">   LOGOUT </button> </li></>)}

                        
                    </ul>
                </div>
            </div>
            
          
            
        </div>
    )
}

export default Navbar