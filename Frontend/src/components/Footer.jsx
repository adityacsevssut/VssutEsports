import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-left">
          <h3>VSSUT ESPORTS</h3>
          <p>Leveling up the game at VSSUT Burla.</p>
        </div>
        <div className="footer-right">
          <p>&copy; {new Date().getFullYear()} Vssut Esports. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
