import {useState} from 'react'

// import profile from '../assets/profile.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {faCircleArrowRight, } from "@fortawesome/free-solid-svg-icons";
import {  faGithub, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import hr from '../assets/curve-hr.svg'

export default function Hiro () {

    const [loaded, setLoaded] = useState(true);

    return (
        <>
        {/* {loaded ?
        <div
            className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-white flex flex-col items-center justify-center"
        >Loading...</div>
            :
            null
        } */}
        <div id="home" className="flex w-full h-screen flex-col md:flex-row gap-5 items-center justify-center text-white relative">
            <div className='md:w-3/6 md:p-4 flex justify-center' data-aos="zoom-in">
                <div className="relative">
                    {/* Artistic Batik-Space Circle */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-batik-gold to-space-nebula rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-batik-gold rounded-full flex items-center justify-center relative overflow-hidden bg-dark-500">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='%23D4AF37' stroke-width='1'/%3E%3C/svg%3E")` }}></div>
                        <span className="text-64 font-bold text-batik-gold opacity-50">AA</span>
                        {/* If you had a profile pic, it would go here */}
                    </div>
                </div>
            </div>
            <div className='md:w-3/6' data-aos="fade-right" data-aos-duration="1000" data-aos-offset="100" >
                <div className="flex flex-col w-full mt-8">
                    <h1 className="text-xl text-gray-400">Voyaging through the digital cosmos, I'm</h1>
                    <h1 className="text-5xl font-bold text-batik-gradient mb-2">Arjuna Arrasyid</h1>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-batik-gold">Full Stack Developer</p>
                    <p className="text-md font-light text-gray-400 mt-4 leading-relaxed">
                        Crafting digital experiences where <span className="text-batik-gold font-semibold">Traditional Wisdom</span> meets <span className="text-indigo-300 font-semibold">Future Tech</span>. 
                        Weaving code like a master artisan in the vast celestial canvas.
                    </p>
                </div>

                <ul className='flex mt-6 gap-6 items-center'>
                   <li className="hover:text-batik-gold transition-colors duration-300">
                        <a href='https://github.com/arjuna15' rel="noreferrer" target="_blank"><FontAwesomeIcon size='2xl' icon={faGithub} /></a>
                   </li> 
                    <li className="hover:text-batik-gold transition-colors duration-300">
                        <a href='https://instagram.com/junancok' rel="noreferrer" target="_blank"><FontAwesomeIcon size='2xl' icon={faInstagram} /></a>
                    </li>
                    <li className="hover:text-batik-gold transition-colors duration-300">
                        <a href='https://www.linkedin.com/in/arjuna-arrasyid-2256b2208/' rel="noreferrer" target="_blank"><FontAwesomeIcon size='2xl' icon={faLinkedinIn} /></a>
                    </li>
                </ul>
            </div>
            <img src={hr} className="w-full md:h-2 absolute bottom-0 filter sepia brightness-50 contrast-150" alt="hr" />
        </div>
        </>
    )
}
