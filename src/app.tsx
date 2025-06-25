import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider } from "@solidjs/meta";
import { getRequestEvent, isServer } from "solid-js/web";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <MetaProvider>
      <Router
        url={isServer ? getRequestEvent()?.request.url : ""}
        root={(props) => (
          <Suspense>
            <div class="flex flex-col flex-1 items-stretch">
              <Nav />
              <div class="flex flex-col flex-1 items-stretch">
                {props.children}
              </div>
              <Footer />
            </div>
          </Suspense>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
