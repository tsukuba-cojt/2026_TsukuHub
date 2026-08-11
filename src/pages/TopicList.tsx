import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { topics } from "../data/homeContent";
import "../styles/listing/ListingPages.css";

function TopicList() {
  return (
    <div className="listingPage">
      <Globalnav />
      <main className="listingShell">
        <header className="listingHero">
          <span>TOPICS</span>
          <h1>トピック一覧</h1>
          <p>注目度の高いキャンパス情報やおすすめ記事をまとめています。</p>
        </header>

        <section className="listingCardGrid" aria-label="トピック一覧">
          {topics.map((topic) => {
            const TopicIcon = topic.icon;
            return (
              <article className="listingCard isTopic" key={topic.title}>
                <div className={`listingIcon ${topic.tagClass}`}>
                  <TopicIcon aria-hidden="true" />
                </div>
                <span className={`listingTag ${topic.tagClass}`}>{topic.tag}</span>
                <h2>{topic.title}</h2>
                <time>{topic.date}</time>
              </article>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TopicList;
