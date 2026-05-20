import { Link } from "wouter";
import { Search, Menu, User, BookMarked, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const navItems = [
    { label: "ホーム", href: "/" },
    { label: "就活・キャリア", href: "/search?category=就活・キャリア" },
    { label: "授業・履修", href: "/search?category=授業・履修" },
    { label: "サークル", href: "/search?category=サークル・課外活動" },
    { label: "生活", href: "/search?category=生活・便利情報" },
    { label: "イベント", href: "/search?category=イベント・お知らせ" },
    { label: "留学", href: "/search?category=留学・国際交流" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-primary tracking-tight">TsukuHub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none hidden md:block">
            {/* Global Search could go here, but omitted to keep header clean since hero has it */}
          </div>
          <nav className="flex items-center space-x-2">
            <Link href="/bookmarks" className="hidden md:inline-flex">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <BookMarked className="h-5 w-5" />
                <span className="sr-only">Bookmarks</span>
              </Button>
            </Link>
            <Link href="/mypage" className="hidden md:inline-flex">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <User className="h-5 w-5" />
                <span className="sr-only">My Page</span>
              </Button>
            </Link>
            <div className="hidden md:flex space-x-2 ml-2">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">ログイン</Button>
              <Button>新規登録</Button>
            </div>

            {/* Mobile Nav */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden px-2 -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-2 py-1 text-lg transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-4" />
                  <Link href="/bookmarks" className="block px-2 py-1 text-lg">ブックマーク</Link>
                  <Link href="/mypage" className="block px-2 py-1 text-lg">マイページ</Link>
                  <Link href="/admin" className="block px-2 py-1 text-lg text-muted-foreground">管理者（モック）</Link>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" className="w-full">ログイン</Button>
                    <Button className="w-full">新規登録</Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
