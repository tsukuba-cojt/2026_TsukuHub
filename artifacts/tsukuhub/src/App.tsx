import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookmarkProvider } from "@/context/BookmarkContext";

// Pages
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Detail from "@/pages/Detail";
import PostReview from "@/pages/PostReview";
import Bookmarks from "@/pages/Bookmarks";
import MyPage from "@/pages/MyPage";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/detail/:id" component={Detail} />
      <Route path="/post-review" component={PostReview} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/mypage" component={MyPage} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BookmarkProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </BookmarkProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
