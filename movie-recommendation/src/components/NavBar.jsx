import "../css/NavBar.css";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Movie App</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">home</Link>
        <Link to="/favorites">favorites</Link>
      </div>
    </nav>
  );
}
export default NavBar;
