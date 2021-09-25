import React, {useState, useEffect} from 'react'
import NavbarCSS from './Navbar.module.css'
import {Link, NavLink} from 'react-router-dom'

const Navbar = ({onClick}) => {
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
  
        
    return (
        // <div onTransitionEnd={onTransitionEnd} className={ `${NavbarCSS.containerMain} ${state.menuOpen ? NavbarCSS.open : '' } ${state.fade ? NavbarCSS.transition : '' } ` }>
        <div className={ `${NavbarCSS.containerMain}` }> 
            <div className={NavbarCSS.navLinkItems}>
                <div className={NavbarCSS.navHome}>
                    <NavLink exact to="/" className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} activeClassName={NavbarCSS.active}> HOME</NavLink> 
                </div>

                <div className={NavbarCSS.navMain}>
                    <ul className={NavbarCSS.navMainUl}>
                        <li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="form"   activeClassName={NavbarCSS.active}>  SIGNUP</NavLink> </li>
                        <li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="blog"   activeClassName={NavbarCSS.active}> POSTS </NavLink> </li>
                        <li className={NavbarCSS.navMainLi}><NavLink className={`${NavbarCSS.navMainAnchor} ${NavbarCSS.underline}`} to="login"  activeClassName={NavbarCSS.active}>   LOGIN </NavLink> </li>
                    </ul>
                </div>
            </div>
            
            {/* <NavButton
                menuOpen={state.menuOpen}
                onClick={handleMenuClick}
                fade={state.fade}
                onEnd={onTransitionEnd}
            /> */}
            
        </div>
    )
}

export default Navbar