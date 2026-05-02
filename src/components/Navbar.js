import logo from '../assets/logo.svg';
import resume from "../assets/resume.pdf"

export default function Navbar() {
    return (
    <div className='fixed z-50 bg-dark-500/80 backdrop-blur-md w-full top-0 left-0 px-8 py-4 lg:px-20 xl:px-36 border-b border-batik-gold/30'>
        <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 border border-batik-gold rotate-45 flex items-center justify-center">
                    <span className="rotate-[-45deg] text-batik-gold font-bold text-xs">AA</span>
                </div>
                <span className="font-bold tracking-widest text-batik-gradient hidden sm:block">ARJUNA</span>
            </div>
            <ul className="hidden md:flex">
            <li className="p-4"><a href="#home" className="hover:text-batik-gold transition-colors">About</a></li>
            <li className="p-4"><a href="#skills" className="hover:text-batik-gold transition-colors">Skills</a></li>
            <li className="p-4"><a href="#honors" className="hover:text-batik-gold transition-colors">Honor & Awards</a></li>
            <li className="p-4"><a href="#certs" className="hover:text-batik-gold transition-colors">Certfications</a></li>
            </ul>
            <a href={resume} rel="noreferrer" target="_blank" className=" bg-transparent hover:bg-batik-gold text-batik-gold hover:text-dark-500 rounded-none px-6 py-1 border border-batik-gold transition-all duration-300 font-bold uppercase tracking-tighter">Resume</a>
        </div>
    </div>
    )
}
