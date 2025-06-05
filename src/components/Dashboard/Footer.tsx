import github from "../../assets/github.svg";
import "../../styles/Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-copyright">@nady4</p>
      <p className="footer-dev-bsas">
        Full Stack Developer - Buenos Aires, Argentina
      </p>
      <p className="footer-mail">nadyajerochim@gmail.com</p>
      <a href="https://www.github.com/nady4" rel="noreferrer" target="_blank">
        <img src={github} alt="github" className="footer-repo-logo" />
      </a>
    </footer>
  );
}

export default Footer;
