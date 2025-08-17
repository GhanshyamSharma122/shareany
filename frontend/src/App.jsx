import { Retrieve } from "./Retrive";
import { useState, useEffect } from "react";
import { Store } from "./Store";
function App(){
  const pathname = window.location.pathname;
  const [mode,setMode]=useState("home")
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.mode) {
        setMode(event.state.mode);
      } else if (mode !== "home") {
        setMode("home");
      } else {
        window.close();
        if (!window.closed) {
          window.location.href = "about:blank";
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    if (mode === "home") {
      window.history.replaceState({ mode: "home" }, "", window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [mode]);

  function retrieval(){
    setMode("retrieve");
    window.history.pushState({ mode: "retrieve" }, "", window.location.href);
  }
  function store(){
    setMode("store");
    window.history.pushState({ mode: "store" }, "", window.location.href);
  }
  const MainWindow=function(){
    return <>
      <div className="mainwin">
 
        <button className="btn" onClick={retrieval}>Retrieve</button>
      <button className="btn" onClick={store}>Store</button>
      </div>
    </>
  }
  return (
  <>
    <header className="header">
      ShareAny
    </header>
    <p className="help">
      Share files and text with just one click
    </p>
    {pathname!=="/" ? <Retrieve keyword={pathname.substring(1,pathname.length)}/>:mode==="home"?<MainWindow/>:mode==="retrieve"?<Retrieve/>:<Store/>}
  </>)
}
export default App;