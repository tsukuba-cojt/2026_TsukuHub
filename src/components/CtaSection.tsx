function CtaSection() {
  return (
    <section className="ctaSection">
      <div className="ctaImage">
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=600"
          alt=""
        />
      </div>

      <div className="ctaContent">
        <h2>
          <span>TsukuHub</span>をもっと活用しよう！
        </h2>
        <p>
          気になる情報を保存したり、自分に合った情報を見つけて、
          充実した筑波大ライフを送ろう！
        </p>

        <div className="ctaButtons">
          <a href="/signup" className="registerButton large">新規登録（無料）</a>
          <a href="/login" className="loginButton large">ログイン</a>
        </div>
      </div>

      <div className="ctaIllust">👨‍🎓📱</div>
    </section>
  );
}

export default CtaSection;