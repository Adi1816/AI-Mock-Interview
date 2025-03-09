const Footer = () => {
    return (
      <footer className="text-gray-900 mt-16 md:mt-32">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          
          {/* Brand Name */}
          {/* <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-black">AI Mock Interview</h2>
            <p className="text-sm mt-2">Crack your dream job with AI-driven mock interviews.</p>
          </div>
   */}
          {/* Navigation Links */}
          <div className="flex flex-wrap gap-3 md:gap-6 text-sm">
            <a href="/about" className="hover:text-pink-800 transition">About</a>
            <a href="https://github.com/Adi1816/AI-Mock-Interview" target="blank" className="hover:text-pink-800 transition">Features</a>
            <a href="https://www.linkedin.com/in/aditya-srivastava-12476524a/" target="blank" className="hover:text-pink-800 transition">Contact</a>
            <a href="/privacy" className="hover:text-pink-800 transition">Privacy</a>
          </div>
  
          {/* Social Icons
          <div className="flex gap-4 mt-6 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <i className="fab fa-github text-xl"></i>
            </a>
          </div> */}
  
        </div>
  
        {/* Copyright Section */}
        <div className="flex flex-col justify-center items-center">
        <div className="text-center text-xs border-t border-gray-700 mt-6 p-4">
          © {new Date().getFullYear()} AI Mock Interview. All rights reserved.
        </div>
        <div className="text-center text-xs border-gray-700">Made with ❤️ by <strong><a href="https://linktr.ee/Adi1816" target="blank">Aditya Srivastava</a></strong></div>

        </div>
        
      </footer>
    );
  };
  
  export default Footer;
  