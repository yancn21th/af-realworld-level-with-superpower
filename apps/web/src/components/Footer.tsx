import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <Link className="logo-font" to="/">conduit</Link>
        <span className="attribution">An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.</span>
      </div>
    </footer>
  );
}
