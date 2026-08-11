import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { latestNews } from "../data/homeContent";
import "../styles/listing/ListingPages.css";

function NewsList() {
  return (
    <div className="listingPage">
      <Globalnav />
      <main className="listingShell">
        <header className="listingHero">
          <span>NEWS</span>
          <h1>新着情報一覧</h1>
          <p>TsukuHub に掲載している新着情報をまとめて確認できます。</p>
        </header>

        <section className="listingCardGrid" aria-label="新着情報一覧">
          {latestNews.map((news) => (
            <article className="listingCard" key={news.title}>
              <span className={`listingTag ${news.tagClass}`}>{news.tag}</span>
              <h2>{news.title}</h2>
              <time>{news.date}</time>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default NewsList;
