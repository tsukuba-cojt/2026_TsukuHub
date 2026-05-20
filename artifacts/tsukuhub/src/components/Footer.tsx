import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12 mt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary tracking-tight">TsukuHub</h3>
            <p className="text-sm text-muted-foreground">
              筑波大生の「知りたい」が、ここに全部ある。
              授業評価からサークル情報まで、学生生活をサポートする情報ポータル。
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">コンテンツ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search?category=就活・キャリア" className="hover:text-primary">就活・キャリア</Link></li>
              <li><Link href="/search?category=授業・履修" className="hover:text-primary">授業・履修</Link></li>
              <li><Link href="/search?category=サークル・課外活動" className="hover:text-primary">サークル・課外活動</Link></li>
              <li><Link href="/search?category=生活・便利情報" className="hover:text-primary">生活・便利情報</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">サポート</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">よくある質問</Link></li>
              <li><Link href="#" className="hover:text-primary">お問い合わせ</Link></li>
              <li><Link href="#" className="hover:text-primary">情報提供のお願い</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">運営</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">運営団体について</Link></li>
              <li><Link href="#" className="hover:text-primary">利用規約</Link></li>
              <li><Link href="#" className="hover:text-primary">プライバシーポリシー</Link></li>
              <li><Link href="/admin" className="hover:text-primary">管理者ログイン</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TsukuHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
