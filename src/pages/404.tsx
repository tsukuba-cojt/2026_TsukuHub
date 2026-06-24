import Notfound404 from "../components/utility/print404";
import Globalnav from "../components/utility/Globalnav";

function NotFound404() {
  return (
    <div className="homepage">
    <Globalnav />
      <main className="homepageLayout">
        <Notfound404 />
      </main>

    </div>
  );
}

export default NotFound404;